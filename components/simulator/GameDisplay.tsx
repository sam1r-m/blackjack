"use client";

import type { Card, RoundOutcome } from "@/types/blackjack";

interface GameDisplayProps {
  lastOutcome: RoundOutcome | null;
  currentBankroll: number;
  isAnimating: boolean;
}

function getSuitSymbol(suit: string): string {
  const map: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  return map[suit] ?? "?";
}

function isRedSuit(suit: string): boolean {
  return suit === "hearts" || suit === "diamonds";
}

function CardView({ card }: { card: Card }) {
  const red = isRedSuit(card.suit);

  return (
    <div className="flex h-[72px] w-[52px] flex-col items-center justify-between rounded-sm border border-border bg-[#1a2230] p-1.5 shadow-md transition-transform">
      <span
        className={`self-start font-[family-name:var(--font-pixel)] text-[10px] ${red ? "text-loss" : "text-text"}`}
      >
        {card.rank}
      </span>
      <span className={`text-lg ${red ? "text-loss" : "text-muted"}`}>
        {getSuitSymbol(card.suit)}
      </span>
    </div>
  );
}

const resultLabel: Record<string, { text: string; color: string }> = {
  win: { text: "WIN", color: "text-accent" },
  blackjack: { text: "BLACKJACK!", color: "text-highlight" },
  loss: { text: "LOSS", color: "text-loss" },
  push: { text: "PUSH", color: "text-muted" },
  surrender: { text: "SURRENDER", color: "text-info" },
};

export default function GameDisplay({
  lastOutcome,
  currentBankroll,
  isAnimating,
}: GameDisplayProps) {
  if (!lastOutcome) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-md border border-border bg-panel-elevated/50">
        <div className="flex gap-3 text-3xl text-muted/20">
          <span>♠</span>
          <span>♥</span>
          <span>♦</span>
          <span>♣</span>
        </div>
        <p className="mt-3 font-[family-name:var(--font-pixel)] text-[10px] text-muted/40">
          deal a hand to begin
        </p>
      </div>
    );
  }

  const result = resultLabel[lastOutcome.result] ?? {
    text: lastOutcome.result,
    color: "text-text",
  };

  return (
    <div
      className={`relative flex min-h-[200px] flex-col items-center justify-center gap-5 rounded-md border border-border bg-panel-elevated/50 p-5 transition-opacity ${isAnimating ? "opacity-80" : "opacity-100"}`}
    >
      {/* bankroll */}
      <div className="absolute top-3 right-4 font-[family-name:var(--font-mono)] text-sm text-muted">
        Cash: <span className="text-highlight">${currentBankroll.toFixed(0)}</span>
      </div>

      {/* bet */}
      <div className="absolute top-3 left-4 font-[family-name:var(--font-mono)] text-sm text-muted">
        Bet: <span className="text-text">${lastOutcome.bet}</span>
      </div>

      {/* dealer */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-[family-name:var(--font-pixel)] text-[9px] text-muted">
          Dealer · {lastOutcome.dealerTotal}
        </span>
        <div className="flex gap-1.5">
          {lastOutcome.dealerCards.map((card, i) => (
            <CardView key={`d-${i}`} card={card} />
          ))}
        </div>
      </div>

      {/* result */}
      <div className={`font-[family-name:var(--font-pixel)] text-sm ${result.color}`}>
        {result.text}
        {lastOutcome.netWin !== 0 && (
          <span className="ml-2 font-[family-name:var(--font-mono)] text-xs">
            ({lastOutcome.netWin > 0 ? "+" : ""}
            {lastOutcome.netWin})
          </span>
        )}
      </div>

      {/* player */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {lastOutcome.playerCards.map((card, i) => (
            <CardView key={`p-${i}`} card={card} />
          ))}
        </div>
        <span className="font-[family-name:var(--font-pixel)] text-[9px] text-muted">
          Player · {lastOutcome.playerTotal}
        </span>
      </div>
    </div>
  );
}
