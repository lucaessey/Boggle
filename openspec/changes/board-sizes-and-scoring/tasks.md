## 1. Balance data

- [x] 1.1 Restructure `balance.json`: `sizes` (4/6/7 with per-size `tileHitRadiusPx`, `targets`, and letter source), `scoring` config, `roundLengths`, `maxGenerationAttempts`, `vowels`; remove `gridSize`, `scoreByLength`, top-level `tileHitRadiusPx`/`roundSeconds`/`dice`.
- [x] 1.2 Add the 36-cube 6×6 set (special cubes substituted, Qu single face) and the 7×7 frequency-weighted `bag` + `vowelMin`.

## 2. Board core (per size)

- [x] 2.1 Generalise `neighbours(index, size)` in `board.ts`.
- [x] 2.2 Face sources: dice roll (4/6) and bag draw without replacement with vowel floor (7); `makeBoard(size, faces, seed)`; `generateRawBoard(size, rng)`.
- [x] 2.3 `findWordsOfMinLength(board, minLength, count)` in `dictionary/findWords.ts` — DFS + trie prefix pruning, early-exit at `count` distinct words; report early exit.
- [x] 2.4 `generateBoard(size, seed?)` in `board/generate.ts` — reroll until per-size targets met, capped at `maxGenerationAttempts`; on cap accept best + `console.warn`; deterministic reroll sequence.
- [x] 2.5 Update `solver.ts` to use `neighbours(index, board.size)`.

## 3. Scoring

- [x] 3.1 Rewrite `scoring.ts`: linear from `scoring` config; stable `scoreForWord` signature (future non-linear table swap-in).

## 4. Menu + round wiring

- [x] 4.1 `Menu` component: size step (3 buttons) → length step (6 buttons from `roundLengths`, labelled mm:ss) → play; Back at each step; persist last size/length in `localStorage` and preselect.
- [x] 4.2 `Round`: accept `size` + `roundSeconds`; generate via `generateBoard(size)`; results screen gets Play Again (same settings, new board) + Change Settings.
- [x] 4.3 `App`: menu → play flow.

## 5. Layout + input

- [x] 5.1 Per-size `tileHitRadiusPx`; `BoardTrace` uses it and `neighbours(_, board.size)`.
- [x] 5.2 Size tiles from viewport width so all sizes stay visible/traceable on a phone; verify 7×7 tracing with small tiles.

## 6. Tests

- [x] 6.1 Each size generates correct dimensions + tile count.
- [x] 6.2 Generated boards satisfy their size targets.
- [x] 6.3 `findWordsOfMinLength` early-exits (does not enumerate the full set).
- [x] 6.4 Seeded determinism at all three sizes.
- [x] 6.5 Adjacency for corner/edge/center at 6×6 and 7×7.
- [x] 6.6 Scoring correct for lengths 3–12.

## 7. Verify

- [x] 7.1 `npm test` passes; `openspec validate board-sizes-and-scoring` passes.
- [x] 7.2 Menu flow + all three sizes play at localhost (incl. 7×7 tracing on mobile width) with no console errors.
