# Skip-Bo Mini-Event Prototypes

**22 playable mobile-web prototypes** of LiveOps mini-events for Skip-Bo, built for Liquidnitro Games — 10 monetization events and 12 engagement events. No build step, no dependencies: open `index.html` (or the GitHub Pages link) on a phone.

All purchases are simulated. Wallet and event state persist in localStorage; every screen has a demo reset.

---

## Part 1 — Monetization events (10)

Wrapping Skip-Bo's *existing* IAPs, coins, energy and boosters in new interactive systems. The governing rule from the research: **the purchase is never the final moment** — celebration and further claiming always come after checkout.

| Event | Mechanic | Proven by |
|---|---|---|
| **Treasure Elevator** | Progressive offer chain: free floors → $1.99 → richer free floors → $4.99 → rooftop grand prize | Royal Match Endless Treasure (+20% revenue, first 30 days) |
| **Prize Drop** | Physics plinko: progressive jackpot, moving ×2 pocket, ×1/×2/×3 stakes, milestone track | Monopoly GO! Peg-E |
| **Pack Your Prize Box** | Build-your-own-bundle as a packing game; slot sizes, live price, discount meter | Merge Mansion / AFK Arena BYOB |
| **Treasure Dig** | Excavation grid with partial-reveal near-miss telegraphing; scanner/dynamite | Monopoly GO Treasures, Fishdom |
| **Build Before Sunset** | Timer build with speed-ups, Foreman pack, second worker, Grand Opening pack | Construction metas |
| **Rescue Run** | The viral pin-pull ad rebuilt as an honest playable event | Hero Rescue-style creatives |
| **Sorting Warehouse** | Conveyor colour-sort with holding-slot tension; jams pause, never destroy | Viral sort / bus-jam creatives |
| **Lucky Grabber** | Claw machine with a finite *visible* prize pool, published odds, pity meter | Bingo Pop claw |
| **Reward Workshop** | Craft the reward you choose; monetizes the exact missing ingredient | Ingredient-gap monetization |
| **Collector's Showcase** | Sticker album; duplicates always feed a wildcard meter | Monopoly GO albums |

## Part 2 — Engagement events (12)

Every one is **fuelled by main-level completion** — the dominant pattern across Royal Match, Toon Blast, Fishdom, Monopoly GO and Coin Master. Clearing a Skip-Bo adventure level is the only way to earn event input; **hard levels pay ~2×**, which converts "play more" into "play harder" without new content. A shared level simulator (`shared/levelsim.js`) stands in for real adventure play.

| Event | Archetype | Fuel → output |
|---|---|---|
| **Stock Pile Streak** | Risk / double-or-nothing ladder | clear = climb a rung; bank anytime |
| **Double-or-Nothing Dash** | Daily jackpot, first-try streak | 7 consecutive first-try clears = jackpot |
| **Wild Card Wager** | Ticket-wager arena | wager 1–3 tickets on yourself; **your real clear rate is displayed** |
| **Salvage Run** | Loss-insurance collection | clears salvage crates; losses breach the hull; bank before you sink |
| **Grand Prix Circuit** | 5-player bracket race | clear = 1 segment, first-try = 2 (nitro) |
| **King's Cup Ladder** | Safe-accumulation leaderboard + milestone lane | clear = cups; nothing ever resets |
| **Pyramid Ascent** | Escalating milestone tower | clear = 10 pts, hard = 25; free players reach ~80% of tiers |
| **Chestnut Dig** | Dig with published odds + pity | clear = dig ticket, hard = power dig (3-tile cross) |
| **Card-Back Album** | Endless prestige collection | clears = packs; completing the album prestiges instead of ending |
| **Harvest Festival** | Build-track with free/premium lanes | clear = 3 planks, hard = 7; free lane completes the whole scene |
| **Team Harvest** | 10-team tournament | your clears feed a shared team score |
| **Bridge Builders** | Partner co-op | clears earn rivets both partners spend on a shared build |

### Honest-mechanics rules enforced in every engagement event

1. **Visible odds and pity.** Any randomness publishes its exact odds on screen and carries a free, always-active pity counter (Chestnut Dig's guarantee was verified against a 2.3M-dig simulation; Card-Back Album's against 200k rolls).
2. **A slower free path behind every paywall.** Every refill, multiplier or insurance offer shows its free equivalent — a regen timer, a pity threshold, or "clear N more levels" — *in the same view*.
3. **Never dead-end at checkout.** Loss and depletion moments always present a non-paid option alongside the paid one.
4. **Leaderboard + milestone hybrid.** Competitive events pair rankings with a personal milestone track so every participant earns something.
5. **Losses never destroy banked value.** Risk events knock you down, not to zero, and banked rewards are always safe.

## Structure

```
index.html            — hub (Monetization / Engagement tabs)
shared/core.css       — Skip-Bo design system
shared/core.js        — wallet, fake-IAP sheet, rewards, confetti, countdowns
shared/levelsim.js    — animated Skip-Bo level simulator (SB.playLevel)
events/*.html         — one self-contained playable event per file
```

Each event page carries an ⓘ modal explaining the mechanic and its engagement/monetization logic for stakeholders.

## Verification

All 23 pages were played end-to-end in headless Chromium at 390×844 and 360×740: zero console/page errors, zero horizontal overflow, touch targets ≥44px, and reward/economy maths proven by scripted runs (wallet asserted before/after every grant). Pacing simulations back the published claims in Pyramid Ascent (~80% free tiers), Harvest Festival (~41 clears to finish), Chestnut Dig and Card-Back Album.

*Prototype only — not affiliated with Mattel. All art is emoji/CSS placeholder.*
