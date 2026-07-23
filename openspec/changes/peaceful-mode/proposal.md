## Why

Timed rounds are the only mode. Peaceful mode adds a relaxed, untimed variant:
find a target share of the board's words at your own pace, with a celebratory
win. It requires the exact total word count, so the board is fully solved off the
main thread to keep the UI responsive.

## What Changes

- **Menu**: the round-length step gains a seventh, visually distinct **Peaceful**
  option. Choosing it opens a goal-percentage step (25/50/75/100%, read from
  `balance.json`). Back works at every step; the last-used goal is persisted in
  `localStorage` alongside size and length.
- **Solving**: Peaceful needs a full `solveBoard`. It runs in a **Web Worker**
  (with a "Finding all the words…" loading state) so the UI never blocks; a
  main-thread fallback is used when Workers are unavailable. The worker and
  fallback share `runSolve`, so results are identical and seeded-deterministic.
  Total count and solve duration are logged to the console.
- **Goal & progress**: `goalCount = ceil(total * goalPercentage / 100)`. A
  progress bar at the top shows words found / total / percent with a marker at
  the goal; raw counts are shown as text. No timer; scoring is the existing
  linear rule.
- **Ending**: an **End Round** button (no timer) goes to the normal results
  screen. Reaching `goalCount` immediately locks input and shows a **win screen**.
- **Win screen**: full-screen "You win!" with stats and a lightweight canvas
  confetti animation (no runtime dependency; respects `prefers-reduced-motion`).
  It lasts `winScreenSeconds` (balance.json) then returns to the menu; a tap or
  keypress skips ahead.

## Capabilities

### New Capabilities

- `peaceful-mode`: Untimed, goal-based play with worker-solved totals, a progress
  bar, and a win screen.

### Modified Capabilities

<!-- Menu gains a Peaceful branch; Round submission logic is shared via a hook.
     Those specs are not promoted to openspec/specs, so no delta is written. -->

## Impact

- **New code**: `core/round/peaceful.ts` (goal/progress, pure); a solver Web
  Worker + `solveAsync` wrapper + shared `runSolve`; `PeacefulRound`, `WinScreen`,
  `Confetti`, `Results`, and a shared `useGamePlay` hook.
- **`balance.json`**: added `peaceful` (`goalPercentages`, `winScreenSeconds`).
- **Refactor**: `Round` now shares submission logic and the results view with
  Peaceful mode.
