## Why

The multiplayer results screen only showed your own score and words. Players want
to browse what everyone else found, and the "reveal longest" was ambiguous about
whether it meant the board's longest or the longest anyone actually found.

## What Changes

Purely UI over existing `results/{uid}` data — no new Firebase writes.

- **Browse other players**: each leaderboard row is tappable (clear chevron
  affordance) and opens a full-screen player detail view — nickname, final score,
  and their full word list sorted longest-first (alphabetical tie-break) with
  letter count, points that player earned, and a 2× marker on unique-bonus words.
  Tapping a word highlights its board path (tap again clears). Back returns to the
  leaderboard. Your own row opens the same view.
- **Reveal longest** now shows two entries: (1) LONGEST ON THE BOARD (from the
  solver, with finder names or "Nobody found this."; all ties shown); (2) LONGEST
  ANYONE FOUND (with finder names; ties handled). If the two are the same word,
  they collapse into one labeled entry. Single-player reveal is unchanged.
- **Missed words** still means words YOU didn't find (existing top-100 cap +
  sort); each missed word that at least one other player found gets a small
  marker.

## Capabilities

### New Capabilities

- `multiplayer-results-browsing`: Player browsing, board-vs-found longest reveal
  with attribution, and beaten-word markers on missed words.

## Impact

- New pure `src/core/round/multiplayerReveal.ts` (`longestReveal`, `othersFound`).
  Rewritten `MultiplayerResults.tsx` + CSS. New tests. Single-player reveal
  untouched.
