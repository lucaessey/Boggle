## ADDED Requirements

### Requirement: Per-board leaderboards, solo timed only
The system SHALL maintain 24 leaderboards, one per (board size 4/5/6/7 × round
length 60/90/120/180/240/300s), each ranked two ways: highest points and most
words. Only SOLO TIMED rounds SHALL be eligible to write; peaceful and
multiplayer rounds SHALL never write. Data SHALL be stored at
`/leaderboards/{size}x{seconds}/{uid} = { name, score, words, updatedAt }`, one
entry per player per board keyed by anonymous auth uid.

#### Scenario: Board keys are isolated
- **WHEN** a 5×5 180s result is written
- **THEN** it lands only on board `5x180` and never on `5x120`, `6x180`, or any other board

#### Scenario: Non-timed rounds never write
- **WHEN** a peaceful or multiplayer round ends
- **THEN** no leaderboard write occurs

### Requirement: Independent personal bests, write-on-improve only
`score` and `words` SHALL be tracked as independent personal bests. A write SHALL
occur only for the value(s) that strictly improve on the stored best; a round
beating one but not the other SHALL update only that one; a round beating neither
SHALL write nothing. The two values MAY therefore come from different rounds.

#### Scenario: Higher score only
- **WHEN** a round beats the stored score but not the stored word count
- **THEN** only `score` is written

#### Scenario: Higher word count only
- **WHEN** a round beats the stored word count but not the stored score
- **THEN** only `words` is written

#### Scenario: Improves neither
- **WHEN** a round beats neither stored value
- **THEN** nothing is written

### Requirement: Opt-in consent and display names
Submitting SHALL be opt-in. The first time a solo timed round qualifies, a
results-screen prompt SHALL explain the score will be publicly visible, ask for a
display name (max 12 characters), and offer Submit or No thanks. The choice SHALL
be remembered; a declining player SHALL never be prompted again but SHALL be able
to opt in later from the leaderboard screen. An existing multiplayer nickname
SHALL prefill the name, but consent SHALL still be requested the first time. Names
SHALL pass a basic profanity filter or be rejected with a clear message. A
"Remove me from the leaderboard" control SHALL delete the player's entries.

#### Scenario: Decline is remembered
- **WHEN** a player chooses "No thanks"
- **THEN** the prompt never appears again, and an opt-in control remains available on the leaderboard screen

#### Scenario: Profane name rejected
- **WHEN** a submitted name fails the profanity filter
- **THEN** submission is refused with a clear message

### Requirement: Global leaderboard view
The high-scores screen SHALL offer "My Scores" and "Global" tabs. The Global view
SHALL provide board-size selection, round-length selection (a dropdown when a
third tab row would not fit a 375px viewport), and a Points/Words toggle. It SHALL
show up to 50 real entries — rank, name, value, date — highlighting the current
player's row, and SHALL NEVER pad or invent rows. Loading, error, and empty
states SHALL each be handled distinctly; an unreachable database SHALL show an
error rather than an empty board. The Global view and Firebase code SHALL load
only when the Global tab is opened.

#### Scenario: Fewer than 50 entries
- **WHEN** a board has fewer than 50 submitted entries
- **THEN** exactly that many rows render, with no placeholders

#### Scenario: Empty vs unreachable
- **WHEN** a board has no entries
- **THEN** a "no scores yet" message shows; **WHEN** the database is unreachable, an error message shows instead
