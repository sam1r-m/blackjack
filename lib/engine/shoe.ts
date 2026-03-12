import type { Card } from "@/types/blackjack";
import { createStandardDecks } from "./card";

export interface ShoeConfig {
  deckCount: number;
  penetration: number;
  rng?: () => number;
}

export class Shoe {
  private cards: Card[] = [];
  private pointer = 0;
  private deckCount: number;
  private penetration: number;
  private rng: () => number;
  private totalCards: number;

  constructor(config: ShoeConfig) {
    this.deckCount = config.deckCount;
    this.penetration = config.penetration;
    this.rng = config.rng ?? Math.random;
    this.totalCards = this.deckCount * 52;
    this.cards = createStandardDecks(this.deckCount);
    this.shuffle();
  }

  // fisher-yates shuffle - goes backwards through the array
  // swapping each element with a random earlier one
  shuffle(): void {
    this.pointer = 0;
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card {
    // reshuffle if we've hit the penetration threshold
    if (this.pointer >= Math.floor(this.totalCards * this.penetration)) {
      this.cards = createStandardDecks(this.deckCount);
      this.shuffle();
    }
    return this.cards[this.pointer++];
  }

  remaining(): number {
    return this.totalCards - this.pointer;
  }

  get cardsDealt(): number {
    return this.pointer;
  }
}
