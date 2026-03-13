import type { PlayerPolicy } from "@/types/blackjack";
import type {
  SimulationConfig,
  BettingStrategy,
  SessionSummary,
  SessionRoundRecord,
} from "@/types/simulation";
import { Shoe } from "@/lib/engine/shoe";
import { runRound } from "@/lib/engine/round";

export interface SessionSimulatorConfig extends Omit<SimulationConfig, "bettingStrategy"> {
  playerPolicy: PlayerPolicy;
  bettingStrategy: BettingStrategy;
  rng?: () => number;
}

export function runSession(config: SessionSimulatorConfig): SessionSummary {
  const shoe = new Shoe({
    deckCount: config.deckCount,
    penetration: config.penetration,
    rng: config.rng,
  });

  let bankroll = config.initialBankroll;
  const rounds: SessionRoundRecord[] = [];
  let peakBankroll = bankroll;
  let maxDrawdown = 0;
  let currentLosingStreak = 0;
  let longestLosingStreak = 0;
  let winCount = 0;
  let lossCount = 0;
  let pushCount = 0;
  let blackjackCount = 0;
  let bustedCount = 0;

  const maxHands = config.maxHands ?? 500;

  for (let roundNumber = 1; roundNumber <= maxHands; roundNumber++) {
    const previousRound = rounds.length > 0 ? rounds[rounds.length - 1] : undefined;

    const betResult = config.bettingStrategy.nextBet({
      previousOutcome: previousRound?.result,
      previousBet: previousRound?.bet,
      bankroll,
      baseBet: config.baseBet,
      tableMax: config.tableMax,
    });

    if (betResult.shouldStop || betResult.bet === 0) break;

    const bankrollBefore = bankroll;

    const outcome = runRound(
      {
        rules: {
          dealerRule: config.dealerRule,
          blackjackPayout: config.blackjackPayout,
        },
      },
      {
        shoe,
        bet: betResult.bet,
        playerPolicy: config.playerPolicy,
        deckCount: config.deckCount,
      }
    );

    bankroll += outcome.netWin;

    // track stats
    if (outcome.result === "win") {
      winCount++;
      currentLosingStreak = 0;
    } else if (outcome.result === "blackjack") {
      blackjackCount++;
      winCount++;
      currentLosingStreak = 0;
    } else if (outcome.result === "push") {
      pushCount++;
      currentLosingStreak = 0;
    } else {
      lossCount++;
      if (outcome.isBust) bustedCount++;
      currentLosingStreak++;
      longestLosingStreak = Math.max(longestLosingStreak, currentLosingStreak);
    }

    // drawdown tracking
    if (bankroll > peakBankroll) {
      peakBankroll = bankroll;
    }
    const drawdown = peakBankroll - bankroll;
    maxDrawdown = Math.max(maxDrawdown, drawdown);

    rounds.push({
      roundNumber,
      bet: betResult.bet,
      result: outcome.result,
      bankrollBefore,
      bankrollAfter: bankroll,
      netWin: outcome.netWin,
      doubled: outcome.doubled,
    });

    // ruined
    if (bankroll <= 0) break;
  }

  // extract just the simulation config part for the summary
  const simConfig: SimulationConfig = {
    id: config.id,
    deckCount: config.deckCount,
    blackjackPayout: config.blackjackPayout,
    dealerRule: config.dealerRule,
    bettingStrategy: config.bettingStrategy.type,
    baseBet: config.baseBet,
    initialBankroll: config.initialBankroll,
    tableMax: config.tableMax,
    penetration: config.penetration,
    maxHands: config.maxHands,
  };

  return {
    config: simConfig,
    startingBankroll: config.initialBankroll,
    endingBankroll: bankroll,
    handsPlayed: rounds.length,
    rounds,
    maxDrawdown,
    longestLosingStreak,
    winCount,
    lossCount,
    pushCount,
    blackjackCount,
    bustedCount,
    ruined: bankroll <= 0,
  };
}
