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

const plColors: Record<string, string> = {
  win: "text-accent",
  blackjack: "text-highlight",
  loss: "text-loss",
  push: "text-info",
  surrender: "text-[#9b6dff]",
};

const actionLabels: Record<PlayerAction, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

const actionHotkeys: Record<PlayerAction, string> = {
  hit: "H",
  stand: "S",
  double: "D",
  split: "S",
  surrender: "W",
};

const actionCalloutStyles: Record<PlayerAction, { border: string; text: string }> = {
  hit: { border: "border-accent", text: "text-accent" },
  stand: { border: "border-highlight", text: "text-highlight" },
  double: { border: "border-info", text: "text-info" },
  split: { border: "border-info", text: "text-info" },
  surrender: { border: "border-[#9b6dff]", text: "text-[#9b6dff]" },
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

  const actionBtn = (action: PlayerAction, onClick: () => void, variant: "accent" | "highlight" | "info" | "surrender") => {
    const styles = {
      accent: "border-accent bg-accent text-bg shadow-[0_4px_0_#1a3d32] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#1a3d32]",
      highlight: "border-highlight bg-highlight text-bg shadow-[0_4px_0_#5c4a0a] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#5c4a0a]",
      info: "border-info bg-info text-bg shadow-[0_4px_0_#1a2d4d] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#1a2d4d]",
      surrender: "border-[#9b6dff] bg-[#9b6dff] text-bg shadow-[0_4px_0_#3d2a5c] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#3d2a5c]",
    };
    const label = actionLabels[action];
    const hotkey = actionHotkeys[action];
    return (
      <button
        key={action}
        onClick={onClick}
        className={`w-full rounded-lg border-2 px-3 py-2.5 font-[family-name:var(--font-pixel)] text-[10px] font-bold tracking-wide transition-all ${styles[variant]}`}
      >
        <span className="block">{label}</span>
        <span className="mt-0.5 block text-[8px] opacity-90">[{hotkey}]</span>
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
      <div className="relative flex h-full w-full items-center justify-center p-4">
        {/* Cards: centered in felt */}
        <div className="flex flex-col items-center justify-center gap-3">
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
              <div className="flex flex-col items-center gap-1.5">
                <span className="rounded-md bg-black/50 px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[11px] font-bold text-white drop-shadow-md">Dealer</span>
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
                <span className="rounded-md bg-black/50 px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[11px] font-bold text-white drop-shadow-md">
                  Player · {getHandTotals(displayPending.playerCards).bestTotal}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <span className="rounded-md bg-black/50 px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[11px] font-bold text-white drop-shadow-md">
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
                <span className="rounded-md bg-black/50 px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[11px] font-bold text-white drop-shadow-md">
                  Player · {displayOutcome!.playerTotal}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action buttons: absolute overlay on left */}
        {((manualMode && canDealHand && onDealHand) || displayPending) && (
          <div className="absolute left-4 top-1/2 flex w-28 -translate-y-1/2 flex-col gap-2">
            {!displayOutcome && !displayPending && manualMode && canDealHand && onDealHand && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={onDealHand}
                  className="rounded-lg border-2 border-highlight bg-highlight py-2.5 px-5 font-[family-name:var(--font-pixel)] text-[10px] font-bold tracking-wide text-bg shadow-[0_4px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#c9981a]"
                >
                  Deal
                </button>
                <span className="font-[family-name:var(--font-pixel)] text-[7px] text-bg/70">[Space]</span>
              </div>
            )}
            {displayPending && onManualAction && (
              <>
                {actionBtn("hit", () => onManualAction("hit"), "accent")}
                {actionBtn("stand", () => onManualAction("stand"), "highlight")}
                {displayPending.isFirstAction &&
                  displayPending.playerCards.length === 2 &&
                  displayPending.config.rules.allowDouble !== false &&
                  actionBtn("double", () => onManualAction("double"), "info")}
                {displayPending.isFirstAction &&
                  displayPending.config.rules.allowSurrender !== false &&
                  actionBtn("surrender", () => onManualAction("surrender"), "surrender")}
              </>
            )}
            {displayOutcome && manualMode && canDealHand && onDealHand && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={onDealHand}
                  className="rounded-lg border-2 border-highlight bg-highlight py-2.5 px-5 font-[family-name:var(--font-pixel)] text-[10px] font-bold tracking-wide text-bg shadow-[0_4px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#c9981a]"
                >
                  Deal Next
                </button>
                <span className="font-[family-name:var(--font-pixel)] text-[7px] text-bg/70">[Space]</span>
              </div>
            )}
          </div>
        )}

        {/* Basic Strategy: right side of felt */}
        {showBasicStrategy && recommendedAction && (
          <div
            className={`absolute right-4 top-1/2 min-w-28 w-max -translate-y-1/2 rounded-lg border-2 bg-panel/95 p-3 shadow-lg ${actionCalloutStyles[recommendedAction].border}`}
          >
            <span className="font-[family-name:var(--font-pixel)] text-[8px] text-muted">
              Basic Strategy
            </span>
            <p className={`mt-1 font-[family-name:var(--font-pixel)] text-sm font-bold whitespace-nowrap ${actionCalloutStyles[recommendedAction].text}`}>
              {actionLabels[recommendedAction]}
            </p>
            <span className={`mt-0.5 block font-[family-name:var(--font-mono)] text-[9px] ${actionCalloutStyles[recommendedAction].text} opacity-90`}>
              [{actionHotkeys[recommendedAction]}]
            </span>
          </div>
        )}

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
            <span className="flex items-center gap-1.5">
              {lastOutcome && (
                <span className={plColors[lastOutcome.result] ?? "text-muted"}>
                  ({lastOutcome.netWin >= 0 ? "+" : ""}{lastOutcome.netWin})
                </span>
              )}
              <span>
                <span className="font-bold text-bg">Cash:</span>{" "}
                <span className="text-highlight">${currentBankroll.toFixed(0)}</span>
              </span>
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
