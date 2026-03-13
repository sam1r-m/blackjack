// core card types
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  rank: Rank;
  suit: Suit;
}

// hand evaluation
export interface HandTotal {
  hardTotal: number;
  softTotal: number | null;
  bestTotal: number;
  isSoft: boolean;
}

export type RoundResultType = "win" | "loss" | "push" | "blackjack" | "surrender";

export interface RoundOutcome {
  result: RoundResultType;
  bet: number;
  netWin: number;
  playerTotal: number;
  dealerTotal: number;
  playerBlackjack: boolean;
  dealerBlackjack: boolean;
  playerCards: Card[];
  dealerCards: Card[];
  isBust: boolean;
  doubled: boolean;
}

// rule config
export type DealerRule = "hit_soft_17" | "stand_soft_17";
export type BlackjackPayout = "3_to_2" | "6_to_5" | "1_to_1";

// player action types
export type PlayerAction = "hit" | "stand" | "double" | "split" | "surrender";

// what a player policy can see when deciding
export interface PlayerHandView {
  cards: Card[];
  total: HandTotal;
  canSplit: boolean;
  canDouble: boolean;
  canSurrender: boolean;
  isFirstAction: boolean;
}

export interface DealerUpcardView {
  card: Card;
}

export interface GameStateView {
  playerHand: PlayerHandView;
  dealerUpcard: DealerUpcardView;
  trueCount?: number;
  rules: {
    dealerRule: DealerRule;
    blackjackPayout: BlackjackPayout;
    deckCount: number;
  };
}

// player policy interface - strategies implement this
export interface PlayerPolicy {
  name: string;
  decideAction(state: GameStateView): PlayerAction;
}

// round config for the engine
export interface RoundConfig {
  rules: {
    dealerRule: DealerRule;
    blackjackPayout: BlackjackPayout;
    allowSurrender?: boolean;
    allowDouble?: boolean;
  };
}
