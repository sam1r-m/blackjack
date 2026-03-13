import type { BlackjackPayout, DealerRule, RoundResultType } from "./blackjack";

// betting strategy types
export type BettingStrategyType = "flat" | "martingale" | "reverse_martingale" | "fibonacci";

export interface BettingContext {
  previousOutcome?: RoundResultType;
  previousBet?: number;
  bankroll: number;
  baseBet: number;
  tableMax: number;
}

export interface NextBetResult {
  bet: number;
  shouldStop: boolean;
}

export interface BettingStrategy {
  type: BettingStrategyType;
  nextBet(context: BettingContext): NextBetResult;
}

// simulation configuration
export interface SimulationConfig {
  id?: string;
  deckCount: number;
  blackjackPayout: BlackjackPayout;
  dealerRule: DealerRule;
  bettingStrategy: BettingStrategyType;
  baseBet: number;
  initialBankroll: number;
  tableMax: number;
  penetration: number;
  maxHands?: number;
}

// per-round record for tracking
export interface SessionRoundRecord {
  roundNumber: number;
  bet: number;
  result: RoundResultType;
  bankrollBefore: number;
  bankrollAfter: number;
  netWin: number;
  doubled: boolean;
}

// session summary after running a full session
export interface SessionSummary {
  config: SimulationConfig;
  startingBankroll: number;
  endingBankroll: number;
  handsPlayed: number;
  rounds: SessionRoundRecord[];
  maxDrawdown: number;
  longestLosingStreak: number;
  winCount: number;
  lossCount: number;
  pushCount: number;
  blackjackCount: number;
  bustedCount: number;
  ruined: boolean;
}

// monte carlo types
export interface MonteCarloRunConfig {
  id?: string;
  simulationConfig: SimulationConfig;
  sessionCount: number;
}

export interface MonteCarloSessionSample {
  endingBankroll: number;
  maxDrawdown: number;
  longestLosingStreak: number;
  winCount: number;
  lossCount: number;
  pushCount: number;
  blackjackCount: number;
  ruined: boolean;
}

export interface MonteCarloAggregate {
  expectedEndingBankroll: number;
  medianEndingBankroll: number;
  ruinProbability: number;
  probabilityOfProfit: number;
  percentile5: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
  variance: number;
  standardDeviation: number;
  maxDrawdownDistribution: {
    percentile5: number;
    percentile50: number;
    percentile95: number;
  };
  longestLossStreakDistribution: {
    percentile5: number;
    percentile50: number;
    percentile95: number;
  };
  winFrequency: number;
  lossFrequency: number;
  pushFrequency: number;
  blackjackFrequency: number;
}
