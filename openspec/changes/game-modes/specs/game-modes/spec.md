## ADDED Requirements

### Requirement: Game-mode selection
After choosing round length (or, in Peaceful, the goal), the menu SHALL present a
mode screen offering Normal, Blitz, Long Words Only, and Bonus Tiles, each shown
with its name and a one-line rule description. Back navigation SHALL work as
elsewhere, the last-used mode SHALL persist in localStorage, and all mode config
SHALL live in balance.json. Modes SHALL be available in every timed length and in
Peaceful, EXCEPT Blitz, which requires a clock and SHALL be disabled (with an
explanation) when Peaceful was selected.

#### Scenario: Blitz unavailable in Peaceful
- **WHEN** Peaceful was selected before the mode screen
- **THEN** the Blitz option is disabled with an explanation, and the other three modes are selectable

### Requirement: Blitz clock
Blitz SHALL start at `blitzStartSeconds` and add `blitzBonusSeconds` per ACCEPTED
word (nothing for rejected words), ending when the clock reaches zero with no
maximum. Blitz SHALL IGNORE the round length chosen on the previous screen — its
button SHALL read "Blitz — starts at 0:30" and the mode screen SHALL note this.
The clock display SHALL visibly pulse when time is added.

#### Scenario: Accepted word adds time; the chosen length is ignored
- **WHEN** a Blitz round starts after the player chose any round length
- **THEN** the clock starts at the Blitz start time, and each accepted word adds exactly the bonus seconds

### Requirement: Long Words Only
Long Words Only SHALL raise the minimum accepted word length to `longModeMinLength`
(5) and reject shorter words with a distinct message naming the rule. Board
generation SHALL additionally require at least 10 words of 5+ letters (checked
with the early-exit search). The missed-words reveal SHALL list only words of 5+
letters.

#### Scenario: Short words rejected, long words accepted
- **WHEN** a 4-letter valid word is submitted, then a 5-letter valid word
- **THEN** the 4-letter word is rejected as too short (rule named) and the 5-letter word is accepted

### Requirement: Bonus Tiles
Bonus Tiles generation SHALL designate one double-letter tile and one distinct
triple-word tile from the seeded RNG, so a given seed is deterministic. Both tiles
SHALL be visually distinct and labelled, legible at all board sizes. Scoring is
length-based: a path crossing the double-letter tile makes that tile count twice
toward effective length (a "Qu" double tile counts as four letters); a path
crossing the triple-word tile multiplies the final score by 3; when a path crosses
both, the double-letter adjustment is applied first, then the triple. Results SHALL
mark which words earned which bonus.

#### Scenario: Both bonuses on one word
- **WHEN** a traced word crosses both the double-letter and triple-word tiles
- **THEN** its score is (base length + doubled tile length) scored, then multiplied by 3

### Requirement: Mode-keyed high scores; Normal-only leaderboard
High-score records SHALL be keyed by size + length + mode; pre-existing Normal
records SHALL be preserved (migrate rather than wipe). The global leaderboard
SHALL remain Normal-mode only — no other mode may write to it. Achievements SHALL
continue to unlock in all modes.

#### Scenario: Modes do not overwrite each other; leaderboard gated
- **WHEN** a Blitz round is recorded for a size+length that already has a Normal record
- **THEN** the Normal record is unchanged, the Blitz record is stored separately, and no global-leaderboard write occurs for the Blitz round

### Requirement: Multiplayer mode
In multiplayer the host SHALL select the mode along with size and length, it SHALL
be shown to players in the lobby, and all players in a room SHALL play the same
mode.

#### Scenario: Guest sees the host's mode
- **WHEN** the host selects a mode in the lobby
- **THEN** the guest's lobby shows that mode and the round plays it for everyone
