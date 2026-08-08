import type {
  BlackjackPayout,
  Card,
  HandOutcome,
  RoundConfig,
  RoundOutcome,
  RoundResultType,
} from "@/types/blackjack";
import { getCardValue } from "./card";
import { getHandTotals, isPair } from "./hand";

export const DEFAULT_MAX_SPLIT_HANDS = 4;

// one player hand while it is still being played
export interface PlayerHandState {
  cards: Card[];
  bet: number;
  doubled: boolean;
  surrendered: boolean;
  fromSplit: boolean;
  /** no further actions allowed (stood, busted, doubled, or a split ace) */
  done: boolean;
  /** actions taken on this hand since it last became a fresh two-card hand */
  actions: number;
}

export function createHand(cards: Card[], bet: number, fromSplit = false): PlayerHandState {
  return { cards, bet, doubled: false, surrendered: false, fromSplit, done: false, actions: 0 };
}

export function getPayoutMultiplier(payout: BlackjackPayout): number {
  if (payout === "3_to_2") return 1.5;
  if (payout === "6_to_5") return 1.2;
  return 1;
}

/** which actions are legal for a hand right now, given the rules and what is left to wager */
export interface LegalActions {
  canHit: boolean;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  isFirstAction: boolean;
}

export function getLegalActions(
  hand: PlayerHandState,
  config: RoundConfig,
  handCount: number,
  budget: number
): LegalActions {
  const { rules } = config;
  const isFirstAction = hand.cards.length === 2 && hand.actions === 0;
  const maxHands = rules.maxSplitHands ?? DEFAULT_MAX_SPLIT_HANDS;
  const bust = getHandTotals(hand.cards).bestTotal >= 21;

  if (hand.done || bust) {
    return { canHit: false, canDouble: false, canSplit: false, canSurrender: false, isFirstAction };
  }

  // splitting aces again is off by default, which is how most tables play it
  const splittingAcesAgain =
    hand.fromSplit && getCardValue(hand.cards[0]) === 11 && rules.resplitAces !== true;

  return {
    canHit: true,
    canDouble: isFirstAction && rules.allowDouble !== false && budget >= hand.bet,
    canSplit:
      isFirstAction &&
      rules.allowSplit !== false &&
      isPair(hand.cards) &&
      handCount < maxHands &&
      budget >= hand.bet &&
      !splittingAcesAgain,
    // surrender is a first-decision-only move and is off the table after a split
    canSurrender: isFirstAction && !hand.fromSplit && rules.allowSurrender !== false,
    isFirstAction,
  };
}

/**
 * Split a hand in place. The second card moves to a new hand and both draw a
 * replacement. Split aces get exactly one card each and cannot act again, and
 * neither resulting 21 counts as a blackjack.
 */
export function splitHand(
  hands: PlayerHandState[],
  index: number,
  drawCard: () => Card
): PlayerHandState[] {
  const hand = hands[index];
  const movedCard = hand.cards.pop()!;
  const newHand = createHand([movedCard, drawCard()], hand.bet, true);

  hand.cards.push(drawCard());
  hand.fromSplit = true;
  // both hands are two fresh cards again, so they may double or resplit
  hand.actions = 0;

  if (getCardValue(movedCard) === 11) {
    hand.done = true;
    newHand.done = true;
  }

  const next = [...hands];
  next.splice(index + 1, 0, newHand);
  return next;
}

/** settle one finished player hand against the dealer's final hand */
export function settleHand(hand: PlayerHandState, dealerCards: Card[]): HandOutcome {
  const playerTotal = getHandTotals(hand.cards).bestTotal;
  const base = {
    bet: hand.bet,
    playerTotal,
    playerCards: hand.cards,
    doubled: hand.doubled,
    fromSplit: hand.fromSplit,
  };

  if (hand.surrendered) {
    return { ...base, result: "surrender", netWin: -(hand.bet / 2), isBust: false };
  }

  if (playerTotal > 21) {
    return { ...base, result: "loss", netWin: -hand.bet, isBust: true };
  }

  const dealerTotal = getHandTotals(dealerCards).bestTotal;

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    return { ...base, result: "win", netWin: hand.bet, isBust: false };
  }
  if (playerTotal < dealerTotal) {
    return { ...base, result: "loss", netWin: -hand.bet, isBust: false };
  }
  return { ...base, result: "push", netWin: 0, isBust: false };
}

/** the dealer only draws when at least one player hand can still be beaten */
export function anyHandLive(hands: PlayerHandState[]): boolean {
  return hands.some((h) => !h.surrendered && getHandTotals(h.cards).bestTotal <= 21);
}

export function aggregateRound(params: {
  hands: HandOutcome[];
  dealerCards: Card[];
  playerBlackjack?: boolean;
  dealerBlackjack?: boolean;
}): RoundOutcome {
  const { hands, dealerCards, playerBlackjack = false, dealerBlackjack = false } = params;
  const netWin = hands.reduce((sum, h) => sum + h.netWin, 0);
  const first = hands[0];

  // a multi-hand round has no single result, so report the direction of the
  // round's cashflow instead
  let result: RoundResultType;
  if (hands.length === 1) {
    result = first.result;
  } else if (netWin > 0) {
    result = "win";
  } else if (netWin < 0) {
    result = "loss";
  } else {
    result = "push";
  }

  return {
    result,
    bet: hands.reduce((sum, h) => sum + h.bet, 0),
    netWin,
    playerTotal: first.playerTotal,
    dealerTotal: getHandTotals(dealerCards).bestTotal,
    playerBlackjack,
    dealerBlackjack,
    playerCards: first.playerCards,
    dealerCards,
    isBust: hands.every((h) => h.isBust),
    doubled: hands.some((h) => h.doubled),
    hands,
    splitCount: hands.length - 1,
  };
}

/** the three natural-blackjack endings, before either side gets to act */
export function resolveNaturals(
  config: RoundConfig,
  playerCards: Card[],
  dealerCards: Card[],
  bet: number,
  playerBJ: boolean,
  dealerBJ: boolean
): RoundOutcome | null {
  if (!playerBJ && !dealerBJ) return null;

  const shared = { bet, playerCards, isBust: false, doubled: false, fromSplit: false };

  if (playerBJ && dealerBJ) {
    const hand: HandOutcome = { ...shared, result: "push", netWin: 0, playerTotal: 21 };
    return aggregateRound({
      hands: [hand],
      dealerCards,
      playerBlackjack: true,
      dealerBlackjack: true,
    });
  }

  if (playerBJ) {
    const hand: HandOutcome = {
      ...shared,
      result: "blackjack",
      netWin: bet * getPayoutMultiplier(config.rules.blackjackPayout),
      playerTotal: 21,
    };
    return aggregateRound({ hands: [hand], dealerCards, playerBlackjack: true });
  }

  const hand: HandOutcome = {
    ...shared,
    result: "loss",
    netWin: -bet,
    playerTotal: getHandTotals(playerCards).bestTotal,
  };
  return aggregateRound({ hands: [hand], dealerCards, dealerBlackjack: true });
}
