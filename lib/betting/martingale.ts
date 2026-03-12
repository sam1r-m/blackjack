import type { BettingStrategy, BettingContext, NextBetResult } from "@/types/simulation";

export const martingaleStrategy: BettingStrategy = {
  type: "martingale",

  nextBet(ctx: BettingContext): NextBetResult {
    let proposedBet: number;

    if (!ctx.previousOutcome || ctx.previousOutcome === "win" || ctx.previousOutcome === "blackjack") {
      // won or first hand -> reset to base bet
      proposedBet = ctx.baseBet;
    } else if (ctx.previousOutcome === "push") {
      // push -> keep same bet
      proposedBet = ctx.previousBet ?? ctx.baseBet;
    } else {
      // loss or surrender -> double the previous bet
      proposedBet = (ctx.previousBet ?? ctx.baseBet) * 2;
    }

    // cap at table max and bankroll
    proposedBet = Math.min(proposedBet, ctx.tableMax, ctx.bankroll);

    if (proposedBet < ctx.baseBet && ctx.bankroll < ctx.baseBet) {
      return { bet: 0, shouldStop: true };
    }

    // if we can't even afford the base bet after capping, just bet what we have
    if (proposedBet <= 0) {
      return { bet: 0, shouldStop: true };
    }

    return { bet: proposedBet, shouldStop: false };
  },
};
