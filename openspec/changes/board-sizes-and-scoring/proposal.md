## Why

The game only supports one board size, one round length, and a duplicate-cancel
scoring table that doesn't scale to bigger boards. This change adds three board
sizes with quality-guaranteed generation, a linear scoring model that works at
any size, selectable round lengths, and a menu to choose them.

## What Changes

- **Board sizes** 4×4, 6×6, 7×7. All size-specific config lives in
  `balance.json` under `sizes`, keyed by size.
  - 4×4: official 16-die classic set (existing).
  - 6×6: official 36-die Super Big Boggle set (added). The two official special
    cubes — a double-letter blend cube and a blank/wildcard cube — are
    **substituted** with plain single-letter cubes so `Qu` stays the only
    multi-letter face and there are no wildcards.
  - 7×7: no official set — a frequency-weighted **tile bag** of 49 tiles drawn
    without replacement, distribution derived from the aggregate letter
    frequencies of the 16- and 36-die sets, with a minimum vowel count.
  - `Qu` remains a single tile face in every source.
- **Scoring** replaces the `scoreByLength` table with a linear config
  `scoring: { minLength, basePoints, pointsPerExtraLetter }`. Score =
  `basePoints + (len - minLength) * pointsPerExtraLetter`. The formula's
  constants live only in `balance.json`, and `scoreForWord` keeps a stable
  signature so a future non-linear table can replace it without touching callers.
- **Board quality guarantees** per size (stored in `balance.json`). Generation
  retries with fresh boards until targets are met, capped at
  `maxGenerationAttempts` (default 50); on cap, the best board seen is accepted
  with a console warning. Seeded generation stays deterministic, including the
  reroll sequence. A dedicated early-exit search `findWordsOfMinLength(board,
  minLength, count)` is used for the checks — **not** a full `solveBoard`.
- **Round lengths** 60/90/120/180/240/300s, stored as an array the menu renders.
- **Menu flow**: choose size → choose length → play, with Back at each step;
  last-used size and length remembered in `localStorage`. Results screen gains
  **Play Again** (same size/length, new board) and **Change Settings**.
- **Layout/input**: `tileHitRadiusPx` becomes per-size; tiles size from viewport
  width so all sizes stay visible and traceable on a phone.

## Capabilities

### New Capabilities

- `board-sizes`: Per-size letter sources (dice sets + weighted bag), adjacency
  at any size, and quality-guaranteed deterministic generation with an early-exit
  word search.
- `game-menu`: Size and round-length selection flow with Back and remembered
  preferences.
- `scoring`: Linear points from a `balance.json` config, replacing the old
  `scoreByLength` table, with a stable `scoreForWord` call site.

### Modified Capabilities

<!-- round-core behaviour (chosen size/length, Change Settings on results) is
     updated in code; its spec is not yet promoted to openspec/specs, so there is
     no delta to write here. -->

The round now runs at a chosen size and length, and the results screen adds a
Change Settings action.

## Impact

- **`balance.json`**: removed `gridSize`, `scoreByLength`, top-level
  `tileHitRadiusPx`, `roundSeconds`, top-level `dice`. Added `sizes`, `scoring`,
  `roundLengths`, `maxGenerationAttempts`, `vowels`.
- **New code**: `board/generate.ts` (quality loop), `dictionary/findWords.ts`
  (early-exit search), menu components; `board.ts` generalised to `size`.
- **6×6 provenance**: the 34 standard cubes are transcribed from a community
  source; the 2 special cubes are substituted (documented). 7×7 bag derived from
  aggregate frequencies (312 faces).
