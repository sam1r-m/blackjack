"use client";

import type { Card, RoundOutcome, PlayerAction } from "@/types/blackjack";
import type { ManualRoundPendingDisplay } from "@/lib/engine/manualRound";
import { getHandTotals } from "@/lib/engine/hand";

interface GameDisplayProps {
  lastOutcome: RoundOutcome | null;
  currentBankroll: number;
  isAnimating: boolean;
  handNumber: number;
  manualPending?: ManualRoundPendingDisplay | null;
  onManualAction?: (action: PlayerAction) => void;
  recommendedAction?: PlayerAction | null;
  showBasicStrategy?: boolean;
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

const actionLabels: Record<PlayerAction, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

export default function GameDisplay({
  lastOutcome,
  currentBankroll,
  isAnimating,
  handNumber,
  manualPending,
  onManualAction,
  recommendedAction,
  showBasicStrategy,
}: GameDisplayProps) {
  const displayOutcome = lastOutcome;
  const displayPending = manualPending;

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
        {!displayOutcome && !displayPending ? (
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
        ) : displayPending ? (
          <>
            {showBasicStrategy && recommendedAction && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-md border border-info/40 bg-panel/90 px-2 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] text-info">
                Basic: {actionLabels[recommendedAction]}
              </div>
            )}
            <div className="absolute top-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Cash:</span>{" "}
              <span className="text-highlight">${currentBankroll.toFixed(0)}</span>
            </div>
            <div className="absolute top-3 left-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Bet:</span>{" "}
              <span className="text-text">${displayPending.currentBet}</span>
            </div>
            <div className="absolute bottom-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Hand:</span>{" "}
              <span className="font-black text-text">{handNumber}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                Dealer
              </span>
              <div className="flex gap-1.5">
                <CardView card={displayPending.dealerCards[0]} />
                <img
                  src="/Deck of Cards/blueBackofCards.png"
                  alt="hole"
                  width={81}
                  height={113}
                  className="h-[113px] w-[81px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {displayPending.playerCards.map((card, i) => (
                  <CardView key={`p-${i}`} card={card} />
                ))}
              </div>
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                Player · {getHandTotals(displayPending.playerCards).bestTotal}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => onManualAction?.("hit")}
                className="rounded-md border-2 border-accent bg-accent/20 px-4 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] text-accent shadow-[0_2px_0_#1a3d32] transition-all hover:bg-accent/30 active:translate-y-[1px] active:shadow-none"
              >
                Hit
              </button>
              <button
                onClick={() => onManualAction?.("stand")}
                className="rounded-md border-2 border-highlight bg-highlight/20 px-4 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] text-highlight shadow-[0_2px_0_#5c4a0a] transition-all hover:bg-highlight/30 active:translate-y-[1px] active:shadow-none"
              >
                Stand
              </button>
              {displayPending.isFirstAction &&
                displayPending.playerCards.length === 2 &&
                displayPending.config.rules.allowDouble !== false && (
                  <button
                    onClick={() => onManualAction?.("double")}
                    className="rounded-md border-2 border-info bg-info/20 px-4 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] text-info shadow-[0_2px_0_#1a2d4d] transition-all hover:bg-info/30 active:translate-y-[1px] active:shadow-none"
                  >
                    Double
                  </button>
                )}
              {displayPending.isFirstAction &&
                displayPending.config.rules.allowSurrender !== false && (
                  <button
                    onClick={() => onManualAction?.("surrender")}
                    className="rounded-md border-2 border-[#9b6dff] bg-[#9b6dff]/20 px-4 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] text-[#9b6dff] shadow-[0_2px_0_#3d2a5c] transition-all hover:bg-[#9b6dff]/30 active:translate-y-[1px] active:shadow-none"
                  >
                    Surrender
                  </button>
                )}
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Cash:</span>{" "}
              <span className="text-highlight">${currentBankroll.toFixed(0)}</span>
            </div>
            <div className="absolute top-3 left-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Bet:</span>{" "}
              <span className="text-text">${displayOutcome!.bet}</span>
            </div>
            <div className="absolute bottom-3 right-4 font-[family-name:var(--font-mono)] text-sm">
              <span className="font-bold text-bg">Hand:</span>{" "}
              <span className="font-black text-text">{handNumber}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                Dealer · {displayOutcome!.dealerTotal}
              </span>
              <div className="flex gap-1.5">
                {displayOutcome!.dealerCards.map((card, i) => (
                  <CardView key={`d-${i}`} card={card} />
                ))}
              </div>
            </div>
            <div className={`font-[family-name:var(--font-pixel)] text-sm ${resultLabel[displayOutcome!.result]?.color ?? "text-text"}`}>
              {resultLabel[displayOutcome!.result]?.text ?? displayOutcome!.result}
              {displayOutcome!.doubled && " (2x)"}
              {displayOutcome!.netWin !== 0 && (
                <span className="ml-2 font-[family-name:var(--font-mono)] text-xs">
                  ({displayOutcome!.netWin > 0 ? "+" : ""}
                  {displayOutcome!.netWin})
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {displayOutcome!.playerCards.map((card, i) => (
                  <CardView key={`p-${i}`} card={card} />
                ))}
              </div>
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                Player · {displayOutcome!.playerTotal}
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
