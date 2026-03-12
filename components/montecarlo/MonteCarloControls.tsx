"use client";

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

interface MonteCarloControlsProps {
  settings: MonteCarloSettings;
  onSettingsChange: (s: MonteCarloSettings) => void;
  onRun: () => void;
  isRunning: boolean;
}

export default function MonteCarloControls({
  settings,
  onSettingsChange,
  onRun,
  isRunning,
}: MonteCarloControlsProps) {
  const update = <K extends keyof MonteCarloSettings>(
    key: K,
    value: MonteCarloSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-bold text-highlight">
        Monte Carlo Config
      </h2>

      <div className="space-y-3">
        <ControlField label="Sessions">
          <input
            type="number"
            value={settings.sessionCount}
            min={10}
            max={50000}
            onChange={(e) => update("sessionCount", Number(e.target.value))}
            className="w-full"
          />
        </ControlField>

        <ControlField label="Hands / Session">
          <input
            type="number"
            value={settings.handsPerSession}
            onChange={(e) => update("handsPerSession", Number(e.target.value))}
            className="w-full"
          />
        </ControlField>

        <ControlField label="Bankroll">
          <input
            type="number"
            value={settings.initialBankroll}
            onChange={(e) => update("initialBankroll", Number(e.target.value))}
            className="w-full"
          />
        </ControlField>

        <ControlField label="Base Bet">
          <input
            type="number"
            value={settings.baseBet}
            onChange={(e) => update("baseBet", Number(e.target.value))}
            className="w-full"
          />
        </ControlField>

        <ControlField label="Table Max">
          <input
            type="number"
            value={settings.tableMax}
            onChange={(e) => update("tableMax", Number(e.target.value))}
            className="w-full"
          />
        </ControlField>

        <ControlField label="Strategy">
          <select
            value={settings.bettingStrategy}
            onChange={(e) =>
              update("bettingStrategy", e.target.value as BettingStrategyType)
            }
            className="w-full"
          >
            <option value="flat">Flat Bet</option>
            <option value="martingale">Martingale</option>
            <option value="reverse_martingale">Reverse Martingale</option>
          </select>
        </ControlField>

        <ControlField label="Decks">
          <select
            value={settings.deckCount}
            onChange={(e) => update("deckCount", Number(e.target.value))}
            className="w-full"
          >
            <option value={1}>1 Deck</option>
            <option value={2}>2 Decks</option>
            <option value={6}>6 Decks</option>
            <option value={8}>8 Decks</option>
          </select>
        </ControlField>

        <ControlField label="BJ Payout">
          <select
            value={settings.blackjackPayout}
            onChange={(e) =>
              update("blackjackPayout", e.target.value as BlackjackPayout)
            }
            className="w-full"
          >
            <option value="3_to_2">3:2</option>
            <option value="6_to_5">6:5</option>
            <option value="1_to_1">1:1</option>
          </select>
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
          className="w-full rounded-md border-2 border-highlight bg-highlight py-2.5 font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-bg shadow-[0_3px_0_#c9981a] transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#c9981a] disabled:opacity-50"
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
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}
