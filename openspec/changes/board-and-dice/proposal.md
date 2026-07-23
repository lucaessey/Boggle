## Why

Every game mode needs a board to play on, so board generation is the
foundational capability the rest of the sequence builds on. It must be
deterministic (seedable) so rounds can be shared and reproduced, and it must be
a pure, DOM-free module so the dictionary/solver, path input, and scoring work
can be built and tested against it without any UI.

## What Changes

- Introduce a pure, UI-free board module that generates a classic 4×4 Boggle
  board from the official 16-die letter distributions, with `"Qu"` represented
  as a single tile face.
- Generation accepts an **optional seed**. The same seed always produces an
  identical board — both the assignment of dice to cells and the face rolled on
  each die are driven by a seeded RNG. Omitting the seed produces a random
  board.
- The board model exposes an **adjacency function**: given a cell index, it
  returns that cell's up-to-8 orthogonal and diagonal neighbours.
- The **16 dice definitions live in `src/balance.json`**, not in code, keeping
  with the "no magic numbers / balance.json is the single source of truth" rule.
- Add unit tests covering seeded determinism, seed variation, adjacency for
  corner/edge/centre cells, and correct use of all 16 dice.

No breaking changes — this is net-new and nothing consumes it yet.

## Capabilities

### New Capabilities

- `board`: Deterministic, seedable generation of a classic Boggle board from the
  official 16 dice (with `"Qu"` as one face), plus a cell-adjacency function.
  Delivered as a pure, DOM-free, unit-tested module.

### Modified Capabilities

<!-- None. This is the first capability; no existing spec requirements change. -->

## Acceptance Criteria

These are the specific requirements this change must satisfy (to be expanded
into the `specs` artifact after review):

1. **Official distributions.** The board is built from the official 16-die
   classic Boggle letter distributions, with `"Qu"` treated as a single tile
   face (never split into `Q` and `u`).
2. **Seeded determinism.** Generation accepts an optional seed. The same seed
   always yields an identical board — identical dice-to-cell assignment *and*
   identical face chosen on each die. Both are driven by the seeded RNG (no
   `Math.random` in the seeded path).
3. **Adjacency.** The model exposes `neighbours(cellIndex)` returning the up-to-8
   neighbours of a cell (orthogonal + diagonal).
4. **Data-driven dice.** The 16 dice definitions are read from `src/balance.json`,
   not hard-coded in the module.
5. **Test coverage.** Unit tests cover:
   - same seed twice → identical boards;
   - different seeds → different boards;
   - adjacency: corner cell → 3 neighbours, edge cell → 5, centre cell → 8;
   - every one of the 16 dice is used exactly once on the board (each die face
     appears exactly once).

## Impact

- **New code:** a pure board module under `src/` (e.g. `src/core/board/`), with
  a colocated seeded RNG helper and unit tests. No React, no DOM.
- **`src/balance.json`:** add the 16 dice definitions (the letter faces of each
  die). `gridSize` (already present) governs the board dimensions.
- **Dependencies:** none required — a small seeded RNG can be implemented in a
  few lines rather than adding a package. (Design phase to confirm.)
- **Downstream:** unblocks `dictionary-and-solver` and `path-input`, which
  consume the board model and its adjacency function.
