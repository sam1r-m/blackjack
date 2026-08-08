import type {
  RoundConfig,
  RoundOutcome,
  PlayerAction,
  Card,
} from "@/types/blackjack";
import type { Shoe } from "./shoe";
import { getHandTotals, isBlackjack } from "./hand";
import { playDealerHand } from "./dealer";
import { basicStrategy } from "@/lib/strategies/basicStrategy";
import { buildStateView } from "./round";
import {
  aggregateRound,
  anyHandLive,
  createHand,
  getLegalActions,
  resolveNaturals,
  settleHand,
  splitHand,
  type PlayerHandState,
} from "./settle";

export interface ManualRoundPending {
  hands: PlayerHandState[];
  activeIndex: number;
  dealerCards: Card[];
  /** total already committed this round, across every hand */
  wagered: number;
  bankrollAvailable?: number;
  config: RoundConfig;
  shoe: Shoe;
  deckCount: number;
}

/** one hand as the table renders it */
export interface ManualHandView {
  cards: Card[];
  bet: number;
  total: number;
  isSoft: boolean;
  isBust: boolean;
  doubled: boolean;
  surrendered: boolean;
  fromSplit: boolean;
  done: boolean;
}

/**
 * Everything the UI needs, with the legal actions resolved by the engine so the
 * table never has to re-derive the rules itself.
 */
export interface ManualRoundPendingDisplay {
  hands: ManualHandView[];
  activeIndex: number;
  dealerCards: Card[];
  currentBet: number;
  totalWagered: number;
  isFirstAction: boolean;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  config: RoundConfig;
  deckCount: number;
}

function remainingBudget(pending: ManualRoundPending): number {
  return pending.bankrollAvailable === undefined
    ? Number.POSITIVE_INFINITY
    : pending.bankrollAvailable - pending.wagered;
}

export function toPendingDisplay(pending: ManualRoundPending): ManualRoundPendingDisplay {
  const active = pending.hands[pending.activeIndex];
  const legal = getLegalActions(active, pending.config, pending.hands.length, remainingBudget(pending));

  return {
    hands: pending.hands.map((h) => {
      const totals = getHandTotals(h.cards);
      return {
        cards: h.cards,
        bet: h.bet,
        total: totals.bestTotal,
        isSoft: totals.isSoft,
        isBust: totals.bestTotal > 21,
        doubled: h.doubled,
        surrendered: h.surrendered,
        fromSplit: h.fromSplit,
        done: h.done,
      };
    }),
    activeIndex: pending.activeIndex,
    dealerCards: pending.dealerCards,
    currentBet: active.bet,
    totalWagered: pending.wagered,
    isFirstAction: legal.isFirstAction,
    canHit: legal.canHit,
    canStand: !active.done,
    canDouble: legal.canDouble,
    canSplit: legal.canSplit,
    canSurrender: legal.canSurrender,
    config: pending.config,
    deckCount: pending.deckCount,
  };
}

export type ManualRoundResult =
  | { status: "outcome"; outcome: RoundOutcome }
  | { status: "pending"; pending: ManualRoundPending };

export function startManualRound(
  config: RoundConfig,
  shoe: Shoe,
  bet: number,
  deckCount: number,
  bankrollAvailable?: number
): ManualRoundResult {
  shoe.shuffleIfNeeded();

  const playerCards: Card[] = [shoe.draw(), shoe.draw()];
  const dealerCards: Card[] = [shoe.draw(), shoe.draw()];

  const natural = resolveNaturals(
    config,
    playerCards,
    dealerCards,
    bet,
    isBlackjack(playerCards),
    isBlackjack(dealerCards)
  );
  if (natural) return { status: "outcome", outcome: natural };

  return advance({
    hands: [createHand(playerCards, bet)],
    activeIndex: 0,
    dealerCards,
    wagered: bet,
    bankrollAvailable,
    config,
    shoe,
    deckCount,
  });
}

/** move to the next hand that still needs a decision, or finish the round */
function advance(pending: ManualRoundPending): ManualRoundResult {
  let index = pending.activeIndex;

  while (index < pending.hands.length) {
    const hand = pending.hands[index];
    if (!hand.done && getHandTotals(hand.cards).bestTotal >= 21) hand.done = true;
    if (!hand.done) break;
    index++;
  }

  if (index >= pending.hands.length) return finishRound(pending);

  return { status: "pending", pending: { ...pending, activeIndex: index } };
}

function finishRound(pending: ManualRoundPending): ManualRoundResult {
  const { hands, dealerCards, shoe, config } = pending;

  const finalDealerCards = anyHandLive(hands)
    ? playDealerHand(dealerCards, shoe, config.rules.dealerRule)
    : dealerCards;

  return {
    status: "outcome",
    outcome: aggregateRound({
      hands: hands.map((h) => settleHand(h, finalDealerCards)),
      dealerCards: finalDealerCards,
    }),
  };
}

export function getRecommendedAction(pending: ManualRoundPending): PlayerAction {
  const active = pending.hands[pending.activeIndex];
  const legal = getLegalActions(active, pending.config, pending.hands.length, remainingBudget(pending));

  return basicStrategy.decideAction(
    buildStateView(
      active,
      pending.dealerCards[0],
      pending.config,
      pending.deckCount,
      pending.activeIndex,
      pending.hands.length,
      legal
    )
  );
}

export function applyManualAction(
  pending: ManualRoundPending,
  action: PlayerAction
): ManualRoundResult {
  const next: ManualRoundPending = { ...pending, hands: [...pending.hands] };

  // clone the hand we are about to mutate so the caller's previous pending
  // object stays intact
  const previous = next.hands[next.activeIndex];
  const hand: PlayerHandState = { ...previous, cards: [...previous.cards] };
  next.hands[next.activeIndex] = hand;

  if (hand.done) return advance(next);

  const legal = getLegalActions(hand, next.config, next.hands.length, remainingBudget(next));

  if (action === "split" && legal.canSplit) {
    next.wagered += hand.bet;
    next.hands = splitHand(next.hands, next.activeIndex, () => next.shoe.draw());
    return advance(next);
  }

  if (action === "surrender" && legal.canSurrender) {
    hand.actions++;
    hand.surrendered = true;
    hand.done = true;
    return advance(next);
  }

  if (action === "double" && legal.canDouble) {
    hand.actions++;
    next.wagered += hand.bet;
    hand.bet *= 2;
    hand.doubled = true;
    hand.cards = [...hand.cards, next.shoe.draw()];
    hand.done = true;
    return advance(next);
  }

  if (action === "hit" && legal.canHit) {
    hand.actions++;
    hand.cards = [...hand.cards, next.shoe.draw()];
    if (getHandTotals(hand.cards).bestTotal >= 21) hand.done = true;
    return advance(next);
  }

  // stand, or an action the rules do not allow right now
  hand.actions++;
  hand.done = true;
  return advance(next);
}
