"use client";

import type { Card, RoundOutcome } from "@/types/blackjack";

interface GameDisplayProps {
  lastOutcome: RoundOutcome | null;
  currentBankroll: number;
  isAnimating: boolean;
  handNumber: number;
}

function cardToSprite(card: Card): string {
  const rankMap: Record<string, string> = {
    A: "ace",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    J: "jack",
    Q: "queen",
    K: "king",
  };
  const suitMap: Record<string, string> = {
    hearts: "Hearts",
    diamonds: "Diamonds",
    clubs: "Clubs",
    spades: "Spades",
  };
  const rank = rankMap[card.rank] ?? card.rank;
  const suit = suitMap[card.suit] ?? card.suit;
  return `/Deck of Cards/${rank}${suit}.png`;
}

function CardView({ card }: { card: Card }) {
  const src = cardToSprite(card);
  return (
    <img
      src={src}
      alt={`${card.rank} of ${card.suit}`}
      width={81}
      height={113}
      className="h-[113px] w-[81px] object-contain transition-transform"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

const resultLabel: Record<string, { text: string; color: string }> = {
  win: { text: "WIN", color: "text-accent" },
  blackjack: { text: "BLACKJACK!", color: "text-highlight" },
  loss: { text: "LOSS", color: "text-loss" },
  push: { text: "PUSH", color: "text-info" },
  surrender: { text: "SURRENDER", color: "text-[#9b6dff]" },
};

export default function GameDisplay({
  lastOutcome,
  currentBankroll,
  isAnimating,
  handNumber,
}: GameDisplayProps) {
  const feltBox = (
    <div
      className="relative min-h-[360px] overflow-hidden rounded-lg"
      style={{
        backgroundImage: "url(/Background_Green_Felt.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 3px #1e2a35, 0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div className="relative flex min-h-[360px] flex-col items-center justify-center gap-5 p-6">
        {!lastOutcome ? (
          <>
            <div
              className="flex gap-3 text-3xl text-bg"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
            >
              <span>♠</span>
              <span>♥</span>
              <span>♦</span>
              <span>♣</span>
            </div>
            <p className="font-[family-name:var(--font-pixel)] text-[10px] text-bg">
              deal a hand to begin
            </p>
            <div className="absolute bottom-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Hand:</span>{" "}
              <span className="font-black text-text">{handNumber}</span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Cash:</span> <span className="text-highlight">${currentBankroll.toFixed(0)}</span>
            </div>
            <div className="absolute top-3 left-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Bet:</span>{" "}
              <span className="text-text">${lastOutcome.bet}</span>
            </div>
            <div className="absolute bottom-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Hand:</span>{" "}
              <span className="font-black text-text">{handNumber}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                Dealer · {lastOutcome.dealerTotal}
              </span>
              <div className="flex gap-1.5">
                {lastOutcome.dealerCards.map((card, i) => (
                  <CardView key={`d-${i}`} card={card} />
                ))}
              </div>
            </div>
            <div className={`font-[family-name:var(--font-pixel)] text-sm ${resultLabel[lastOutcome.result]?.color ?? "text-text"}`}>
              {resultLabel[lastOutcome.result]?.text ?? lastOutcome.result}
              {lastOutcome.doubled && " (2x)"}
              {lastOutcome.netWin !== 0 && (
                <span className="ml-2 font-[family-name:var(--font-mono)] text-xs">
                  ({lastOutcome.netWin > 0 ? "+" : ""}
                  {lastOutcome.netWin})
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {lastOutcome.playerCards.map((card, i) => (
                  <CardView key={`p-${i}`} card={card} />
                ))}
              </div>
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                Player · {lastOutcome.playerTotal}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`transition-opacity ${isAnimating ? "opacity-80" : "opacity-100"}`}
    >
      {feltBox}
    </div>
  );
}
