## 1. Balance data

- [x] 1.1 Add the official 16 classic Boggle dice to `src/balance.json` as an array of 16 faces-arrays, with `"Qu"` as a single face string. Verify all 16 dice and 6 faces each are present.
- [x] 1.2 Confirm `gridSize` (4) in `balance.json` is the sole source of the board dimensions used by the module (no hard-coded 4 in code).

## 2. Seeded RNG

- [x] 2.1 Implement a small deterministic seeded RNG helper (e.g. `src/core/board/rng.ts`) exposing `next()` in [0, 1) and an integer-in-range helper, seeded from a number/string. Pure and dependency-free.
- [x] 2.2 Unit test the RNG: same seed → identical sequence; different seeds → different sequences.

## 3. Board model

- [x] 3.1 Define the board types (e.g. `Board`, `Cell`/tile face) in `src/core/board/`.
- [x] 3.2 Implement `generateBoard(seed?)`: load dice from `balance.json`, use the seeded RNG to (a) shuffle/assign the 16 dice to the 16 cells and (b) pick one face per die. Omitting the seed uses a randomly chosen seed.
- [x] 3.3 Implement `neighbours(cellIndex)` returning the up-to-8 orthogonal + diagonal neighbours for a `gridSize`×`gridSize` board.
- [x] 3.4 Keep the module pure and DOM-free (no React, no `window`/`document` imports).

## 4. Tests

- [x] 4.1 Determinism: `generateBoard(seed)` called twice with the same seed produces identical boards (dice assignment and chosen faces).
- [x] 4.2 Seed variation: two different seeds produce different boards.
- [x] 4.3 Adjacency — corner cell returns exactly 3 neighbours.
- [x] 4.4 Adjacency — edge (non-corner) cell returns exactly 5 neighbours.
- [x] 4.5 Adjacency — centre cell returns exactly 8 neighbours.
- [x] 4.6 Dice usage: every one of the 16 dice is used exactly once (each die contributes exactly one face to the board).
- [x] 4.7 `"Qu"` integrity: any tile whose die rolled the `"Qu"` face carries `"Qu"` as a single face, never split.

## 5. Verify

- [x] 5.1 `npm test` passes with all board tests green.
- [x] 5.2 `openspec validate board-and-dice` passes.
