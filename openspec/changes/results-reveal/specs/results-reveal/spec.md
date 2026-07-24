## ADDED Requirements

### Requirement: Non-blocking post-round solve
When a round ends the system SHALL start a full `solveBoard` in a Web Worker if
one has not already run for that board (Peaceful reuses its existing result). The
results screen SHALL render immediately without blocking on the solve. Reveal
buttons SHALL be disabled with a spinner until the solve resolves. On worker
failure the system SHALL fall back to the main thread; if that also fails, the
reveal buttons SHALL be hidden.

#### Scenario: Reveals gate on the solve
- **WHEN** the results screen is shown while the solve is still running
- **THEN** the reveal buttons are disabled with a spinner, and they enable when the solve resolves

#### Scenario: Reuse in Peaceful
- **WHEN** a Peaceful round ends
- **THEN** the already-computed solve is reused rather than solved again

### Requirement: Sorted word lists
The found-words list SHALL show every found word sorted longest-first with
alphabetical tie-breaking, each row showing the word, its letter count, and its
points. The list SHALL scroll while the score summary stays visible. Missed words
SHALL exclude every found word and use the same sort, capped at
`missedWordsDisplayCap`, with a "Showing X of Y" note when capped; the longest
reveal SHALL show all words tied for the greatest length.

#### Scenario: Found order
- **WHEN** the found list renders
- **THEN** words are ordered longest-first, ties alphabetical

#### Scenario: Missed cap
- **WHEN** there are more missed words than the cap
- **THEN** only the top cap are rendered and the true total is shown

#### Scenario: Longest ties
- **WHEN** several words tie for longest
- **THEN** the longest reveal shows all of them

### Requirement: Tap to see the path
On the results screen the board SHALL remain visible, and tapping any word in any
list SHALL highlight that word's example path (from `solveBoard`, not recomputed)
with the connecting line as during play. Tapping the same word again SHALL clear
it; tapping a different word SHALL replace it; the active row SHALL be marked.
Reveals SHALL not affect score, stats, or achievements and SHALL not be persisted.

#### Scenario: Highlight a word's path
- **WHEN** a word row is tapped
- **THEN** its path highlights on the board with the connecting line and the row is marked active; tapping it again clears the highlight

### Requirement: Board minimum-words safety net
Every board size SHALL require at least `minTotalWords` findable words, checked
with the early-exit `findWordsOfMinLength(board, 3, minTotalWords)` during
generation (never a full solve), on top of the per-size targets.

#### Scenario: Degenerate board rejected
- **WHEN** a board has fewer than `minTotalWords` findable words
- **THEN** it does not satisfy the quality targets
