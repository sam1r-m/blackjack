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
  /** When true, show a Deal button on the table (manual mode QoL) */
  onDealHand?: () => void;
  canDealHand?: boolean;
  manualMode?: boolean;
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
  onDealHand,
  canDealHand,
  manualMode,
}: GameDisplayProps) {
  const displayOutcome = lastOutcome;
  const displayPending = manualPending;

  const actionBtn = (label: string, onClick: () => void, variant: "accent" | "highlight" | "info" | "surrender") => {
    const styles = {
      accent: "border-accent bg-accent/20 text-accent shadow-[0_2px_0_#1a3d32] hover:bg-accent/30",
      highlight: "border-highlight bg-highlight/20 text-highlight shadow-[0_2px_0_#5c4a0a] hover:bg-highlight/30",
      info: "border-info bg-info/20 text-info shadow-[0_2px_0_#1a2d4d] hover:bg-info/30",
      surrender: "border-[#9b6dff] bg-[#9b6dff]/20 text-[#9b6dff] shadow-[0_2px_0_#3d2a5c] hover:bg-[#9b6dff]/30",
    };
    return (
      <button
        key={label}
        onClick={onClick}
        className={`w-full rounded-md border-2 px-3 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] transition-all active:translate-y-[1px] active:shadow-none ${styles[variant]}`}
      >
        {label}
      </button>
    );
  };

  const feltBox = (
    <div
      className="relative h-[360px] overflow-hidden rounded-xl border-[3px] border-[#1e2a35]"
      style={{
        backgroundImage: "url(/Background_Green_Felt.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow:
          "inset 0 0 56px 21px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div className="relative flex h-full w-full items-stretch gap-4 p-4">
        {/* Left: action buttons (manual pending) or Deal button (initial/outcome) - only when we have actions */}
        {((manualMode && canDealHand && onDealHand) || displayPending) && (
        <div className="flex w-24 shrink-0 flex-col justify-center gap-2">
          {!displayOutcome && !displayPending && manualMode && canDealHand && onDealHand && (
            <>
              <button
                onClick={onDealHand}
                className="rounded-md border-2 border-highlight bg-highlight py-2 px-4 font-[family-name:var(--font-pixel)] text-[10px] tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a]"
              >
                Deal
              </button>
              <span className="font-[family-name:var(--font-pixel)] text-[7px] text-bg/70">Space</span>
            </>
          )}
          {displayPending && onManualAction && (
            <>
              {actionBtn("Hit", () => onManualAction("hit"), "accent")}
              {actionBtn("Stand", () => onManualAction("stand"), "highlight")}
              {displayPending.isFirstAction &&
                displayPending.playerCards.length === 2 &&
                displayPending.config.rules.allowDouble !== false &&
                actionBtn("Double", () => onManualAction("double"), "info")}
              {displayPending.isFirstAction &&
                displayPending.config.rules.allowSurrender !== false &&
                actionBtn("Surrender", () => onManualAction("surrender"), "surrender")}
            </>
          )}
          {displayOutcome && manualMode && canDealHand && onDealHand && (
            <button
              onClick={onDealHand}
              className="rounded-md border-2 border-highlight bg-highlight py-2 px-4 font-[family-name:var(--font-pixel)] text-[9px] tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a]"
            >
              Deal Next
            </button>
          )}
        </div>
        )}

        {/* Right: cards and content */}
        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-3 p-2">
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
                Deal a hand to begin
              </p>
            </>
          ) : displayPending ? (
            <>
              {showBasicStrategy && recommendedAction && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-md border border-info/40 bg-panel/90 px-2 py-1 font-[family-name:var(--font-pixel)] text-[7px] text-info">
                  Basic: {actionLabels[recommendedAction]}
                </div>
              )}
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">Dealer</span>
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
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex gap-1.5">
                  {displayPending.playerCards.map((card, i) => (
                    <CardView key={`p-${i}`} card={card} />
                  ))}
                </div>
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                  Player · {getHandTotals(displayPending.playerCards).bestTotal}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-[family-name:var(--font-pixel)] text-[9px] text-bg">
                  Dealer · {displayOutcome!.dealerTotal}
                </span>
                <div className="flex gap-1.5">
                  {displayOutcome!.dealerCards.map((card, i) => (
                    <CardView key={`d-${i}`} card={card} />
                  ))}
                </div>
              </div>
              <div
                className={`font-[family-name:var(--font-pixel)] text-xs ${resultLabel[displayOutcome!.result]?.color ?? "text-text"}`}
              >
                {resultLabel[displayOutcome!.result]?.text ?? displayOutcome!.result}
                {displayOutcome!.doubled && " (2x)"}
                {displayOutcome!.netWin !== 0 && (
                  <span className="ml-1 font-[family-name:var(--font-mono)] text-[10px]">
                    ({displayOutcome!.netWin > 0 ? "+" : ""}
                    {displayOutcome!.netWin})
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1.5">
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

        {/* Corner HUD */}
        <div className="absolute bottom-2 right-3 font-[family-name:var(--font-mono)] text-xs">
          <span className="font-bold text-bg">Hand:</span>{" "}
          <span className="font-black text-text">{handNumber}</span>
        </div>
        {(displayPending || displayOutcome) && (
          <div className="absolute right-3 top-2 flex flex-col items-end gap-0.5 font-[family-name:var(--font-mono)] text-xs">
            <span>
              <span className="font-bold text-bg">Bet:</span>{" "}
              <span className="text-text">
                ${displayPending?.currentBet ?? displayOutcome?.bet ?? 0}
              </span>
            </span>
            <span>
              <span className="font-bold text-bg">Cash:</span>{" "}
              <span className="text-highlight">${currentBankroll.toFixed(0)}</span>
            </span>
          </div>
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
