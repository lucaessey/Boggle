## 1. Stats + evaluation core

- [x] 1.1 `core/stats/stats.ts`: lifetime + round state, `startRound`, and pure `evaluate(stats, event)` for accepted/rejected/round-ended; thresholds from balance.json.
- [x] 1.2 `core/stats/achievements.ts`: 18 achievement definitions with balance-driven thresholds.
- [x] 1.3 `isStraightLine` in the path module; `statsStore` localStorage adapter (lifetime only).
- [x] 1.4 Add `achievements` thresholds to balance.json.

## 2. Tests

- [x] 2.1 Each achievement unlocks on its exact trigger and not one step short.
- [x] 2.2 Perfectionist guard (<5 words), Mirror Match not on palindrome, Straight Shooter rejects a bent 4-path, Rapid Fire uses a rolling window.
- [x] 2.3 Stats survive a localStorage round-trip (unlocks intact); Reset clears everything.

## 3. Unlock feedback

- [x] 3.1 Achievements context: apply events, persist lifetime, queue unlock toasts (one at a time, non-blocking, reduced-motion aware).

## 4. Trophy + screen

- [x] 4.1 Trophy button (top-left menu, ≥44×44) with unlocked/total badge.
- [x] 4.2 Achievements screen: unlocked show trophy/name/desc/date; locked show lock/name/desc; milestones show progress; Reset behind a confirm; Back to menu.
- [x] 4.3 "More by this creator" rows (⚡ Wordventure, 🐍 Snake) — new tab, rel="noopener noreferrer", ≥44px.

## 5. Wiring

- [x] 5.1 Emit events from Round + PeacefulRound (startRound at play, accepted/rejected on submit, round-ended on finish/win); `BoardTrace.onWord` passes the path; `useGamePlay.submit` returns points.

## 6. Verify

- [x] 6.1 `npm test` passes; `openspec validate achievements` passes.
- [x] 6.2 In-browser: trophy badge, screen (locked show descriptions, milestone progress, creator links), an unlock toast, persistence; no console errors.
