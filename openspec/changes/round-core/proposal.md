## Why

The pieces exist — board, dictionary/solver, path tracing — but there is no game
yet. This change adds the timed round loop that ties them together: start a
round, trace and submit words, get validation feedback, accumulate a score, and
see results when the clock runs out.

The dictionary and solver (`isValidWord`, `solveBoard`) already exist from the
`dictionary-and-solver` change and are reused as-is; this change does not
re-implement them.

## What Changes

- Add pure, DOM-free round logic (`src/core/round/`):
  - `scoreForWord(word)` — points from the `scoreByLength` table in balance.json.
  - `classifySubmission(word, found, deps)` — the submission outcome, checked in
    order: too short → not a word → already found → accepted.
- Wire a playable round into the UI:
  - A **Start** button begins a round of `roundSeconds`; show a countdown.
  - On submit, give distinct visible feedback (colour + short message) for each
    outcome.
  - Accepted words go into a **found-words list** with their point values.
  - A **running score** using `scoreByLength`.
  - When the timer hits zero, **lock input** and show a **results screen**: final
    score, all found words with points, and the total number of words that
    existed on the board (from `solveBoard`).
  - A **Play Again** button generates a fresh board and starts over.
- Adapt the trace component to submit the traced word on release and to be
  disabled when the round is not running.

## Capabilities

### New Capabilities

- `round-core`: The timed single-round loop — start/countdown, submission
  validation and feedback, found-words list, running score, and end-of-round
  results with a play-again reset.

### Modified Capabilities

<!-- None. Reuses dictionary, board-solver, path-input, board capabilities. -->

## Impact

- **New code:** `src/core/round/` (pure scoring + submission logic, tested); a
  round/game component; small changes to the trace component (submit + disabled).
- **`src/balance.json`:** none — reuses `roundSeconds`, `minWordLength`,
  `scoreByLength`.
- **Reuses:** `isValidWord`, `solveBoard`, `generateBoard`, `BoardTrace`.
