import type { GameStateView, PlayerAction, PlayerPolicy } from "@/types/blackjack";
import { getCardValue } from "@/lib/engine/card";

// basic strategy lookup for hard totals
// rows = player hard total (5-20), cols = dealer upcard value (2-11)
// h=hit, s=stand, d=double(or hit), r=surrender(or hit)
const HARD: Record<number, string[]> = {
  5:  ["h","h","h","h","h","h","h","h","h","h"],
  6:  ["h","h","h","h","h","h","h","h","h","h"],
  7:  ["h","h","h","h","h","h","h","h","h","h"],
  8:  ["h","h","h","h","h","h","h","h","h","h"],
  9:  ["h","d","d","d","d","h","h","h","h","h"],
  10: ["d","d","d","d","d","d","d","d","h","h"],
  11: ["d","d","d","d","d","d","d","d","d","d"],
  12: ["h","h","s","s","s","h","h","h","h","h"],
  13: ["s","s","s","s","s","h","h","h","h","h"],
  14: ["s","s","s","s","s","h","h","h","h","h"],
  15: ["s","s","s","s","s","h","h","h","r","h"],
  16: ["s","s","s","s","s","h","h","r","r","r"],
  17: ["s","s","s","s","s","s","s","s","s","s"],
  18: ["s","s","s","s","s","s","s","s","s","s"],
  19: ["s","s","s","s","s","s","s","s","s","s"],
  20: ["s","s","s","s","s","s","s","s","s","s"],
};

// soft totals (ace counted as 11)
const SOFT: Record<number, string[]> = {
  13: ["h","h","h","d","d","h","h","h","h","h"],
  14: ["h","h","h","d","d","h","h","h","h","h"],
  15: ["h","h","d","d","d","h","h","h","h","h"],
  16: ["h","h","d","d","d","h","h","h","h","h"],
  17: ["h","d","d","d","d","h","h","h","h","h"],
  18: ["d","d","d","d","d","s","s","h","h","h"],
  19: ["s","s","s","s","d","s","s","s","s","s"],
  20: ["s","s","s","s","s","s","s","s","s","s"],
};

// pair splitting (by card value, so 10 covers 10/J/Q/K)
// y=split, n=don't split
const PAIRS: Record<number, string[]> = {
  2:  ["y","y","y","y","y","y","n","n","n","n"],
  3:  ["y","y","y","y","y","y","n","n","n","n"],
  4:  ["n","n","n","y","y","n","n","n","n","n"],
  5:  ["n","n","n","n","n","n","n","n","n","n"],
  6:  ["y","y","y","y","y","n","n","n","n","n"],
  7:  ["y","y","y","y","y","y","n","n","n","n"],
  8:  ["y","y","y","y","y","y","y","y","y","y"],
  9:  ["y","y","y","y","y","n","y","y","n","n"],
  10: ["n","n","n","n","n","n","n","n","n","n"],
  11: ["y","y","y","y","y","y","y","y","y","y"],
};

function dealerUpcardIndex(upcardValue: number): number {
  // columns go 2,3,4,5,6,7,8,9,10,A(11)
  if (upcardValue === 11) return 9;
  return upcardValue - 2;
}

function lookupAction(table: Record<number, string[]>, total: number, colIdx: number): string | null {
  const row = table[total];
  if (!row) return null;
  return row[colIdx] ?? null;
}

export const basicStrategy: PlayerPolicy = {
  name: "basic_strategy",

  decideAction(state: GameStateView): PlayerAction {
    const { playerHand, dealerUpcard } = state;
    const { total, canDouble, canSplit, canSurrender } = playerHand;
    const dealerVal = getCardValue(dealerUpcard.card);
    const col = dealerUpcardIndex(dealerVal);

    // check for pairs first
    if (canSplit && playerHand.cards.length === 2) {
      const cardVal = getCardValue(playerHand.cards[0]);
      const pairAction = lookupAction(PAIRS, cardVal, col);
      if (pairAction === "y") return "split";
    }

    // soft totals
    if (total.isSoft && total.bestTotal >= 13 && total.bestTotal <= 20) {
      const action = lookupAction(SOFT, total.bestTotal, col);
      if (action === "d") return canDouble ? "double" : "hit";
      if (action === "s") return "stand";
      return "hit";
    }

    // hard totals
    const hardTotal = Math.min(total.bestTotal, 20);
    const clampedTotal = Math.max(hardTotal, 5);
    const action = lookupAction(HARD, clampedTotal, col);

    if (action === "d") return canDouble ? "double" : "hit";
    if (action === "r") return canSurrender ? "surrender" : "hit";
    if (action === "s") return "stand";
    return "hit";
  },
};
