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
    this.shuffle();
  }

  // fisher-yates shuffle - goes backwards through the array
  // swapping each element with a random earlier one
  shuffle(): void {
    this.pointer = 0;
    this.cards = createStandardDecks(this.deckCount);
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  // true once the cut card is reached. the shoe keeps dealing from where it
  // is, because a real table finishes the round before reshuffling
  needsShuffle(): boolean {
    return this.pointer >= Math.floor(this.totalCards * this.penetration);
  }

  // call between rounds, never inside one - reshuffling mid-round would let
  // the same physical card come out twice in a single hand
  shuffleIfNeeded(): void {
    if (this.needsShuffle()) this.shuffle();
  }

  draw(): Card {
    // safety net only: a single round cannot consume the tail left after the
    // cut card, but never hand back undefined if something changes
    if (this.pointer >= this.cards.length) this.shuffle();
    return this.cards[this.pointer++];
  }

  remaining(): number {
    return this.totalCards - this.pointer;
  }

  get cardsDealt(): number {
    return this.pointer;
  }
}
