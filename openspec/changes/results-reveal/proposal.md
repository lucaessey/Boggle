## Why

The results screen was a flat found-words list. This reworks it into a richer
review: sorted lists, reveal options (longest / missed words) backed by a
non-blocking post-round solve, and tap-to-see-the-path on the board. Adds a
30-word board minimum as a degenerate-board safety net.

## What Changes

- **Post-round solve**: when a round ends, run a full `solveBoard` in the Web
  Worker (Peaceful reuses the solve it already ran — no double solve). The
  results screen renders immediately; reveal buttons start disabled with a
  spinner and enable when the solve resolves. Worker failure falls back to the
  main thread; if that also fails, the reveal buttons are hidden.
- **Found words list**: every found word, sorted longest-first (alphabetical
  ties), each row showing the word, letter count, and points. The list scrolls;
  the score summary stays pinned.
- **Reveal options**: "Reveal longest word" (all words tied for longest) and
  "Reveal missed words" (valid words not found, same sort, capped at
  `missedWordsDisplayCap` with a "Showing X of Y" note; each row shows the word,
  letter count, and points it would have scored). Reveals are per-round only,
  affect nothing (score/stats/achievements), and toggle collapse once shown.
- **Tap to see the path**: the board stays on the results screen; tapping any
  word (found/longest/missed) highlights that word's example path (from
  `solveBoard`, not recomputed) with the connecting line; tapping again clears;
  the active row is marked.
- **Board quality minimum**: every size must have at least `minTotalWords` (30)
  findable words, checked with the early-exit `findWordsOfMinLength(board, 3,
  30)` — never a full solve during generation.

## Capabilities

### New Capabilities

- `results-reveal`: A results screen with sorted found/longest/missed lists,
  async reveal options, and tap-to-highlight paths; plus a board-generation
  minimum-words safety net.

## Impact

- **balance.json**: `minTotalWords` (30), `missedWordsDisplayCap` (100).
- **New code**: pure `core/round/results.ts` (sorting/missed/longest); a
  rewritten Results component; `generate.ts` exports `boardMeetsTargets` /
  `targetsForSize` and enforces the min-words target. `runSolve`/worker/
  `solveAsync` now return `entries` (word→path); `BoardTrace` gains
  `externalPath` / `hideChrome` / `compact` for results display. The big "Boggle"
  title is hidden off the menu to make room.
