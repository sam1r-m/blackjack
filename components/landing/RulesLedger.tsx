import { calculateHouseEdge, type HouseEdgeRules } from "@/lib/simulation/houseEdge";

const BASE: HouseEdgeRules = {
  deckCount: 6,
  dealerRule: "hit_soft_17",
  blackjackPayout: "3_to_2",
  allowSurrender: true,
  allowDouble: true,
  allowSplit: true,
};

const VARIANTS: { label: string; rules: HouseEdgeRules }[] = [
  { label: "6 decks · 3:2 · H17", rules: BASE },
  { label: "Blackjack pays 6:5", rules: { ...BASE, blackjackPayout: "6_to_5" } },
  { label: "Dealer stands soft 17", rules: { ...BASE, dealerRule: "stand_soft_17" } },
  { label: "Double deck · 3:2", rules: { ...BASE, deckCount: 2 } },
  { label: "No doubling", rules: { ...BASE, allowDouble: false } },
];

// the meter reads like an arcade bar: discrete cells, no smooth fill
const CELLS = 24;

export default function RulesLedger() {
  const edges = VARIANTS.map((v) => ({ ...v, edge: calculateHouseEdge(v.rules) }));
  const worst = Math.max(...edges.map((e) => e.edge));

  return (
    <div className="rounded-md border-2 border-border bg-panel p-4 shadow-[0_4px_0_#0a0e13] sm:p-6">
      <ul className="flex flex-col gap-5">
        {edges.map((entry) => {
          const filled = Math.max(1, Math.round((entry.edge / worst) * CELLS));
          const hot = entry.edge > 1;
          return (
            <li key={entry.label} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.7] text-text sm:text-[10px]">
                  {entry.label}
                </span>
                <span
                  className={`font-[family-name:var(--font-mono)] text-[15px] font-bold tabular-nums sm:text-[17px] ${
                    hot ? "text-loss" : "text-highlight"
                  }`}
                >
                  {entry.edge.toFixed(2)}%
                </span>
              </div>

              <div
                className="flex gap-[3px]"
                role="img"
                aria-label={`House edge ${entry.edge.toFixed(2)} percent`}
              >
                {Array.from({ length: CELLS }, (_, i) => (
                  <span
                    key={i}
                    className="h-3 flex-1"
                    style={{
                      backgroundColor:
                        i < filled ? (hot ? "#e8446c" : "#f0c24a") : "#1e2a35",
                    }}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
