"use client";

import type { SessionRoundRecord } from "@/types/simulation";

interface HandHistoryTableProps {
  rounds: SessionRoundRecord[];
  fillHeight?: boolean;
}

const resultColors: Record<string, string> = {
  win: "text-accent",
  blackjack: "text-highlight",
  loss: "text-loss",
  push: "text-info",
  surrender: "text-[#9b6dff]",
};

export default function HandHistoryTable({ rounds, fillHeight }: HandHistoryTableProps) {
  const displayRounds = [...rounds].reverse().slice(0, 50);

  return (
    <div className={`flex flex-col rounded-md border border-border bg-panel p-4 ${fillHeight ? "h-full" : ""}`}>
      <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-text">
        History
      </h2>
      {displayRounds.length === 0 ? (
        <p className="font-[family-name:var(--font-pixel)] text-[10px] text-muted">
          No games yet
        </p>
      ) : (
        <div className={`overflow-auto ${fillHeight ? "flex-1" : "max-h-52"}`}>
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-panel">
              <tr className="border-b border-border font-[family-name:var(--font-pixel)] text-[8px] text-muted">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Bet</th>
                <th className="pb-2 pr-3">Result</th>
                <th className="pb-2 pr-3">P/L</th>
                <th className="pb-2">Cash</th>
              </tr>
            </thead>
            <tbody className="font-[family-name:var(--font-mono)] text-sm">
              {displayRounds.map((row) => (
                <tr key={row.roundNumber} className="border-b border-border/30">
                  <td className="py-1.5 pr-3 text-muted">{row.roundNumber}</td>
                  <td className="py-1.5 pr-3">{row.bet}</td>
                  <td className={`py-1.5 pr-3 ${resultColors[row.result] ?? "text-text"}`}>
                    {row.result}{row.doubled ? " (2x)" : ""}
                  </td>
                  <td
                    className={`py-1.5 pr-3 ${
                      row.netWin > 0 ? "text-accent" : row.netWin < 0 ? "text-loss" : "text-muted"
                    }`}
                  >
                    {row.netWin >= 0 ? "+" : ""}
                    {row.netWin}
                  </td>
                  <td className="py-1.5">{row.bankrollAfter.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
