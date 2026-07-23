## ADDED Requirements

### Requirement: Peaceful menu branch
The round-length menu SHALL include a visually distinct Peaceful option (no time
limit). Choosing it SHALL open a goal-percentage step whose options are read from
`balance.json` (`peaceful.goalPercentages`). Back SHALL work at every step, and
the last-used Peaceful goal SHALL be persisted in `localStorage`.

#### Scenario: Choose Peaceful and a goal
- **WHEN** the player picks Peaceful and then a goal percentage
- **THEN** a Peaceful round starts at that size and goal

#### Scenario: Back from the goal step
- **WHEN** the player is on the goal step and activates Back
- **THEN** they return to the round-length step

### Requirement: Non-blocking full solve
Peaceful mode SHALL compute the exact total findable word count with a full
solve, run in a Web Worker with a loading state shown while it runs, and fall
back to the main thread when Workers are unavailable. Worker and fallback SHALL
produce identical, seeded-deterministic results, and the total count and solve
duration SHALL be logged.

#### Scenario: Loading state during solve
- **WHEN** a Peaceful round begins
- **THEN** a "Finding all the words…" state is shown until the solve completes

#### Scenario: Identical results
- **WHEN** the same seeded board is solved by the worker and by the main-thread fallback
- **THEN** they return the same total and word set

### Requirement: Goal, progress, and scoring
The goal SHALL be `ceil(total * goalPercentage / 100)`. A progress bar SHALL show
words found, total, percent, and a marker at the goal position, with the raw
counts shown as text. No countdown timer SHALL be shown; scoring SHALL use the
existing linear rule.

#### Scenario: Progress updates as words are found
- **WHEN** the player finds words
- **THEN** the bar fills and the text reflects found / total and percent

### Requirement: Ending and winning
Peaceful mode SHALL provide an End Round action that goes to the results screen.
Reaching the goal count SHALL immediately lock input and show a win screen: a
full-screen "You win!" with final stats and a lightweight canvas confetti
animation that respects `prefers-reduced-motion`. The win screen SHALL last
`winScreenSeconds` then return to the menu, and a tap or keypress SHALL skip
ahead.

#### Scenario: Reaching the goal wins
- **WHEN** the number of found words reaches the goal count
- **THEN** input is locked and the win screen is shown

#### Scenario: One short does not win
- **WHEN** the player has one fewer than the goal count
- **THEN** the round continues and no win screen is shown

#### Scenario: End Round to results
- **WHEN** the player activates End Round
- **THEN** the results screen is shown
