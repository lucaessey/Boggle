## 1. 5x5 size

- [x] 1.1 Add `sizes.5` to balance.json: 25-die Big Boggle set (Qu single face), targets (5:2, 6:1), tileHitRadiusPx 26.
- [x] 1.2 Tests: 25 tiles from 25 dice, meets targets, adjacency at corner/edge/centre; menu shows four buttons.

## 2. Countdown

- [x] 2.1 `Countdown` component (3-2-1-GO, `countdownSeconds`); `BoardTrace` gains `revealed` (face-down, no relayout) and `overlay` props.
- [x] 2.2 Round + PeacefulRound: countdown phase; input and timer deferred to countdown end; Peaceful solves concurrently and holds on loading if slow; Play Again re-counts.
- [x] 2.3 Test: countdown blocks input and starts the timer only at zero.

## 3. Fast swipe

- [x] 3.1 `crossedTiles` + `extendPathThroughSegment` in the path module (interpolate ≤ half-tile step, adjacency/no-reuse, reject non-adjacent jumps).
- [x] 3.2 `BoardTrace`: native pointermove `{ passive: false }`, `getCoalescedEvents`, rAF-batched updates, memoised per-tile rendering.
- [x] 3.3 Tests: straight row capture, diagonal at 7×7, non-adjacent jump rejected.

## 4. Verify

- [x] 4.1 `npm test` passes; `openspec validate size5-countdown-fastswipe` passes.
- [x] 4.2 In-browser: four sizes, countdown across modes (board face-down, timer at zero), 5×5 = 25 tiles; interpolation logic confirmed with real tile centres (rAF flush runs on a visible device).
- [x] 4.3 Dev server on `--host`; report the network URL.
