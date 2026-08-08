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
 * Baseline game: six decks, dealer stands on soft 17, double on any two cards,
 * double after split, split to four hands, no resplitting aces, no surrender,
 * blackjack pays 3:2.
 *
 * Anchored on the Wizard of Odds figure of 0.334% for that game *with* resplit
 * aces; removing RSA (worth about 0.08% to the player) puts the baseline at
 * 0.41%. Every adjustment below is the published rule-variation value from
 * wizardofodds.com/games/blackjack/rule-variations/.
 */
const BASELINE_EDGE = 0.41;

/**
 * The published deck table is quoted against an *eight* deck baseline
 * (single +0.48, double +0.19, four +0.06, five +0.03, six +0.02, all as player
 * gains). These are re-anchored to six decks by subtracting the six-deck entry,
 * then negated so a positive number means a bigger house edge.
 */
const DECK_ADJUSTMENT: Record<number, number> = {
  1: -0.46,
  2: -0.17,
  4: -0.04,
  5: -0.01,
  6: 0,
  8: 0.02,
};

const PAYOUT_ADJUSTMENT: Record<BlackjackPayout, number> = {
  "3_to_2": 0,
  "6_to_5": 1.39,
  "1_to_1": 2.27,
};

const HIT_SOFT_17 = 0.22;
const NO_DOUBLE = 1.48;
const NO_SPLIT = 0.57;

// surrender is worth more when the dealer hits soft 17, because there are more
// hands worth giving up against
const LATE_SURRENDER_S17 = -0.07;
const LATE_SURRENDER_H17 = -0.09;

/**
 * House edge for a basic-strategy player under the given rules, as a percentage
 * of the original bet. Positive favours the house.
 *
 * This layers published rule-variation values onto the baseline game, which is
 * how the effect of rules is normally quoted. Rule effects are not perfectly
 * additive, so treat the result as accurate to roughly a hundredth of a percent
 * for shoe games. It is least reliable at a single deck, where deck count
 * interacts with the other rules and real games are usually scored on
 * composition-dependent play rather than the total-dependent basic strategy
 * this project uses.
 */
export function calculateHouseEdge(rules: HouseEdgeRules): number {
  let edge = BASELINE_EDGE;

  edge += DECK_ADJUSTMENT[rules.deckCount] ?? 0;
  edge += PAYOUT_ADJUSTMENT[rules.blackjackPayout];

  if (rules.dealerRule === "hit_soft_17") edge += HIT_SOFT_17;
  if (rules.allowSurrender) {
    edge += rules.dealerRule === "hit_soft_17" ? LATE_SURRENDER_H17 : LATE_SURRENDER_S17;
  }
  if (!rules.allowDouble) edge += NO_DOUBLE;
  if (!rules.allowSplit) edge += NO_SPLIT;

  return edge;
}

export function formatHouseEdge(rules: HouseEdgeRules): string {
  return `${calculateHouseEdge(rules).toFixed(2)}%`;
}
