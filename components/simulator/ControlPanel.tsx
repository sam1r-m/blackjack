"use client";

import { useState } from "react";
import StrategyModal from "./StrategyModal";
import Select from "@/components/common/Select";
import Tooltip from "@/components/common/Tooltip";
import NumberInput from "@/components/common/NumberInput";
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
  allowSurrender: boolean;
  allowDouble: boolean;
  manualMode: boolean;
  showBasicStrategy: boolean;
}

export const DEFAULT_SETTINGS: SimulatorSettings = {
  bankroll: 1000,
  baseBet: 10,
  deckCount: 6,
  blackjackPayout: "3_to_2",
  dealerRule: "hit_soft_17",
  bettingStrategy: "martingale",
  autoplay: false,
  speed: 5,
  tableMax: 500,
  penetration: 0.75,
  allowSurrender: true,
  allowDouble: true,
  manualMode: false,
  showBasicStrategy: false,
};

const SPEED_LABELS: Record<number, string> = {
  1: "1x",
  2: "2x",
  3: "3x",
  4: "4x",
  5: "5x",
  6: "6x",
  7: "8x",
  8: "10x",
  9: "15x",
  10: "20x",
};

interface ControlPanelProps {
  settings: SimulatorSettings;
  onSettingsChange: (s: SimulatorSettings) => void;
  onDealHand: () => void;
  onToggleAutoplay: () => void;
  isRunning: boolean;
  sessionActive: boolean;
  onReset: () => void;
  onResetSettings: () => void;
  canDealHand?: boolean;
}

export default function ControlPanel({
  settings,
  onSettingsChange,
  onDealHand,
  onToggleAutoplay,
  isRunning,
  sessionActive,
  onReset,
  onResetSettings,
  canDealHand = true,
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
            disabled={isRunning || !canDealHand}
            className="w-full rounded-md border-2 border-highlight bg-highlight py-2.5 font-[family-name:var(--font-pixel)] text-[10px] tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a] disabled:opacity-50"
          >
            Play One Hand
          </button>
          <button
            onClick={onToggleAutoplay}
            disabled={settings.manualMode}
            className={`w-full rounded-md border-2 py-2.5 font-[family-name:var(--font-pixel)] text-[10px] tracking-wide transition-all active:translate-y-[2px] disabled:opacity-50 ${
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
                Speed {SPEED_LABELS[settings.speed] ?? `${settings.speed}x`}
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

          <div className="flex items-center justify-between gap-2">
            <label className="font-[family-name:var(--font-pixel)] text-[8px] text-muted">
              Manual mode
            </label>
            <button
              onClick={() => {
                const next = !settings.manualMode;
                onSettingsChange({
                  ...settings,
                  manualMode: next,
                  autoplay: next ? false : settings.autoplay,
                });
              }}
              disabled={sessionActive}
              className={`rounded-md border px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[7px] leading-none shadow-[0_2px_0_#1e2a35] transition-all active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-30 ${
                settings.manualMode
                  ? "border-accent/40 text-accent hover:border-accent hover:bg-accent/10"
                  : "border-border text-muted hover:border-muted hover:bg-border/50"
              }`}
            >
              {settings.manualMode ? "ON" : "OFF"}
            </button>
          </div>

          {settings.manualMode && (
            <div className="flex items-center justify-between gap-2">
              <label className="font-[family-name:var(--font-pixel)] text-[8px] text-muted">
                Show basic strategy
              </label>
              <button
                onClick={() => update("showBasicStrategy", !settings.showBasicStrategy)}
                className={`rounded-md border px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[7px] leading-none shadow-[0_2px_0_#1e2a35] transition-all active:translate-y-[2px] active:shadow-none ${
                  settings.showBasicStrategy
                    ? "border-info/40 text-info hover:border-info hover:bg-info/10"
                    : "border-border text-muted hover:border-muted hover:bg-border/50"
                }`}
              >
                {settings.showBasicStrategy ? "ON" : "OFF"}
              </button>
            </div>
          )}

          {sessionActive && (
            <button
              onClick={onReset}
              className="w-full rounded-md border border-loss/30 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-loss shadow-[0_2px_0_rgba(232,68,108,0.2)] transition-all hover:border-loss hover:bg-loss/10 active:translate-y-[1px] active:shadow-none"
            >
              Reset Session
            </button>
          )}
        </div>
      </div>

      {/* settings */}
      <div className="min-h-[350px] rounded-md border border-border bg-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-highlight">
            Settings
          </h2>
          <div className="flex gap-1.5">
            <Tooltip content={settings.allowDouble ? "Doubling allowed" : "Doubling disabled"}>
              <button
                onClick={() => update("allowDouble", !settings.allowDouble)}
                disabled={sessionActive}
                className={`h-full min-h-[26px] rounded-md border px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[7px] leading-none shadow-[0_2px_0_#1e2a35] transition-all active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-30 ${
                  settings.allowDouble
                    ? "border-highlight/40 text-highlight hover:border-highlight hover:bg-highlight/10"
                    : "border-border text-muted hover:border-muted hover:bg-border/50"
                }`}
              >
                2x
              </button>
            </Tooltip>
            <Tooltip content={settings.allowSurrender ? "Surrender allowed" : "Surrender disabled"}>
              <button
                onClick={() => update("allowSurrender", !settings.allowSurrender)}
                disabled={sessionActive}
                className={`h-full min-h-[26px] rounded-md border px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[7px] leading-none shadow-[0_2px_0_#1e2a35] transition-all active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-30 ${
                  settings.allowSurrender
                    ? "border-[#9b6dff]/40 text-[#9b6dff] hover:border-[#9b6dff] hover:bg-[#9b6dff]/10"
                    : "border-border text-muted hover:border-muted hover:bg-border/50"
                }`}
              >
                SUR
              </button>
            </Tooltip>
            <Tooltip content="Reset">
              <button
                onClick={onResetSettings}
                disabled={sessionActive}
                className="rounded-md border border-border px-1.5 py-0.5 text-lg leading-none text-muted shadow-[0_2px_0_#1e2a35] transition-all hover:border-muted hover:bg-border/50 hover:text-text active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-30"
              >
                <span className="-translate-y-[2px] translate-x-[0.5px] inline-block">⟳</span>
              </button>
            </Tooltip>
          </div>
        </div>
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
            <NumberInput
              value={settings.bankroll}
              onChange={(v) => update("bankroll", v)}
              min={0}
              step={100}
              disabled={sessionActive}
            />
          </ControlField>

          <ControlField label="Initial Bet">
            <NumberInput
              value={settings.baseBet}
              onChange={(v) => update("baseBet", v)}
              min={1}
              step={5}
              disabled={sessionActive}
            />
          </ControlField>

          <ControlField label="Table Max">
            <NumberInput
              value={settings.tableMax}
              onChange={(v) => update("tableMax", v)}
              min={1}
              step={50}
              disabled={sessionActive}
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
