## 1. Pure path module

- [x] 1.1 Implement `src/core/path/path.ts`: `extendPath(state, candidate, neighbours)` state machine (start / append-adjacent / backtrack / no-op), `hitTest(point, centers, radius)` (nearest centre within radius), `pathWord(faces, state)`.
- [x] 1.2 Keep the module pure and DOM-free (no React, no `window`/`document`).

## 2. Tests

- [x] 2.1 `path.test.ts` — `extendPath`: start empty, append 8-way adjacent unused, reject non-adjacent, backtrack on second-to-last, ignore other used tiles, no-op on same tile.
- [x] 2.2 `path.test.ts` — `hitTest`: inside radius returns tile, outside returns null, nearest wins when overlapping.
- [x] 2.3 `path.test.ts` — `pathWord`: joins faces in order, "Qu" contributes both letters.

## 3. Interactive board component

- [x] 3.1 Replace the static board with an interactive component driven by Pointer Events (single path for mouse + touch), using `tileHitRadiusPx` for hit-testing and `neighbours` for adjacency.
- [x] 3.2 Highlight selected tiles and draw a connecting line (SVG overlay) through the path.
- [x] 3.3 Show the in-progress word above the grid; on release show the traced word below and clear the path.
- [x] 3.4 Use pointer capture and `touch-action: none` so tracing is responsive and does not scroll the page.

## 4. Verify

- [x] 4.1 `npm test` passes.
- [x] 4.2 `openspec validate path-input` passes; board traces correctly at localhost with no console errors.
