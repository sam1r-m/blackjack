import type {
  RoundConfig,
  RoundOutcome,
  PlayerAction,
  Card,
  GameStateView,
  BlackjackPayout,
} from "@/types/blackjack";
import type { Shoe } from "./shoe";
import { getHandTotals, isBlackjack } from "./hand";
import { playDealerHand } from "./dealer";
import { basicStrategy } from "@/lib/strategies/basicStrategy";

export interface ManualRoundPending {
  playerCards: Card[];
  dealerCards: Card[];
  currentBet: number;
  isFirstAction: boolean;
  config: RoundConfig;
  shoe: Shoe;
  deckCount: number;
}

export type ManualRoundPendingDisplay = Omit<ManualRoundPending, "shoe">;

export type ManualRoundResult =
  | { status: "outcome"; outcome: RoundOutcome }
  | { status: "pending"; pending: ManualRoundPending };

function getPayoutMultiplier(payout: BlackjackPayout): number {
  if (payout === "3_to_2") return 1.5;
  if (payout === "6_to_5") return 1.2;
  return 1;
}

export function startManualRound(
  config: RoundConfig,
  shoe: Shoe,
  bet: number,
  deckCount: number
): ManualRoundResult {
  const { rules } = config;

  const playerCards: Card[] = [shoe.draw(), shoe.draw()];
  const dealerCards: Card[] = [shoe.draw(), shoe.draw()];

  const playerBJ = isBlackjack(playerCards);
  const dealerBJ = isBlackjack(dealerCards);

  if (playerBJ && dealerBJ) {
    return {
      status: "outcome",
      outcome: {
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
        doubled: false,
      },
    };
  }

  if (playerBJ) {
    const multiplier = getPayoutMultiplier(rules.blackjackPayout);
    return {
      status: "outcome",
      outcome: {
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
        doubled: false,
      },
    };
  }

  if (dealerBJ) {
    return {
      status: "outcome",
      outcome: {
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
        doubled: false,
      },
    };
  }

  return {
    status: "pending",
    pending: {
      playerCards,
      dealerCards,
      currentBet: bet,
      isFirstAction: true,
      config,
      shoe,
      deckCount,
    },
  };
}

export function getRecommendedAction(pending: ManualRoundPending): PlayerAction {
  const { playerCards, dealerCards, isFirstAction, config, deckCount } = pending;
  const playerTotals = getHandTotals(playerCards);
  const canDouble = isFirstAction && playerCards.length === 2 && (config.rules.allowDouble !== false);
  const canSurrender = isFirstAction && (config.rules.allowSurrender !== false);

  const state: GameStateView = {
    playerHand: {
      cards: [...playerCards],
      total: playerTotals,
      canSplit: false,
      canDouble,
      canSurrender,
      isFirstAction,
    },
    dealerUpcard: { card: dealerCards[0] },
    rules: {
      dealerRule: config.rules.dealerRule,
      blackjackPayout: config.rules.blackjackPayout,
      deckCount,
    },
  };

  return basicStrategy.decideAction(state);
}

export function applyManualAction(
  pending: ManualRoundPending,
  action: PlayerAction
): ManualRoundResult {
  const { playerCards, dealerCards, currentBet, isFirstAction, config, shoe, deckCount } = pending;
  const { rules } = config;

  const canDouble = isFirstAction && playerCards.length === 2 && (rules.allowDouble !== false);
  const canSurrender = isFirstAction && (rules.allowSurrender !== false);

  if (action === "stand") {
    return resolveRound(pending, currentBet, false, false);
  }

  if (action === "surrender" && canSurrender) {
    return {
      status: "outcome",
      outcome: {
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
        doubled: false,
      },
    };
  }

  if (action === "double" && canDouble) {
    const newCards = [...playerCards, shoe.draw()];
    const playerFinal = getHandTotals(newCards);
    if (playerFinal.bestTotal > 21) {
      return {
        status: "outcome",
        outcome: {
          result: "loss",
          bet: currentBet * 2,
          netWin: -(currentBet * 2),
          playerTotal: playerFinal.bestTotal,
          dealerTotal: getHandTotals(dealerCards).bestTotal,
          playerBlackjack: false,
          dealerBlackjack: false,
          playerCards: newCards,
          dealerCards,
          isBust: true,
          doubled: true,
        },
      };
    }
    return resolveRound(
      { ...pending, playerCards: newCards, currentBet: currentBet * 2 },
      currentBet * 2,
      true,
      true
    );
  }

  if (action === "hit") {
    const newCards = [...playerCards, shoe.draw()];
    const playerFinal = getHandTotals(newCards);
    if (playerFinal.bestTotal > 21) {
      return {
        status: "outcome",
        outcome: {
          result: "loss",
          bet: currentBet,
          netWin: -currentBet,
          playerTotal: playerFinal.bestTotal,
          dealerTotal: getHandTotals(dealerCards).bestTotal,
          playerBlackjack: false,
          dealerBlackjack: false,
          playerCards: newCards,
          dealerCards,
          isBust: true,
          doubled: false,
        },
      };
    }
    if (playerFinal.bestTotal >= 21) {
      return resolveRound({ ...pending, playerCards: newCards }, currentBet, false, false);
    }
    return {
      status: "pending",
      pending: {
        ...pending,
        playerCards: newCards,
        isFirstAction: false,
      },
    };
  }

  return resolveRound(pending, currentBet, false, false);
}

function resolveRound(
  pending: ManualRoundPending,
  bet: number,
  doubled: boolean,
  wasDoubled: boolean
): ManualRoundResult {
  const { playerCards, dealerCards, config, shoe } = pending;
  const { rules } = config;

  const playerFinal = getHandTotals(playerCards);
  const finalDealerCards = playDealerHand(dealerCards, shoe, rules.dealerRule);
  const dealerFinal = getHandTotals(finalDealerCards);

  if (dealerFinal.bestTotal > 21) {
    return {
      status: "outcome",
      outcome: {
        result: "win",
        bet,
        netWin: bet,
        playerTotal: playerFinal.bestTotal,
        dealerTotal: dealerFinal.bestTotal,
        playerBlackjack: false,
        dealerBlackjack: false,
        playerCards,
        dealerCards: finalDealerCards,
        isBust: false,
        doubled: wasDoubled,
      },
    };
  }

  if (playerFinal.bestTotal > dealerFinal.bestTotal) {
    return {
      status: "outcome",
      outcome: {
        result: "win",
        bet,
        netWin: bet,
        playerTotal: playerFinal.bestTotal,
        dealerTotal: dealerFinal.bestTotal,
        playerBlackjack: false,
        dealerBlackjack: false,
        playerCards,
        dealerCards: finalDealerCards,
        isBust: false,
        doubled: wasDoubled,
      },
    };
  }

  if (playerFinal.bestTotal < dealerFinal.bestTotal) {
    return {
      status: "outcome",
      outcome: {
        result: "loss",
        bet,
        netWin: -bet,
        playerTotal: playerFinal.bestTotal,
        dealerTotal: dealerFinal.bestTotal,
        playerBlackjack: false,
        dealerBlackjack: false,
        playerCards,
        dealerCards: finalDealerCards,
        isBust: false,
        doubled: wasDoubled,
      },
    };
  }

  return {
    status: "outcome",
    outcome: {
      result: "push",
      bet,
      netWin: 0,
      playerTotal: playerFinal.bestTotal,
      dealerTotal: dealerFinal.bestTotal,
      playerBlackjack: false,
      dealerBlackjack: false,
      playerCards,
      dealerCards: finalDealerCards,
      isBust: false,
      doubled: wasDoubled,
    },
  };
}
