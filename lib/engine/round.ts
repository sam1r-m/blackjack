import type {
  RoundConfig,
  RoundOutcome,
  PlayerPolicy,
  PlayerAction,
  Card,
  GameStateView,
  BlackjackPayout,
} from "@/types/blackjack";
import type { Shoe } from "./shoe";
import { getHandTotals, isBlackjack, isBust } from "./hand";
import { playDealerHand } from "./dealer";
import { getCardValue } from "./card";

export interface RoundInput {
  shoe: Shoe;
  bet: number;
  playerPolicy: PlayerPolicy;
  deckCount: number;
}

function getPayoutMultiplier(payout: BlackjackPayout): number {
  if (payout === "3_to_2") return 1.5;
  if (payout === "6_to_5") return 1.2;
  return 1;
}

export function runRound(config: RoundConfig, input: RoundInput): RoundOutcome {
  const { shoe, bet, playerPolicy, deckCount } = input;
  const { rules } = config;

  // initial deal
  const playerCards: Card[] = [shoe.draw(), shoe.draw()];
  const dealerCards: Card[] = [shoe.draw(), shoe.draw()];

  const playerBJ = isBlackjack(playerCards);
  const dealerBJ = isBlackjack(dealerCards);

  // both have blackjack = push
  if (playerBJ && dealerBJ) {
    return {
      result: "push",
      bet,
      netWin: 0,
      playerTotal: 21,
      dealerTotal: 21,
      playerBlackjack: true,
      dealerBlackjack: true,
      playerCards,
      dealerCards,
      isBust: false,
    };
  }

  // player blackjack
  if (playerBJ) {
    const multiplier = getPayoutMultiplier(rules.blackjackPayout);
    return {
      result: "blackjack",
      bet,
      netWin: bet * multiplier,
      playerTotal: 21,
      dealerTotal: getHandTotals(dealerCards).bestTotal,
      playerBlackjack: true,
      dealerBlackjack: false,
      playerCards,
      dealerCards,
      isBust: false,
    };
  }

  // dealer blackjack
  if (dealerBJ) {
    return {
      result: "loss",
      bet,
      netWin: -bet,
      playerTotal: getHandTotals(playerCards).bestTotal,
      dealerTotal: 21,
      playerBlackjack: false,
      dealerBlackjack: true,
      playerCards,
      dealerCards,
      isBust: false,
    };
  }

  // player actions
  let currentBet = bet;
  let isFirstAction = true;
  let surrendered = false;

  while (true) {
    const playerTotals = getHandTotals(playerCards);
    if (playerTotals.bestTotal >= 21) break;

    const canDouble = isFirstAction && playerCards.length === 2;
    const canSplit = false; // splits not yet implemented
    const canSurrender = isFirstAction;

    const state: GameStateView = {
      playerHand: {
        cards: [...playerCards],
        total: playerTotals,
        canSplit,
        canDouble,
        canSurrender,
        isFirstAction,
      },
      dealerUpcard: { card: dealerCards[0] },
      rules: {
        dealerRule: rules.dealerRule,
        blackjackPayout: rules.blackjackPayout,
        deckCount,
      },
    };

    const action: PlayerAction = playerPolicy.decideAction(state);
    isFirstAction = false;

    if (action === "stand") break;

    if (action === "surrender" && canSurrender) {
      surrendered = true;
      break;
    }

    if (action === "double" && canDouble) {
      currentBet *= 2;
      playerCards.push(shoe.draw());
      break;
    }

    if (action === "hit") {
      playerCards.push(shoe.draw());
      continue;
    }

    // fallback: stand if action doesn't match
    break;
  }

  // handle surrender
  if (surrendered) {
    return {
      result: "surrender",
      bet: currentBet,
      netWin: -(currentBet / 2),
      playerTotal: getHandTotals(playerCards).bestTotal,
      dealerTotal: getHandTotals(dealerCards).bestTotal,
      playerBlackjack: false,
      dealerBlackjack: false,
      playerCards,
      dealerCards,
      isBust: false,
    };
  }

  const playerFinal = getHandTotals(playerCards);

  // player busts
  if (playerFinal.bestTotal > 21) {
    return {
      result: "loss",
      bet: currentBet,
      netWin: -currentBet,
      playerTotal: playerFinal.bestTotal,
      dealerTotal: getHandTotals(dealerCards).bestTotal,
      playerBlackjack: false,
      dealerBlackjack: false,
      playerCards,
      dealerCards,
      isBust: true,
    };
  }

  // dealer plays
  const finalDealerCards = playDealerHand(dealerCards, shoe, rules.dealerRule);
  const dealerFinal = getHandTotals(finalDealerCards);

  // dealer busts
  if (dealerFinal.bestTotal > 21) {
    return {
      result: "win",
      bet: currentBet,
      netWin: currentBet,
      playerTotal: playerFinal.bestTotal,
      dealerTotal: dealerFinal.bestTotal,
      playerBlackjack: false,
      dealerBlackjack: false,
      playerCards,
      dealerCards: finalDealerCards,
      isBust: false,
    };
  }

  // compare totals
  if (playerFinal.bestTotal > dealerFinal.bestTotal) {
    return {
      result: "win",
      bet: currentBet,
      netWin: currentBet,
      playerTotal: playerFinal.bestTotal,
      dealerTotal: dealerFinal.bestTotal,
      playerBlackjack: false,
      dealerBlackjack: false,
      playerCards,
      dealerCards: finalDealerCards,
      isBust: false,
    };
  }

  if (playerFinal.bestTotal < dealerFinal.bestTotal) {
    return {
      result: "loss",
      bet: currentBet,
      netWin: -currentBet,
      playerTotal: playerFinal.bestTotal,
      dealerTotal: dealerFinal.bestTotal,
      playerBlackjack: false,
      dealerBlackjack: false,
      playerCards,
      dealerCards: finalDealerCards,
      isBust: false,
    };
  }

  return {
    result: "push",
    bet: currentBet,
    netWin: 0,
    playerTotal: playerFinal.bestTotal,
    dealerTotal: dealerFinal.bestTotal,
    playerBlackjack: false,
    dealerBlackjack: false,
    playerCards,
    dealerCards: finalDealerCards,
    isBust: false,
  };
}
