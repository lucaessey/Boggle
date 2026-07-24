## Why

The game had a single ruleset. A game-mode selector adds replay variety —
different clocks, word rules, and scoring twists — without disturbing the
existing (Normal) experience or the global leaderboard's comparability.

## What Changes

A new **Game mode** screen appears after round length (or, for Peaceful, after
the goal). It offers four modes; the last-used one is remembered. All mode config
lives in `balance.json`.

- **Normal** — existing behaviour, unchanged; the default.
- **Blitz** — clock starts at `blitzStartSeconds` (30) and every accepted word
  adds `blitzBonusSeconds` (3); ends at zero, no maximum. **Ignores the chosen
  round length** (button labelled "Blitz — starts at 0:30", with a note). The
  clock pulses green when time is added. Not available in Peaceful (greyed).
- **Long Words Only** — minimum accepted length becomes 5; a distinct rejection
  message names the rule; board generation additionally requires ≥10 words of 5+
  letters; the missed-words reveal lists only 5+ words.
- **Bonus Tiles** — generation designates one DOUBLE-LETTER and one (distinct)
  TRIPLE-WORD tile from the seeded RNG (deterministic). Scoring is length-based:
  the double-letter tile counts twice toward effective length (a "Qu" double tile
  counts as four letters); the triple-word tile ×3 the final score; when a path
  crosses both, double is applied before triple. Tiles are labelled on the board
  and marked on found words in results.

Cross-cutting: modes are available in every timed length and in Peaceful (except
Blitz). **High scores are keyed by size + length + mode** (Normal keeps its
legacy key, so existing records survive — migrate, not wipe). The **global
leaderboard stays Normal-only**. In **multiplayer** the host selects the mode and
it is shown in the lobby; all players share it (Blitz and Bonus Tiles are
single-player only — they don't fit the shared-clock / word-list sync model).
Achievements continue to unlock in all modes.

## Capabilities

### New Capabilities

- `game-modes`: Selectable Normal / Blitz / Long Words Only / Bonus Tiles with
  per-mode rules, scoring, board generation, and mode-keyed high scores.

## Impact

- New pure core: `core/round/modes.ts`, `core/round/blitz.ts`,
  `core/round/bonusScoring.ts`, `scoreForLength`, generation options, mode key on
  high scores, `isLeaderboardEligibleMode`. New `GameModeId` on `GameConfig`.
- UI: Menu mode step, Round/PeacefulRound wiring, BoardTrace bonus tiles, Results
  markers, Lobby/MultiplayerRound mode. `Board.bonus` added.
- Firebase remains code-split; the global leaderboard is untouched for Normal.
