# blackjack simulator
blackjack sim with live play and monte carlo analysis. play hands manually or let basic strategy run, track your bankroll, and run monte carlo sessions to see how different betting strategies play out over thousands of simulated hands. access at: https://blackjack.samirmd.com

## features
- live session: play hands yourself (manual mode) with hit/stand/double/surrender (split coming soon!). basic strategy hints are also viewable to help in training/learning
- manual betting: pick your bet with chips ($5/$10/$25/$50) or use pre-loaded strategy (martingale, flat, paroli, etc.) to auto-size bets
- monte carlo: run thousands of sessions, see risk metrics, bankroll distribution, and session samples
- bankroll graph: watch your stack over time with a candlestick chart
- hand history: table of all rounds with bet, result, net cashflow
- settings: decks, bj payout, bankroll, table max, toggles for surrender and doubles, and more!
- persistant memory for runs and data science center to analyze runs and compute accurate metrics like risk of ruin, etc. (coming soon!)

## run locally
```bash
npm install
npm run dev
```

open http://localhost:3000

## stack
react, next.js, typescript, tailwind v4, zod, supabase (coming soon!), postgreSQL
