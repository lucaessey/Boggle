## Why

Three improvements: a fourth board size (5×5 Big Boggle), a countdown start that
replaces the Start button and hides the board briefly (fairer, more game-like),
and fast-swipe handling so quick flicks trace correctly instead of dropping tiles
the browser batched away.

## What Changes

- **5×5 size** between 4×4 and 6×6, using the official 25-die Big Boggle set
  (added to balance.json, `Qu` a single face). Quality targets: ≥1 word of 5+,
  ≥1 of 6+, and ≥2 distinct 5+. Per-size `tileHitRadiusPx` (26). The size menu
  now has four buttons.
- **Countdown** replaces the Start button. After settings are chosen the game
  goes straight into a `countdownSeconds` (3) countdown showing 3, 2, 1, GO!. The
  board is shown face-down at final positions (no relayout, no remount); all
  input is ignored during the countdown; the round timer starts only at zero.
  Applies to every mode. In Peaceful the Web Worker solve starts when the board
  is generated and runs concurrently with the countdown; if the solve is still
  running at zero, a brief loading state holds before play. Play Again gets a
  fresh countdown.
- **Fast-swipe interpolation**: recover `getCoalescedEvents()` samples; between
  consecutive samples, interpolate at a step ≤ half a tile width and hit-test
  each point; add crossed tiles in order under the existing adjacency/no-reuse
  rules; a genuine non-adjacent jump is rejected, not bridged. The move listener
  is registered `{ passive: false }`; per-move work is batched into a
  `requestAnimationFrame` callback and tiles are memoised so only tiles whose
  selected state changed re-render.

## Capabilities

### New Capabilities

- `size-5x5`: A 5×5 board from the 25-die Big Boggle set with its own quality
  targets and hit radius.
- `countdown-start`: A 3-2-1-GO countdown that hides the board and defers input
  and the timer, for every mode.
- `fast-swipe`: Interpolated, rAF-batched pointer tracing that keeps up with fast
  flicks.

### Modified Capabilities

<!-- Round/Peaceful gain a countdown phase; BoardTrace's drag path is rebuilt.
     Those specs are not promoted to openspec/specs, so no delta is written. -->

## Impact

- **balance.json**: `sizes.5` (dice/targets/hit radius); `countdownSeconds`.
- **New code**: `Countdown` component; `crossedTiles` / `extendPathThroughSegment`
  in the path module; a rewritten `BoardTrace` (native listener, interpolation,
  rAF, memoised tiles, face-down reveal).
- **Tests**: added `@testing-library/react` + `jsdom` for a countdown component
  test.
