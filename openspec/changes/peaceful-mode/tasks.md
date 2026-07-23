## 1. Balance + pure logic

- [x] 1.1 Add `peaceful` (`goalPercentages`, `winScreenSeconds`) to balance.json.
- [x] 1.2 `core/round/peaceful.ts`: `goalCount = ceil(total*pct/100)`, `hasReachedGoal`, `progress`.
- [x] 1.3 Unit test goal rounding at 25/50/75/100% across several totals; progress; win-threshold.

## 2. Worker solving

- [x] 2.1 Shared `runSolve(board)` (`solveTask.ts`); solver Web Worker; `solveAsync` wrapper with worker + main-thread fallback; log total + duration.
- [x] 2.2 Test worker/main parity via shared `runSolve` (identical + deterministic for a seeded board).

## 3. Menu

- [x] 3.1 Add distinct Peaceful option to the length step; goal step from balance; Back at each step; persist last goal in localStorage; config union to App.

## 4. Peaceful round

- [x] 4.1 `PeacefulRound`: solve async with loading state; progress bar (found/total/percent + goal marker); no timer; linear scoring.
- [x] 4.2 End Round → results; reaching goal → immediate lock + win.
- [x] 4.3 Share submission + results with timed mode (`useGamePlay` hook, `Results` component).

## 5. Win screen

- [x] 5.1 Full-screen "You win!" + stats; canvas confetti (no dependency); respect prefers-reduced-motion.
- [x] 5.2 Auto-return after `winScreenSeconds`; tap/keypress skips.

## 6. Verify

- [x] 6.1 `npm test` passes; `openspec validate peaceful-mode` passes.
- [x] 6.2 In-browser: menu branch, loading, worker log, progress, win at goal, End Round, skip; no console errors.
