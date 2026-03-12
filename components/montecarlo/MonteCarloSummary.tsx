"use client";

import StatCard from "@/components/common/StatCard";
import type { MonteCarloAggregate } from "@/types/simulation";

interface MonteCarloSummaryProps {
  aggregate: MonteCarloAggregate | null;
}

function fmt(n: number): string {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

export default function MonteCarloSummary({ aggregate }: MonteCarloSummaryProps) {
  if (!aggregate) {
    return (
      <div className="rounded-md border border-border bg-panel p-4">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-bold text-text">
          Results
        </h2>
        <p className="text-sm text-muted">run a simulation to see results</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-bold text-text">
        Results
      </h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="E[Bankroll]" value={fmt(aggregate.expectedEndingBankroll)} color="text" />
        <StatCard label="Median" value={fmt(aggregate.medianEndingBankroll)} color="text" />
        <StatCard label="Ruin %" value={pct(aggregate.ruinProbability)} color="loss" />
        <StatCard label="Profit %" value={pct(aggregate.probabilityOfProfit)} color="accent" />
        <StatCard label="P5" value={fmt(aggregate.percentile5)} color="loss" />
        <StatCard label="P25" value={fmt(aggregate.percentile25)} color="text" />
        <StatCard label="P75" value={fmt(aggregate.percentile75)} color="text" />
        <StatCard label="P95" value={fmt(aggregate.percentile95)} color="highlight" />
        <StatCard label="Std Dev" value={fmt(aggregate.standardDeviation)} color="info" />
        <StatCard label="Win %" value={pct(aggregate.winFrequency)} color="accent" />
        <StatCard label="Loss %" value={pct(aggregate.lossFrequency)} color="loss" />
        <StatCard label="BJ %" value={pct(aggregate.blackjackFrequency)} color="highlight" />
      </div>
    </div>
  );
}
