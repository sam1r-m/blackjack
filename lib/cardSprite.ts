import type { Card } from "@/types/blackjack";

const RANK_SPRITE: Record<string, string> = {
  A: "ace",
  J: "jack",
  Q: "queen",
  K: "king",
};

const SUIT_SPRITE: Record<string, string> = {
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs",
  spades: "Spades",
};

export const CARD_BACK_SPRITE = "/Deck of Cards/blueBackofCards.png";

/** path to the pixel sprite for a card, e.g. /Deck of Cards/queenSpades.png */
export function cardToSprite(card: Card): string {
  const rank = RANK_SPRITE[card.rank] ?? card.rank;
  const suit = SUIT_SPRITE[card.suit] ?? card.suit;
  return `/Deck of Cards/${rank}${suit}.png`;
}
