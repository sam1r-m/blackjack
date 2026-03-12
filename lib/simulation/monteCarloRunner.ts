import type { PlayerPolicy } from "@/types/blackjack";
import type {
  MonteCarloRunConfig,
  MonteCarloSessionSample,
  MonteCarloAggregate,
  BettingStrategy,
} from "@/types/simulation";
import { runSession } from "./sessionSimulator";
import { computeAggregates } from "./riskAnalysis";

export interface MonteCarloInput {
  config: MonteCarloRunConfig;
  playerPolicy: PlayerPolicy;
  bettingStrategy: BettingStrategy;
}

export interface MonteCarloResult {
  sessions: MonteCarloSessionSample[];
  aggregate: MonteCarloAggregate;
}

export function runMonteCarlo(input: MonteCarloInput): MonteCarloResult {
  const { config, playerPolicy, bettingStrategy } = input;
  const { simulationConfig, sessionCount } = config;
  const sessions: MonteCarloSessionSample[] = [];

  for (let i = 0; i < sessionCount; i++) {
    const summary = runSession({
      ...simulationConfig,
      playerPolicy,
      bettingStrategy,
    });

    sessions.push({
      endingBankroll: summary.endingBankroll,
      maxDrawdown: summary.maxDrawdown,
      longestLosingStreak: summary.longestLosingStreak,
      winCount: summary.winCount,
      lossCount: summary.lossCount,
      pushCount: summary.pushCount,
      blackjackCount: summary.blackjackCount,
      ruined: summary.ruined,
    });
  }

  const aggregate = computeAggregates(sessions);
  return { sessions, aggregate };
}
