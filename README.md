# Blackjack Martingale Simulator

A simulation lab for analyzing blackjack betting strategies, bankroll dynamics, and risk metrics using Monte Carlo methods.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Recharts** for data visualization
- **Zod** for validation
- **Supabase** for persistence (coming soon)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

The project is layered:

1. **Blackjack Engine** (`lib/engine/`) - pure TypeScript, no UI deps. Cards, shoe (Fisher-Yates shuffle), hand evaluation, dealer rules, round resolution.
2. **Player Policies** (`lib/strategies/`) - basic strategy, random policy.
3. **Betting Strategies** (`lib/betting/`) - flat bet, martingale.
4. **Session Simulator** (`lib/simulation/sessionSimulator.ts`) - runs sequential rounds with bankroll tracking.
5. **Monte Carlo Runner** (`lib/simulation/monteCarloRunner.ts`) - runs N independent sessions and computes risk metrics.
