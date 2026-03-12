"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonteCarloSessionSample } from "@/types/simulation";

interface DistributionChartProps {
  sessions: MonteCarloSessionSample[];
}

function buildHistogram(values: number[], bucketCount: number) {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const bucketSize = range / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    range: `$${Math.round(min + i * bucketSize)}`,
    count: 0,
  }));

  for (const v of values) {
    let idx = Math.floor((v - min) / bucketSize);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx].count++;
  }

  return buckets;
}

export default function DistributionChart({ sessions }: DistributionChartProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-md border border-border bg-panel p-4">
        <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-text">
          Distribution
        </h2>
        <div className="flex h-52 items-center justify-center text-sm text-muted">
          run a simulation to see the distribution
        </div>
      </div>
    );
  }

  const bankrolls = sessions.map((s) => s.endingBankroll);
  const data = buildHistogram(bankrolls, 15);

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-text">
        Ending Bankroll Distribution
      </h2>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a35" />
            <XAxis
              dataKey="range"
              stroke="#6b7d8d"
              tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#6b7d8d"
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111820",
                border: "1px solid #1e2a35",
                borderRadius: 4,
                fontSize: 12,
                color: "#dce4ec",
                fontFamily: "var(--font-mono)",
              }}
            />
            <Bar dataKey="count" fill="#36d6a8" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
