"use client";

import Select from "@/components/common/Select";
import NumberInput from "@/components/common/NumberInput";
import type { DealerRule, BlackjackPayout } from "@/types/blackjack";
import type { BettingStrategyType } from "@/types/simulation";

export interface MonteCarloSettings {
  sessionCount: number;
  handsPerSession: number;
  initialBankroll: number;
  baseBet: number;
  tableMax: number;
  bettingStrategy: BettingStrategyType;
  deckCount: number;
  blackjackPayout: BlackjackPayout;
  dealerRule: DealerRule;
  penetration: number;
}

export const DEFAULT_MC_SETTINGS: MonteCarloSettings = {
  sessionCount: 1000,
  handsPerSession: 100,
  initialBankroll: 1000,
  baseBet: 10,
  tableMax: 500,
  bettingStrategy: "martingale",
  deckCount: 6,
  blackjackPayout: "3_to_2",
  dealerRule: "hit_soft_17",
  penetration: 0.75,
};

interface MonteCarloControlsProps {
  settings: MonteCarloSettings;
  onSettingsChange: (s: MonteCarloSettings) => void;
  onRun: () => void;
  isRunning: boolean;
  onResetSettings: () => void;
}

export default function MonteCarloControls({
  settings,
  onSettingsChange,
  onRun,
  isRunning,
  onResetSettings,
}: MonteCarloControlsProps) {
  const update = <K extends keyof MonteCarloSettings>(
    key: K,
    value: MonteCarloSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-pixel)] text-xs text-highlight">
          Monte Carlo Config
        </h2>
        <button
          onClick={onResetSettings}
          title="Reset to defaults"
            className="rounded-md border border-border px-1.5 py-0.5 text-lg leading-none text-muted shadow-[0_2px_0_#1e2a35] transition-all hover:bg-border hover:text-text active:translate-y-[2px] active:shadow-none"
        >
          <span className="-translate-y-[2px] translate-x-px inline-block">⟳</span>
        </button>
      </div>

      <div className="space-y-3">
        <ControlField label="Sessions">
          <NumberInput
            value={settings.sessionCount}
            onChange={(v) => update("sessionCount", v)}
            min={10}
            max={50000}
            step={100}
          />
        </ControlField>

        <ControlField label="Hands / Session">
          <NumberInput
            value={settings.handsPerSession}
            onChange={(v) => update("handsPerSession", v)}
            min={1}
            step={10}
          />
        </ControlField>

        <ControlField label="Bankroll">
          <NumberInput
            value={settings.initialBankroll}
            onChange={(v) => update("initialBankroll", v)}
            min={0}
            step={100}
          />
        </ControlField>

        <ControlField label="Base Bet">
          <NumberInput
            value={settings.baseBet}
            onChange={(v) => update("baseBet", v)}
            min={1}
            step={5}
          />
        </ControlField>

        <ControlField label="Table Max">
          <NumberInput
            value={settings.tableMax}
            onChange={(v) => update("tableMax", v)}
            min={1}
            step={50}
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
          />
        </ControlField>

        <ControlField label="Decks">
          <Select
            value={settings.deckCount}
            options={[
              { value: 1, label: "1 Deck" },
              { value: 2, label: "2 Decks" },
              { value: 6, label: "6 Decks" },
              { value: 8, label: "8 Decks" },
            ]}
            onChange={(v) => update("deckCount", Number(v))}
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
          />
        </ControlField>

        <ControlField label={`Penetration: ${Math.round(settings.penetration * 100)}%`}>
          <input
            type="range"
            min={0.5}
            max={0.9}
            step={0.05}
            value={settings.penetration}
            onChange={(e) => update("penetration", Number(e.target.value))}
            className="w-full"
          />
        </ControlField>

        <button
          onClick={onRun}
          disabled={isRunning}
          className="w-full rounded-md border-2 border-highlight bg-highlight py-2.5 font-[family-name:var(--font-pixel)] text-[10px] tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a] disabled:opacity-50"
        >
          {isRunning ? "Running..." : "[ RUN SIMULATION ]"}
        </button>
      </div>
    </div>
  );
}

function ControlField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block font-[family-name:var(--font-pixel)] text-[8px] text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
