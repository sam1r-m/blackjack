"use client";

import {
  ResponsiveContainer,
  ComposedChart,
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
  win: boolean;
}

export default function BankrollGraph({ rounds, initialBankroll }: BankrollGraphProps) {
  const data: DataPoint[] = [
    { hand: 0, bankroll: initialBankroll, win: true },
    ...rounds.map((r) => ({
      hand: r.roundNumber,
      bankroll: r.bankrollAfter,
      win: r.netWin >= 0,
    })),
  ];

  const currentBankroll = data.length > 1 ? data[data.length - 1].bankroll : initialBankroll;

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-text">
          Bankroll Chart
        </h2>
        {data.length > 1 && (
          <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-accent">
            —{currentBankroll.toFixed(0)}
          </span>
        )}
      </div>
      <div className="h-52">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a35" />
              <XAxis
                dataKey="hand"
                stroke="#6b7d8d"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
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
              <ReferenceLine
                y={initialBankroll}
                stroke="#f0c24a"
                strokeDasharray="5 5"
                strokeOpacity={0.35}
              />
              {/* render step segments with win/loss coloring */}
              {data.length > 1 &&
                data.slice(1).map((point, i) => {
                  const prev = data[i];
                  const color = point.bankroll >= prev.bankroll ? "#36d6a8" : "#e8446c";
                  return (
                    <ReferenceLine
                      key={`seg-h-${i}`}
                      segment={[
                        { x: prev.hand, y: prev.bankroll },
                        { x: point.hand, y: prev.bankroll },
                      ]}
                      stroke={color}
                      strokeWidth={2}
                      ifOverflow="visible"
                    />
                  );
                })}
              {data.length > 1 &&
                data.slice(1).map((point, i) => {
                  const prev = data[i];
                  const color = point.bankroll >= prev.bankroll ? "#36d6a8" : "#e8446c";
                  return (
                    <ReferenceLine
                      key={`seg-v-${i}`}
                      segment={[
                        { x: point.hand, y: prev.bankroll },
                        { x: point.hand, y: point.bankroll },
                      ]}
                      stroke={color}
                      strokeWidth={2}
                      ifOverflow="visible"
                    />
                  );
                })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-[family-name:var(--font-display)] text-sm text-muted/40">
            play some hands to see the chart
          </div>
        )}
      </div>
    </div>
  );
}
