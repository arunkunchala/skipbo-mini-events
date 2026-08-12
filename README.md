# Skip-Bo Monetization Mini-Event Prototypes

Ten playable mobile-web prototypes of monetization mini-events for Skip-Bo, built for Liquidnitro Games. Each event wraps Skip-Bo's existing economy (coins, energy, boosters, $0.99–$19.99 IAP tiers) in a new interactive mechanic proven in top-grossing casual games.

**Live demo:** open `index.html` (or the GitHub Pages link) on a phone — everything is portrait mobile-first, no build step, no dependencies.

## The 10 events

| # | Event | Mechanic | Proven by |
|---|-------|----------|-----------|
| 1 | **Treasure Elevator** | Progressive offer chain (free → $1.99 → free → $4.99 → grand prize) | Royal Match Endless Treasure (+20% revenue in 30 days) |
| 2 | **Prize Drop** | Physics plinko with progressive jackpot, multipliers, ball IAPs | Monopoly GO! Peg-E |
| 3 | **Pack Your Prize Box** | Build-your-own-bundle as a packing game with discount meter | Merge Mansion / AFK Arena custom bundles |
| 4 | **Treasure Dig** | Grid excavation with partial-reveal near-miss telegraphing | Monopoly GO Treasures / Fishdom digs |
| 5 | **Build Before Sunset** | Timer-build with speed-ups, Foreman & Grand Opening packs | Construction metas / timer monetization |
| 6 | **Rescue Run** | The viral pin-pull ad as an honest playable event | Hero Rescue-style ads |
| 7 | **Sorting Warehouse** | Conveyor color-sort with holding-slot tension | Viral sort/bus-jam creatives |
| 8 | **Lucky Grabber** | Claw machine with finite visible pool + pity meter | Bingo Pop claw |
| 9 | **Reward Workshop** | Craft the reward you choose; buy only the missing ingredient | Ingredient-gap monetization |
| 10 | **Collector's Showcase** | Sticker album with duplicate→wildcard meter and deadline offers | Monopoly GO albums |

## Design rules baked into every prototype

- Play → earn inputs → interact with a satisfying system → visible progress/ownership → contextual IAP → **celebration and more claiming AFTER the purchase** (never a dead end at checkout).
- No hard blocks: every paywall has a slower free path ("Play a level" simulates returning to core Skip-Bo play).
- Honest presentation: visible odds, visible prize pools, pity meters — the viral ad mechanics without the bait.
- All purchases are simulated. Wallet and event state persist in localStorage; every screen has a demo reset.

## Structure

```
index.html            — hub screen
shared/core.css       — Skip-Bo design system
shared/core.js        — wallet, fake-IAP sheet, rewards/confetti/countdown helpers
events/*.html         — one self-contained playable event per file
```

Each event page declares an ⓘ info modal explaining the mechanic and its monetization logic for stakeholders.

*Prototype only — not affiliated with Mattel. All art is emoji/CSS placeholder.*
