"use client";

const mockRuns = [
  {
    id: "1",
    mode: "monte_carlo",
    strategy: "Martingale",
    deckCount: 6,
    baseBet: 10,
    bankroll: 1000,
    ruinProb: "23.4%",
    expectedBankroll: "$987",
    createdAt: "2026-03-10 14:30",
  },
  {
    id: "2",
    mode: "live_session",
    strategy: "Flat Bet",
    deckCount: 6,
    baseBet: 25,
    bankroll: 500,
    ruinProb: "—",
    expectedBankroll: "$475",
    createdAt: "2026-03-09 19:15",
  },
  {
    id: "3",
    mode: "monte_carlo",
    strategy: "Martingale",
    deckCount: 8,
    baseBet: 5,
    bankroll: 2000,
    ruinProb: "8.1%",
    expectedBankroll: "$1,923",
    createdAt: "2026-03-08 11:00",
  },
];

export default function HistoryTable() {
  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-text">
        Past Runs
      </h2>
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-[family-name:var(--font-pixel)] text-[8px] text-muted">
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4">Mode</th>
              <th className="pb-2 pr-4">Strategy</th>
              <th className="pb-2 pr-4">Decks</th>
              <th className="pb-2 pr-4">Bet</th>
              <th className="pb-2 pr-4">Bankroll</th>
              <th className="pb-2 pr-4">Ruin %</th>
              <th className="pb-2">E[BR]</th>
            </tr>
          </thead>
          <tbody className="font-[family-name:var(--font-mono)] text-sm">
            {mockRuns.map((run) => (
              <tr
                key={run.id}
                className="cursor-pointer border-b border-border/30 transition-colors hover:bg-panel-elevated"
              >
                <td className="py-2.5 pr-4 text-muted">{run.createdAt}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className={
                      run.mode === "monte_carlo" ? "text-info" : "text-accent"
                    }
                  >
                    {run.mode === "monte_carlo" ? "MC" : "Live"}
                  </span>
                </td>
                <td className="py-2.5 pr-4">{run.strategy}</td>
                <td className="py-2.5 pr-4">{run.deckCount}</td>
                <td className="py-2.5 pr-4">${run.baseBet}</td>
                <td className="py-2.5 pr-4">${run.bankroll}</td>
                <td className="py-2.5 pr-4 text-loss">{run.ruinProb}</td>
                <td className="py-2.5">{run.expectedBankroll}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
