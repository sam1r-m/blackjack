import type { Card, HandTotal } from "@/types/blackjack";
import { getCardValue, isAce } from "./card";

export function getHandTotals(cards: Card[]): HandTotal {
  let hardTotal = 0;
  let aces = 0;

  // count every ace as 1 first, then promote at most one of them to 11.
  // two aces at 11 would already be 22, so only ever one can be promoted.
  for (const card of cards) {
    if (isAce(card)) {
      aces++;
      hardTotal += 1;
    } else {
      hardTotal += getCardValue(card);
    }
  }

  const canPromoteAce = aces > 0 && hardTotal + 10 <= 21;
  const softTotal = canPromoteAce ? hardTotal + 10 : null;

  return {
    hardTotal,
    softTotal,
    bestTotal: softTotal ?? hardTotal,
    isSoft: softTotal !== null,
  };
}

// a hand is splittable when its two cards share a value, which is what
// puts 10/J/Q/K in the same bucket the way most tables play it
export function isPair(cards: Card[]): boolean {
  return cards.length === 2 && getCardValue(cards[0]) === getCardValue(cards[1]);
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return getHandTotals(cards).bestTotal === 21;
}

export function isBust(cards: Card[]): boolean {
  return getHandTotals(cards).bestTotal > 21;
}
