"use client";

import { useState } from "react";
import StrategyModal from "./StrategyModal";
import type { DealerRule, BlackjackPayout } from "@/types/blackjack";
import type { BettingStrategyType } from "@/types/simulation";

export interface SimulatorSettings {
  bankroll: number;
  baseBet: number;
  deckCount: number;
  blackjackPayout: BlackjackPayout;
  dealerRule: DealerRule;
  bettingStrategy: BettingStrategyType;
  autoplay: boolean;
  speed: number;
  tableMax: number;
  penetration: number;
}

interface ControlPanelProps {
  settings: SimulatorSettings;
  onSettingsChange: (s: SimulatorSettings) => void;
  onDealHand: () => void;
  onToggleAutoplay: () => void;
  isRunning: boolean;
  sessionActive: boolean;
  onReset: () => void;
}

export default function ControlPanel({
  settings,
  onSettingsChange,
  onDealHand,
  onToggleAutoplay,
  isRunning,
  sessionActive,
  onReset,
}: ControlPanelProps) {
  const [showStrategy, setShowStrategy] = useState(false);

  const update = <K extends keyof SimulatorSettings>(key: K, value: SimulatorSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* action buttons */}
      <div className="rounded-md border border-border bg-panel p-4">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-bold text-highlight">
          Controls
        </h2>
        <div className="space-y-2.5">
          <button
            onClick={onDealHand}
            disabled={isRunning}
            className="w-full rounded-md border-2 border-highlight bg-highlight py-2.5 font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a] disabled:opacity-50"
          >
            Play One Hand
          </button>
          <button
            onClick={onToggleAutoplay}
            className={`w-full rounded-md border-2 py-2.5 font-[family-name:var(--font-display)] text-sm font-bold tracking-wide transition-all active:translate-y-[2px] ${
              settings.autoplay
                ? "border-accent bg-accent text-bg shadow-[0_3px_0_#248a6e] active:shadow-[0_1px_0_#248a6e]"
                : "border-accent bg-accent/10 text-accent shadow-[0_3px_0_#1a3d32] hover:bg-accent/20 active:shadow-[0_1px_0_#1a3d32]"
            }`}
          >
            {settings.autoplay ? "■ Stop" : "▶ Keep Playing"}
          </button>

          {settings.autoplay && (
            <div>
              <label className="mb-1 block text-xs text-muted">
                Speed: {settings.speed * 100}ms
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={settings.speed}
                onChange={(e) => update("speed", Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {sessionActive && (
            <button
              onClick={onReset}
              className="w-full rounded-md border border-loss/30 py-2 text-sm text-loss shadow-[0_2px_0_rgba(232,68,108,0.2)] transition-all hover:border-loss hover:bg-loss/10 active:translate-y-[1px] active:shadow-none"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* settings */}
      <div className="rounded-md border border-border bg-panel p-4">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-bold text-highlight">
          Settings
        </h2>
        <div className="space-y-3">
          <ControlField label="Decks">
            <select
              value={settings.deckCount}
              onChange={(e) => update("deckCount", Number(e.target.value))}
              disabled={sessionActive}
              className="w-full"
            >
              <option value={1}>1 Deck</option>
              <option value={2}>2 Decks</option>
              <option value={4}>4 Decks</option>
              <option value={6}>6 Decks</option>
              <option value={8}>8 Decks</option>
            </select>
          </ControlField>

          <ControlField label="BJ Payout">
            <select
              value={settings.blackjackPayout}
              onChange={(e) => update("blackjackPayout", e.target.value as BlackjackPayout)}
              disabled={sessionActive}
              className="w-full"
            >
              <option value="3_to_2">3:2</option>
              <option value="6_to_5">6:5</option>
              <option value="1_to_1">1:1</option>
            </select>
          </ControlField>

          <ControlField label="Bankroll">
            <input
              type="number"
              value={settings.bankroll}
              onChange={(e) => update("bankroll", Number(e.target.value))}
              disabled={sessionActive}
              className="w-full"
            />
          </ControlField>

          <ControlField label="Initial Bet">
            <input
              type="number"
              value={settings.baseBet}
              onChange={(e) => update("baseBet", Number(e.target.value))}
              disabled={sessionActive}
              className="w-full"
            />
          </ControlField>

          <ControlField label="Strategy">
            <select
              value={settings.bettingStrategy}
              onChange={(e) => update("bettingStrategy", e.target.value as BettingStrategyType)}
              disabled={sessionActive}
              className="w-full"
            >
              <option value="flat">Flat Bet</option>
              <option value="martingale">Martingale</option>
              <option value="reverse_martingale">Reverse Martingale</option>
            </select>
          </ControlField>
        </div>
      </div>

      {/* strategy guide */}
      <button
        onClick={() => setShowStrategy(true)}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-info/30 bg-panel px-4 py-2.5 text-sm text-info shadow-[0_2px_0_rgba(77,163,255,0.15)] transition-all hover:border-info/60 hover:bg-info/5 active:translate-y-[1px] active:shadow-none"
      >
        ⓘ Basic Strategy Guide
      </button>

      <StrategyModal isOpen={showStrategy} onClose={() => setShowStrategy(false)} />
    </>
  );
}

function ControlField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}
