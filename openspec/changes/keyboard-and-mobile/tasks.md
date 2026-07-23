## 1. Solver: hasPath

- [x] 1.1 Add `hasPath(board, word)` to the solver — DFS, 8-way adjacency, no reuse, Qu consumes two letters, early-exit on first path, null if none.
- [x] 1.2 Unit test hasPath: valid path, letters-present-but-unconnected (null), reuse-required (null), Qu tile.

## 2. Keyboard input + unified word state

- [x] 2.1 Rewrite `BoardTrace` to one current-word state fed by drag and typing; window `keydown` (letters/Backspace/Enter/Escape), gated on active round, non-letters ignored.
- [x] 2.2 Live typed-path highlight via `hasPath` (tiles + line); distinct no-path style; desktop-only hint.
- [x] 2.3 Mode switching: typing clears an in-progress drag; starting a drag clears a typed word.

## 3. Submission order

- [x] 3.1 Add `not-on-board` outcome to `classifySubmission` (order: too-short → not-a-word → not-on-board → already-found → accepted); wire `isOnBoard` via `hasPath` in `Round`; distinct feedback per case.
- [x] 3.2 Update round tests for the new outcome and priority order.

## 4. Touch behaviour

- [x] 4.1 Grid: `touch-action: none`, `overscroll-behavior: contain`, pointer capture; handle `pointercancel` (clear, no submit).
- [x] 4.2 Tiles: `user-select: none` + `-webkit-`, `-webkit-tap-highlight-color: transparent`.

## 5. Layout

- [x] 5.1 `viewport-fit=cover`; disable double-tap zoom on controls; ≥44×44 touch targets.
- [x] 5.2 Safe-area insets; grid/timer/word/score fit 375×667 at all sizes; portrait + landscape without overflow (grid capped by vw and vh).

## 6. Haptics

- [x] 6.1 `navigator.vibrate` on tile selection and acceptance, guarded; `haptics` config in balance.json.

## 7. Verify

- [x] 7.1 `npm test` passes; `openspec validate keyboard-and-mobile` passes.
- [x] 7.2 Verify in-browser: keyboard typing, live highlight, no-path style, mode switching, all outcomes; layout fits 375×667 at all sizes and in landscape.
- [x] 7.3 Restart dev server with `--host`; report the network URL for real-device testing.
