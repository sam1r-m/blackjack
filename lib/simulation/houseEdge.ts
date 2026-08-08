import type { BlackjackPayout, DealerRule } from "@/types/blackjack";

export interface HouseEdgeRules {
  deckCount: number;
  dealerRule: DealerRule;
  blackjackPayout: BlackjackPayout;
  allowSurrender: boolean;
  allowDouble: boolean;
  allowSplit: boolean;
}

/**
 * Baseline game: 6 decks, dealer stands on soft 17, double on any two cards,
 * double after split, resplit to four hands, no surrender, blackjack pays 3:2.
 * A basic-strategy player faces roughly a 0.40% edge there.
 */
const BASELINE_EDGE = 0.4;

// deck count, relative to six decks
const DECK_ADJUSTMENT: Record<number, number> = {
  1: -0.48,
  2: -0.19,
  4: -0.06,
  6: 0,
  8: 0.02,
};

const PAYOUT_ADJUSTMENT: Record<BlackjackPayout, number> = {
  "3_to_2": 0,
  "6_to_5": 1.39,
  "1_to_1": 2.27,
};

const HIT_SOFT_17 = 0.22;
const LATE_SURRENDER = -0.08;
const NO_DOUBLE = 1.48;
const NO_SPLIT = 0.57;

/**
 * House edge for a basic-strategy player under the current rules, as a
 * percentage of the original bet. These are the published rule-effect values
 * layered onto the baseline game, so treat the result as a close estimate
 * rather than a combinatorial solve.
 */
export function calculateHouseEdge(rules: HouseEdgeRules): number {
  let edge = BASELINE_EDGE;

  edge += DECK_ADJUSTMENT[rules.deckCount] ?? 0;
  edge += PAYOUT_ADJUSTMENT[rules.blackjackPayout];

  if (rules.dealerRule === "hit_soft_17") edge += HIT_SOFT_17;
  if (rules.allowSurrender) edge += LATE_SURRENDER;
  if (!rules.allowDouble) edge += NO_DOUBLE;
  if (!rules.allowSplit) edge += NO_SPLIT;

  return edge;
}

export function formatHouseEdge(rules: HouseEdgeRules): string {
  return `${calculateHouseEdge(rules).toFixed(2)}%`;
}
