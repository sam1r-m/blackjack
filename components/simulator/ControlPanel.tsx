"use client";

import { useState } from "react";
import StrategyModal from "./StrategyModal";
import Select from "@/components/common/Select";
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
        <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-highlight">
          Controls
        </h2>
        <div className="space-y-2.5">
          <button
            onClick={onDealHand}
            disabled={isRunning}
            className="w-full rounded-md border-2 border-highlight bg-highlight py-2.5 font-[family-name:var(--font-pixel)] text-[10px] tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a] disabled:opacity-50"
          >
            Play One Hand
          </button>
          <button
            onClick={onToggleAutoplay}
            className={`w-full rounded-md border-2 py-2.5 font-[family-name:var(--font-pixel)] text-[10px] tracking-wide transition-all active:translate-y-[2px] ${
              settings.autoplay
                ? "border-accent bg-accent text-bg shadow-[0_3px_0_#248a6e] active:shadow-[0_1px_0_#248a6e]"
                : "border-accent bg-accent/10 text-accent shadow-[0_3px_0_#1a3d32] hover:bg-accent/20 active:shadow-[0_1px_0_#1a3d32]"
            }`}
          >
            {settings.autoplay ? "■ Stop" : "▶ Keep Playing"}
          </button>

          {settings.autoplay && (
            <div>
              <label className="mb-1 block font-[family-name:var(--font-pixel)] text-[8px] text-muted">
                Speed {settings.speed * 100}ms
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
              className="w-full rounded-md border border-loss/30 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-loss shadow-[0_2px_0_rgba(232,68,108,0.2)] transition-all hover:border-loss hover:bg-loss/10 active:translate-y-[1px] active:shadow-none"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* settings */}
      <div className="rounded-md border border-border bg-panel p-4">
        <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-highlight">
          Settings
        </h2>
        <div className="space-y-3">
          <ControlField label="Decks">
            <Select
              value={settings.deckCount}
              options={[
                { value: 1, label: "1 Deck" },
                { value: 2, label: "2 Decks" },
                { value: 4, label: "4 Decks" },
                { value: 6, label: "6 Decks" },
                { value: 8, label: "8 Decks" },
              ]}
              onChange={(v) => update("deckCount", Number(v))}
              disabled={sessionActive}
            />
          </ControlField>

          <ControlField label="BJ Payout">
            <Select
              value={settings.blackjackPayout}
              options={[
                { value: "3_to_2", label: "3:2" },
                { value: "6_to_5", label: "6:5" },
                { value: "1_to_1", label: "1:1" },
              ]}
              onChange={(v) => update("blackjackPayout", v as BlackjackPayout)}
              disabled={sessionActive}
            />
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
            <Select
              value={settings.bettingStrategy}
              options={[
                { value: "flat", label: "Flat Bet" },
                { value: "martingale", label: "Martingale" },
                { value: "reverse_martingale", label: "Reverse Martingale" },
              ]}
              onChange={(v) => update("bettingStrategy", v as BettingStrategyType)}
              disabled={sessionActive}
            />
          </ControlField>
        </div>
      </div>

      {/* strategy guide */}
      <button
        onClick={() => setShowStrategy(true)}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-info/30 bg-panel px-4 py-2.5 font-[family-name:var(--font-pixel)] text-[8px] text-info shadow-[0_2px_0_rgba(77,163,255,0.15)] transition-all hover:border-info/60 hover:bg-info/5 active:translate-y-[1px] active:shadow-none"
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
      <label className="mb-1 block font-[family-name:var(--font-pixel)] text-[8px] text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
