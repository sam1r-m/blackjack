import type { BettingStrategy, BettingContext, NextBetResult } from "@/types/simulation";

export const flatBetStrategy: BettingStrategy = {
  type: "flat",

  nextBet(ctx: BettingContext): NextBetResult {
    if (ctx.bankroll < ctx.baseBet) {
      return { bet: 0, shouldStop: true };
    }

    const bet = Math.min(ctx.baseBet, ctx.bankroll, ctx.tableMax);
    return { bet, shouldStop: false };
  },
};
