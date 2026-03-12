"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { SessionRoundRecord } from "@/types/simulation";

interface BankrollGraphProps {
  rounds: SessionRoundRecord[];
  initialBankroll: number;
}

interface DataPoint {
  hand: number;
  bankroll: number;
  gain?: number;
  drop?: number;
}

export default function BankrollGraph({ rounds, initialBankroll }: BankrollGraphProps) {
  // build step data with separate fields for gain/drop coloring
  const raw = [
    { hand: 0, bankroll: initialBankroll },
    ...rounds.map((r) => ({
      hand: r.roundNumber,
      bankroll: r.bankrollAfter,
    })),
  ];

  // split into two series so gains are green and drops are red
  const data: DataPoint[] = raw.map((pt, i) => {
    if (i === 0) return { hand: pt.hand, bankroll: pt.bankroll, gain: pt.bankroll, drop: pt.bankroll };
    const prev = raw[i - 1];
    const went_up = pt.bankroll >= prev.bankroll;
    return {
      hand: pt.hand,
      bankroll: pt.bankroll,
      gain: went_up ? pt.bankroll : undefined,
      drop: went_up ? undefined : pt.bankroll,
    };
  });

  const currentBankroll = raw.length > 1 ? raw[raw.length - 1].bankroll : initialBankroll;

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-pixel)] text-xs text-text">
          Bankroll Chart
        </h2>
        {raw.length > 1 && (
          <span className="font-[family-name:var(--font-mono)] text-sm text-accent">
            ${currentBankroll.toFixed(0)}
          </span>
        )}
      </div>
      <div className="h-52">
        {raw.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a35" />
              <XAxis
                dataKey="hand"
                stroke="#6b7d8d"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              />
              <YAxis
                stroke="#6b7d8d"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                domain={["dataMin - 50", "dataMax + 50"]}
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
                formatter={(value) => [`$${Number(value).toFixed(0)}`, "Bankroll"]}
                labelFormatter={(label) => `Hand #${label}`}
              />
              <ReferenceLine
                y={initialBankroll}
                stroke="#f0c24a"
                strokeDasharray="5 5"
                strokeOpacity={0.35}
              />
              <Line
                type="stepAfter"
                dataKey="bankroll"
                stroke="#36d6a8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#36d6a8", stroke: "#0a0e13", strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-[family-name:var(--font-pixel)] text-[10px] text-muted/40">
            play some hands to see the chart
          </div>
        )}
      </div>
    </div>
  );
}
