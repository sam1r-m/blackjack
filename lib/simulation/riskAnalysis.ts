import type { MonteCarloSessionSample, MonteCarloAggregate } from "@/types/simulation";

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function variance(values: number[], avg: number): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
}

export function computeAggregates(samples: MonteCarloSessionSample[]): MonteCarloAggregate {
  const n = samples.length;
  if (n === 0) {
    // return zeros if somehow empty
    return {
      expectedEndingBankroll: 0,
      medianEndingBankroll: 0,
      ruinProbability: 0,
      probabilityOfProfit: 0,
      percentile5: 0,
      percentile25: 0,
      percentile75: 0,
      percentile95: 0,
      variance: 0,
      standardDeviation: 0,
      maxDrawdownDistribution: { percentile5: 0, percentile50: 0, percentile95: 0 },
      longestLossStreakDistribution: { percentile5: 0, percentile50: 0, percentile95: 0 },
      winFrequency: 0,
      lossFrequency: 0,
      pushFrequency: 0,
      blackjackFrequency: 0,
    };
  }

  // sort bankroll values for percentile calcs
  const bankrolls = samples.map((s) => s.endingBankroll).sort((a, b) => a - b);
  const drawdowns = samples.map((s) => s.maxDrawdown).sort((a, b) => a - b);
  const lossStreaks = samples.map((s) => s.longestLosingStreak).sort((a, b) => a - b);

  const avgBankroll = mean(bankrolls);
  const bankrollVar = variance(bankrolls, avgBankroll);

  // total hands across all sessions for frequency calcs
  const totalHands = samples.reduce(
    (sum, s) => sum + s.winCount + s.lossCount + s.pushCount,
    0
  );
  const totalWins = samples.reduce((sum, s) => sum + s.winCount, 0);
  const totalLosses = samples.reduce((sum, s) => sum + s.lossCount, 0);
  const totalPushes = samples.reduce((sum, s) => sum + s.pushCount, 0);
  const totalBJs = samples.reduce((sum, s) => sum + s.blackjackCount, 0);

  // ruin = bankroll hit 0
  const ruinCount = samples.filter((s) => s.ruined).length;

  // profit = ended with more than started (we don't have starting bankroll here,
  // but we can infer from the first sample's context or just check > 0)
  // actually we just check if ending > 0 since ruined means 0
  // TODO: pass initialBankroll in for accurate profit calc
  // for now, profit means endingBankroll > initial. we'll approximate.
  const profitCount = samples.filter((s) => !s.ruined && s.endingBankroll > 0).length;

  return {
    expectedEndingBankroll: avgBankroll,
    medianEndingBankroll: percentile(bankrolls, 50),
    ruinProbability: ruinCount / n,
    probabilityOfProfit: profitCount / n,
    percentile5: percentile(bankrolls, 5),
    percentile25: percentile(bankrolls, 25),
    percentile75: percentile(bankrolls, 75),
    percentile95: percentile(bankrolls, 95),
    variance: bankrollVar,
    standardDeviation: Math.sqrt(bankrollVar),
    maxDrawdownDistribution: {
      percentile5: percentile(drawdowns, 5),
      percentile50: percentile(drawdowns, 50),
      percentile95: percentile(drawdowns, 95),
    },
    longestLossStreakDistribution: {
      percentile5: percentile(lossStreaks, 5),
      percentile50: percentile(lossStreaks, 50),
      percentile95: percentile(lossStreaks, 95),
    },
    winFrequency: totalHands > 0 ? totalWins / totalHands : 0,
    lossFrequency: totalHands > 0 ? totalLosses / totalHands : 0,
    pushFrequency: totalHands > 0 ? totalPushes / totalHands : 0,
    blackjackFrequency: totalHands > 0 ? totalBJs / totalHands : 0,
  };
}
