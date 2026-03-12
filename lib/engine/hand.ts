import type { Card, HandTotal } from "@/types/blackjack";
import { getCardValue, isAce } from "./card";

export function getHandTotals(cards: Card[]): HandTotal {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += getCardValue(card);
    if (isAce(card)) aces++;
  }

  // hard total - count all aces as 1
  const hardTotal = total - aces * 10;

  // soft total only exists if we have an ace and counting it as 11 doesn't bust
  let softTotal: number | null = null;
  if (aces > 0 && total <= 21) {
    softTotal = total;
  }

  // best total is soft if it exists and doesn't bust, otherwise hard
  const bestTotal = softTotal !== null ? softTotal : hardTotal;
  const isSoft = softTotal !== null && softTotal <= 21 && softTotal !== hardTotal;

  return { hardTotal, softTotal, bestTotal, isSoft };
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return getHandTotals(cards).bestTotal === 21;
}

export function isBust(cards: Card[]): boolean {
  return getHandTotals(cards).bestTotal > 21;
}
