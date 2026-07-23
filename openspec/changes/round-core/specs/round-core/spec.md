## ADDED Requirements

### Requirement: Start a timed round
A round SHALL begin from a Start action and run for `roundSeconds` (from
`src/balance.json`). A countdown of the remaining time SHALL be shown while the
round runs.

#### Scenario: Start begins the countdown
- **WHEN** the player starts a round
- **THEN** the remaining time begins at `roundSeconds` and counts down
- **AND** the board becomes traceable

### Requirement: Submission outcomes
On word submission the system SHALL determine the outcome in this order: the word
is too short (shorter than `minWordLength`), then not a real word (rejected by
`isValidWord`), then already found, otherwise accepted. Each outcome SHALL give
distinct visible feedback (a colour and a short message).

#### Scenario: Too short
- **WHEN** a submitted word is shorter than `minWordLength`
- **THEN** the outcome is "too short" with its own feedback, and it is not scored

#### Scenario: Not a word
- **WHEN** a submitted word is at least `minWordLength` but not accepted by `isValidWord`
- **THEN** the outcome is "not a word" with its own feedback, and it is not scored

#### Scenario: Already found
- **WHEN** a submitted word is valid but is already in the found list
- **THEN** the outcome is "already found" with its own feedback, and it is not scored again

#### Scenario: Accepted
- **WHEN** a submitted word is valid, long enough, and not yet found
- **THEN** it is accepted, added to the found list, and scored

### Requirement: Running score by length
Accepted words SHALL be scored using the `scoreByLength` table in
`src/balance.json`, whose keys are minimum word lengths (the largest key,
8, meaning "8 or more"). The running total SHALL be shown during the round.

#### Scenario: Score by length brackets
- **WHEN** words of length 3, 5, and 8 are accepted
- **THEN** they score 1, 2, and 11 points respectively per the table
- **AND** the running total reflects the sum of accepted words

### Requirement: Found-words list
Accepted words SHALL appear in a found-words list shown alongside or below the
grid.

#### Scenario: Accepted word is listed
- **WHEN** a word is accepted
- **THEN** it appears in the found-words list

### Requirement: End-of-round results
When the timer reaches zero the system SHALL lock input and show a results
screen containing the final score, every found word with its point value, and
the total number of words that existed on the board (from `solveBoard`).

#### Scenario: Timer reaches zero
- **WHEN** the remaining time reaches zero
- **THEN** the board can no longer be traced
- **AND** a results screen shows the final score, found words with points, and the total findable word count

### Requirement: Play again
From the results screen a Play Again action SHALL generate a fresh board and
reset the round.

#### Scenario: Play again resets
- **WHEN** the player chooses Play Again
- **THEN** a new board is generated and the score, found list, and timer are reset for a new round
