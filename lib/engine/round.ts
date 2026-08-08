import type {
  RoundConfig,
  RoundOutcome,
  PlayerPolicy,
  PlayerAction,
  Card,
  GameStateView,
} from "@/types/blackjack";
import type { Shoe } from "./shoe";
import { getHandTotals, isBlackjack } from "./hand";
import { playDealerHand } from "./dealer";
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

export interface RoundInput {
  shoe: Shoe;
  bet: number;
  playerPolicy: PlayerPolicy;
  deckCount: number;
  /**
   * Total chips the player can put at risk this round, initial bet included.
   * Doubles and splits are refused once they would exceed it. Leave undefined
   * to let the policy wager freely.
   */
  bankrollAvailable?: number;
}

// a policy that keeps asking to split can only be indulged so long
const MAX_ACTIONS_PER_HAND = 64;

export function buildStateView(
  hand: PlayerHandState,
  dealerUpcard: Card,
  config: RoundConfig,
  deckCount: number,
  handIndex: number,
  handCount: number,
  legal: ReturnType<typeof getLegalActions>
): GameStateView {
  return {
    playerHand: {
      cards: [...hand.cards],
      total: getHandTotals(hand.cards),
      canSplit: legal.canSplit,
      canDouble: legal.canDouble,
      canSurrender: legal.canSurrender,
      isFirstAction: legal.isFirstAction,
      fromSplit: hand.fromSplit,
      handIndex,
      handCount,
    },
    dealerUpcard: { card: dealerUpcard },
    rules: {
      dealerRule: config.rules.dealerRule,
      blackjackPayout: config.rules.blackjackPayout,
      deckCount,
    },
  };
}

export function runRound(config: RoundConfig, input: RoundInput): RoundOutcome {
  const { shoe, bet, playerPolicy, deckCount, bankrollAvailable } = input;
  const { rules } = config;

  // a real table finishes the round it is in, then reshuffles
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
  if (natural) return natural;

  let hands: PlayerHandState[] = [createHand(playerCards, bet)];
  let wagered = bet;
  let index = 0;

  while (index < hands.length) {
    const hand = hands[index];
    let actionsTaken = 0;

    while (!hand.done && actionsTaken++ < MAX_ACTIONS_PER_HAND) {
      if (getHandTotals(hand.cards).bestTotal >= 21) {
        hand.done = true;
        break;
      }

      const budget =
        bankrollAvailable === undefined ? Number.POSITIVE_INFINITY : bankrollAvailable - wagered;
      const legal = getLegalActions(hand, config, hands.length, budget);
      const state = buildStateView(
        hand,
        dealerCards[0],
        config,
        deckCount,
        index,
        hands.length,
        legal
      );

      const action: PlayerAction = playerPolicy.decideAction(state);
      hand.actions++;

      if (action === "split" && legal.canSplit) {
        wagered += hand.bet;
        hands = splitHand(hands, index, () => shoe.draw());
        continue;
      }

      if (action === "surrender" && legal.canSurrender) {
        hand.surrendered = true;
        hand.done = true;
        break;
      }

      if (action === "double" && legal.canDouble) {
        wagered += hand.bet;
        hand.bet *= 2;
        hand.doubled = true;
        hand.cards.push(shoe.draw());
        hand.done = true;
        break;
      }

      if (action === "hit") {
        hand.cards.push(shoe.draw());
        continue;
      }

      // stand, or an action the rules do not allow right now
      hand.done = true;
      break;
    }

    hand.done = true;
    index++;
  }

  const finalDealerCards = anyHandLive(hands)
    ? playDealerHand(dealerCards, shoe, rules.dealerRule)
    : dealerCards;

  return aggregateRound({
    hands: hands.map((h) => settleHand(h, finalDealerCards)),
    dealerCards: finalDealerCards,
  });
}
