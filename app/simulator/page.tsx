"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import ControlPanel, {
  type SimulatorSettings,
  DEFAULT_SETTINGS,
} from "@/components/simulator/ControlPanel";
import BankrollGraph from "@/components/simulator/BankrollGraph";
import HandHistoryTable from "@/components/simulator/HandHistoryTable";
import GameDisplay from "@/components/simulator/GameDisplay";
import MonteCarloControls, {
  type MonteCarloSettings,
  DEFAULT_MC_SETTINGS,
} from "@/components/montecarlo/MonteCarloControls";
import MonteCarloSummary from "@/components/montecarlo/MonteCarloSummary";
import DistributionChart from "@/components/montecarlo/DistributionChart";
import HistoryTable from "@/components/history/HistoryTable";

import { Shoe } from "@/lib/engine/shoe";
import { runRound } from "@/lib/engine/round";
import {
  startManualRound,
  applyManualAction,
  getRecommendedAction,
  type ManualRoundPending,
  type ManualRoundPendingDisplay,
} from "@/lib/engine/manualRound";
import { basicStrategy } from "@/lib/strategies/basicStrategy";
import { flatBetStrategy } from "@/lib/betting/flatBet";
import { martingaleStrategy } from "@/lib/betting/martingale";
import { runMonteCarlo } from "@/lib/simulation/monteCarloRunner";

import type { RoundOutcome, PlayerAction } from "@/types/blackjack";
import type {
  SessionRoundRecord,
  MonteCarloAggregate,
  MonteCarloSessionSample,
  BettingStrategy,
} from "@/types/simulation";

type Tab = "live" | "montecarlo" | "history";

const tabs: { id: Tab; label: string }[] = [
  { id: "live", label: "Live Session" },
  { id: "montecarlo", label: "Monte Carlo" },
  { id: "history", label: "History" },
];

function getBettingStrategy(type: string): BettingStrategy {
  switch (type) {
    case "martingale":
      return martingaleStrategy;
    case "flat":
    default:
      return flatBetStrategy;
  }
}

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [wideLayout, setWideLayout] = useState(false);

  // lifted state so settings persist across tab switches
  const [liveSettings, setLiveSettings] = useState<SimulatorSettings>(DEFAULT_SETTINGS);
  const [mcSettings, setMcSettings] = useState<MonteCarloSettings>(DEFAULT_MC_SETTINGS);

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-[family-name:var(--font-pixel)] text-[10px] leading-none text-muted transition-all hover:border-accent hover:text-accent"
          >
            <span className="translate-y-px">◄</span>
            <span>Home</span>
          </Link>
          <h1 className="font-[family-name:var(--font-pixel)] text-sm text-text md:text-base">
            Blackjack Simulator
          </h1>
        </div>
        {activeTab === "live" && (
          <button
            onClick={() => setWideLayout(!wideLayout)}
            title={wideLayout ? "Stacked layout" : "Wide layout"}
            className="hidden rounded-md border border-border px-2 py-1.5 text-muted shadow-[0_2px_0_#1e2a35] transition-all hover:border-muted hover:bg-border/50 hover:text-text active:translate-y-[2px] active:shadow-none lg:flex lg:items-center lg:gap-1.5"
          >
            {wideLayout ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="14" height="6" rx="1" />
                <rect x="1" y="9" width="14" height="6" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="6" height="14" rx="1" />
                <rect x="9" y="1" width="6" height="14" rx="1" />
              </svg>
            )}
            <span className="font-[family-name:var(--font-pixel)] text-[7px]">
              {wideLayout ? "Stack" : "Wide"}
            </span>
          </button>
        )}
      </div>

      {/* tabs */}
      <div className="mb-5 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-md px-5 py-2 font-[family-name:var(--font-pixel)] text-[10px] transition-all ${
              activeTab === tab.id
                ? "border-t-2 border-accent bg-panel text-accent"
                : "text-muted hover:bg-panel/50 hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "live" && (
        <LiveSessionTab
          settings={liveSettings}
          onSettingsChange={setLiveSettings}
          wideLayout={wideLayout}
        />
      )}
      {activeTab === "montecarlo" && (
        <MonteCarloTab
          settings={mcSettings}
          onSettingsChange={setMcSettings}
        />
      )}
      {activeTab === "history" && <HistoryTab />}
    </div>
  );
}

interface LiveSessionTabProps {
  settings: SimulatorSettings;
  onSettingsChange: (s: SimulatorSettings) => void;
  wideLayout: boolean;
}

function LiveSessionTab({ settings, onSettingsChange, wideLayout }: LiveSessionTabProps) {
  const [rounds, setRounds] = useState<SessionRoundRecord[]>([]);
  const [currentBankroll, setCurrentBankroll] = useState(settings.bankroll);
  const [sessionActive, setSessionActive] = useState(false);
  const [isRunning] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<RoundOutcome | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [manualPendingDisplay, setManualPendingDisplay] =
    useState<ManualRoundPendingDisplay | null>(null);

  const shoeRef = useRef<Shoe | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manualPendingRef = useRef<ManualRoundPending | null>(null);

  const processOutcome = useCallback(
    (outcome: RoundOutcome, bet: number) => {
      const newBankroll = currentBankroll + outcome.netWin;
      const roundNumber = rounds.length + 1;
      const record: SessionRoundRecord = {
        roundNumber,
        bet,
        result: outcome.result,
        bankrollBefore: currentBankroll,
        bankrollAfter: newBankroll,
        netWin: outcome.netWin,
        doubled: outcome.doubled,
      };
      setLastOutcome(outcome);
      setRounds((prev) => [...prev, record]);
      setCurrentBankroll(newBankroll);
      if (newBankroll <= 0 && autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
        onSettingsChange({ ...settings, autoplay: false });
      }
    },
    [rounds.length, currentBankroll, settings, onSettingsChange]
  );

  const dealOneHand = useCallback(() => {
    if (!shoeRef.current) {
      shoeRef.current = new Shoe({
        deckCount: settings.deckCount,
        penetration: settings.penetration,
      });
      setSessionActive(true);
    }

    const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : undefined;
    const strategy = getBettingStrategy(settings.bettingStrategy);

    const betResult = strategy.nextBet({
      previousOutcome: lastRound?.result,
      previousBet: lastRound?.bet,
      bankroll: currentBankroll,
      baseBet: settings.baseBet,
      tableMax: settings.tableMax,
    });

    if (betResult.shouldStop || betResult.bet === 0) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
        onSettingsChange({ ...settings, autoplay: false });
      }
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    const config = {
      rules: {
        dealerRule: settings.dealerRule,
        blackjackPayout: settings.blackjackPayout,
        allowSurrender: settings.allowSurrender,
        allowDouble: settings.allowDouble,
      },
    };

    if (settings.manualMode) {
      const result = startManualRound(
        config,
        shoeRef.current,
        betResult.bet,
        settings.deckCount
      );
      if (result.status === "outcome") {
        processOutcome(result.outcome, betResult.bet);
      } else {
        manualPendingRef.current = result.pending;
        setManualPendingDisplay({
          playerCards: result.pending.playerCards,
          dealerCards: result.pending.dealerCards,
          currentBet: result.pending.currentBet,
          isFirstAction: result.pending.isFirstAction,
          config: result.pending.config,
          deckCount: result.pending.deckCount,
        });
        setLastOutcome(null);
      }
      return;
    }

    const outcome = runRound(config, {
      shoe: shoeRef.current,
      bet: betResult.bet,
      playerPolicy: basicStrategy,
      deckCount: settings.deckCount,
    });
    processOutcome(outcome, betResult.bet);
  }, [rounds, currentBankroll, settings, onSettingsChange, processOutcome]);

  const applyManualPlayerAction = useCallback(
    (action: PlayerAction) => {
      const pending = manualPendingRef.current;
      if (!pending) return;

      const result = applyManualAction(pending, action);

      if (result.status === "outcome") {
        manualPendingRef.current = null;
        setManualPendingDisplay(null);
        processOutcome(result.outcome, result.outcome.bet);
      } else {
        manualPendingRef.current = result.pending;
        setManualPendingDisplay({
          playerCards: result.pending.playerCards,
          dealerCards: result.pending.dealerCards,
          currentBet: result.pending.currentBet,
          isFirstAction: result.pending.isFirstAction,
          config: result.pending.config,
          deckCount: result.pending.deckCount,
        });
      }
    },
    [processOutcome]
  );

  useEffect(() => {
    if (settings.autoplay && !settings.manualMode && !autoplayRef.current) {
      const interval = Math.max(50, 1100 - settings.speed * 100);
      autoplayRef.current = setInterval(() => {
        dealOneHand();
      }, interval);
    }

    if ((!settings.autoplay || settings.manualMode) && autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [settings.autoplay, settings.manualMode, settings.speed, dealOneHand]);

  const handleReset = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    shoeRef.current = null;
    manualPendingRef.current = null;
    setManualPendingDisplay(null);
    setRounds([]);
    setCurrentBankroll(settings.bankroll);
    setSessionActive(false);
    setLastOutcome(null);
    onSettingsChange({ ...settings, autoplay: false });
  };

  const handleToggleAutoplay = () => {
    onSettingsChange({ ...settings, autoplay: !settings.autoplay });
  };

  const handleResetSettings = () => {
    onSettingsChange({ ...DEFAULT_SETTINGS });
  };

  const statsTile = (
    <div className="rounded-md border border-border bg-panel p-4">
      <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-highlight">
        Stats
      </h2>
      <div className="space-y-1.5 font-[family-name:var(--font-mono)] text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Current Bet:</span>
          <span className="text-highlight">
            ${rounds.length > 0 ? rounds[rounds.length - 1].bet.toFixed(2) : settings.baseBet.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Games:</span>
          <span>{rounds.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Wins:</span>
          <span className="text-accent">
            {rounds.filter((r) => r.result === "win" || r.result === "blackjack").length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Losses:</span>
          <span className="text-loss">
            {rounds.filter((r) => r.result === "loss" || r.result === "surrender").length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Pushes:</span>
          <span>{rounds.filter((r) => r.result === "push").length}</span>
        </div>
        <div className="mt-2 border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="text-muted">Profit:</span>
            <span className={currentBankroll - settings.bankroll >= 0 ? "text-accent" : "text-loss"}>
              {(currentBankroll - settings.bankroll).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">House Edge:</span>
            <span className="text-loss">0.50%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${wideLayout ? "lg:grid-cols-[260px_minmax(0,1.2fr)_minmax(0,0.65fr)] lg:min-h-[520px]" : "lg:grid-cols-[260px_1fr]"}`}
    >
      <div className={`flex flex-col gap-4 ${wideLayout ? "lg:justify-start" : ""}`}>
        <ControlPanel
          settings={settings}
          onSettingsChange={onSettingsChange}
          onDealHand={dealOneHand}
          onToggleAutoplay={handleToggleAutoplay}
          isRunning={isRunning}
          sessionActive={sessionActive}
          onReset={handleReset}
          canDealHand={!manualPendingDisplay}
          onResetSettings={handleResetSettings}
        />
        {!wideLayout && statsTile}
      </div>

      <div
        className={`flex flex-col gap-4 ${wideLayout ? "min-w-0 overflow-hidden lg:min-h-0 lg:flex-1" : ""}`}
      >
        <div className={wideLayout ? "shrink-0" : ""}>
          <GameDisplay
            lastOutcome={lastOutcome}
            currentBankroll={currentBankroll}
            isAnimating={isAnimating}
            handNumber={rounds.length}
            manualPending={manualPendingDisplay}
            onManualAction={applyManualPlayerAction}
            recommendedAction={
              manualPendingDisplay &&
              settings.showBasicStrategy &&
              manualPendingRef.current
                ? getRecommendedAction(manualPendingRef.current)
                : null
            }
            showBasicStrategy={settings.showBasicStrategy}
          />
        </div>
        <div className={wideLayout ? "flex min-h-0 flex-1 flex-col" : ""}>
          <BankrollGraph
            rounds={rounds}
            initialBankroll={settings.bankroll}
            fillHeight={wideLayout}
          />
        </div>
        {!wideLayout && <HandHistoryTable rounds={rounds} />}
      </div>

      {wideLayout && (
        <div className="flex flex-col gap-4">
          <HandHistoryTable rounds={rounds} />
          {statsTile}
        </div>
      )}
    </div>
  );
}

interface MonteCarloTabProps {
  settings: MonteCarloSettings;
  onSettingsChange: (s: MonteCarloSettings) => void;
}

function MonteCarloTab({ settings, onSettingsChange }: MonteCarloTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [aggregate, setAggregate] = useState<MonteCarloAggregate | null>(null);
  const [sessions, setSessions] = useState<MonteCarloSessionSample[]>([]);

  const handleRun = useCallback(() => {
    setIsRunning(true);

    setTimeout(() => {
      const result = runMonteCarlo({
        config: {
          simulationConfig: {
            deckCount: settings.deckCount,
            blackjackPayout: settings.blackjackPayout,
            dealerRule: settings.dealerRule,
            bettingStrategy: settings.bettingStrategy,
            baseBet: settings.baseBet,
            initialBankroll: settings.initialBankroll,
            tableMax: settings.tableMax,
            penetration: settings.penetration,
            maxHands: settings.handsPerSession,
          },
          sessionCount: settings.sessionCount,
        },
        playerPolicy: basicStrategy,
        bettingStrategy: getBettingStrategy(settings.bettingStrategy),
      });

      setAggregate(result.aggregate);
      setSessions(result.sessions);
      setIsRunning(false);
    }, 50);
  }, [settings]);

  const handleResetSettings = () => {
    onSettingsChange({ ...DEFAULT_MC_SETTINGS });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <MonteCarloControls
          settings={settings}
          onSettingsChange={onSettingsChange}
          onRun={handleRun}
          isRunning={isRunning}
          onResetSettings={handleResetSettings}
        />
      </div>
      <div className="space-y-4">
        <MonteCarloSummary aggregate={aggregate} />
        <DistributionChart sessions={sessions} initialBankroll={settings.initialBankroll} />
      </div>
    </div>
  );
}

function HistoryTab() {
  return <HistoryTable />;
}
