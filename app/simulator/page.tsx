"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import ControlPanel, {
  type SimulatorSettings,
} from "@/components/simulator/ControlPanel";
import BankrollGraph from "@/components/simulator/BankrollGraph";
import HandHistoryTable from "@/components/simulator/HandHistoryTable";
import GameDisplay from "@/components/simulator/GameDisplay";
import MonteCarloControls, {
  type MonteCarloSettings,
} from "@/components/montecarlo/MonteCarloControls";
import MonteCarloSummary from "@/components/montecarlo/MonteCarloSummary";
import DistributionChart from "@/components/montecarlo/DistributionChart";
import HistoryTable from "@/components/history/HistoryTable";

import { Shoe } from "@/lib/engine/shoe";
import { runRound } from "@/lib/engine/round";
import { basicStrategy } from "@/lib/strategies/basicStrategy";
import { flatBetStrategy } from "@/lib/betting/flatBet";
import { martingaleStrategy } from "@/lib/betting/martingale";
import { runMonteCarlo } from "@/lib/simulation/monteCarloRunner";

import type { RoundOutcome } from "@/types/blackjack";
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

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition-all hover:border-accent hover:text-accent"
          >
            ◄ Home
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-base font-bold text-text md:text-lg">
            Blackjack Martingale
          </h1>
        </div>
      </div>

      {/* tabs */}
      <div className="mb-5 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-md px-5 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "border-t-2 border-accent bg-panel text-accent"
                : "text-muted hover:bg-panel/50 hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "live" && <LiveSessionTab />}
      {activeTab === "montecarlo" && <MonteCarloTab />}
      {activeTab === "history" && <HistoryTab />}
    </div>
  );
}

function LiveSessionTab() {
  const [settings, setSettings] = useState<SimulatorSettings>({
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
  });

  const [rounds, setRounds] = useState<SessionRoundRecord[]>([]);
  const [currentBankroll, setCurrentBankroll] = useState(settings.bankroll);
  const [sessionActive, setSessionActive] = useState(false);
  const [isRunning] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<RoundOutcome | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const shoeRef = useRef<Shoe | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        setSettings((s) => ({ ...s, autoplay: false }));
      }
      return;
    }

    // brief flash for card deal animation feel
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    const outcome = runRound(
      {
        rules: {
          dealerRule: settings.dealerRule,
          blackjackPayout: settings.blackjackPayout,
        },
      },
      {
        shoe: shoeRef.current,
        bet: betResult.bet,
        playerPolicy: basicStrategy,
        deckCount: settings.deckCount,
      }
    );

    setLastOutcome(outcome);

    const newBankroll = currentBankroll + outcome.netWin;
    const roundNumber = rounds.length + 1;

    const record: SessionRoundRecord = {
      roundNumber,
      bet: betResult.bet,
      result: outcome.result,
      bankrollBefore: currentBankroll,
      bankrollAfter: newBankroll,
      netWin: outcome.netWin,
    };

    setRounds((prev) => [...prev, record]);
    setCurrentBankroll(newBankroll);

    if (newBankroll <= 0) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
        setSettings((s) => ({ ...s, autoplay: false }));
      }
    }
  }, [rounds, currentBankroll, settings]);

  useEffect(() => {
    if (settings.autoplay && !autoplayRef.current) {
      const interval = Math.max(50, 1100 - settings.speed * 100);
      autoplayRef.current = setInterval(() => {
        dealOneHand();
      }, interval);
    }

    if (!settings.autoplay && autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [settings.autoplay, settings.speed, dealOneHand]);

  const handleReset = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    shoeRef.current = null;
    setRounds([]);
    setCurrentBankroll(settings.bankroll);
    setSessionActive(false);
    setLastOutcome(null);
    setSettings((s) => ({ ...s, autoplay: false }));
  };

  const handleToggleAutoplay = () => {
    setSettings((s) => ({ ...s, autoplay: !s.autoplay }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-4">
        <ControlPanel
          settings={settings}
          onSettingsChange={setSettings}
          onDealHand={dealOneHand}
          onToggleAutoplay={handleToggleAutoplay}
          isRunning={isRunning}
          sessionActive={sessionActive}
          onReset={handleReset}
        />

        {/* stats */}
        <div className="rounded-md border border-border bg-panel p-4">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-bold text-highlight">
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
      </div>

      <div className="space-y-4">
        {/* game display - shows the actual hand being played */}
        <GameDisplay
          lastOutcome={lastOutcome}
          currentBankroll={currentBankroll}
          isAnimating={isAnimating}
        />
        <BankrollGraph rounds={rounds} initialBankroll={settings.bankroll} />
        <HandHistoryTable rounds={rounds} />
      </div>
    </div>
  );
}

function MonteCarloTab() {
  const [settings, setSettings] = useState<MonteCarloSettings>({
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
  });

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <MonteCarloControls
          settings={settings}
          onSettingsChange={setSettings}
          onRun={handleRun}
          isRunning={isRunning}
        />
      </div>
      <div className="space-y-4">
        <MonteCarloSummary aggregate={aggregate} />
        <DistributionChart sessions={sessions} />
      </div>
    </div>
  );
}

function HistoryTab() {
  return <HistoryTable />;
}
