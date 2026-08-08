import type { BettingStrategy, BettingContext, NextBetResult } from "@/types/simulation";

// mirror of the martingale: ride a winning streak by doubling, and drop back to
// the base bet the moment one comes in losing.
export const reverseMartingaleStrategy: BettingStrategy = {
  type: "reverse_martingale",

  nextBet(ctx: BettingContext): NextBetResult {
    if (ctx.bankroll < ctx.baseBet) {
      return { bet: 0, shouldStop: true };
    }

    let proposedBet: number;

    if (!ctx.previousOutcome) {
      proposedBet = ctx.baseBet;
    } else if (ctx.previousOutcome === "win" || ctx.previousOutcome === "blackjack") {
      proposedBet = (ctx.previousBet ?? ctx.baseBet) * 2;
    } else if (ctx.previousOutcome === "push") {
      proposedBet = ctx.previousBet ?? ctx.baseBet;
    } else {
      // loss or surrender ends the streak
      proposedBet = ctx.baseBet;
    }

    const bet = Math.min(proposedBet, ctx.tableMax, ctx.bankroll);

    if (bet <= 0) return { bet: 0, shouldStop: true };
    return { bet, shouldStop: false };
  },
};
