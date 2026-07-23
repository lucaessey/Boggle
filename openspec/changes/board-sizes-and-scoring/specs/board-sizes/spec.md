## ADDED Requirements

### Requirement: Per-size letter sources
Board generation SHALL support sizes 4×4, 6×6, and 7×7, with all size-specific
config read from `balance.json` under `sizes`. The 4×4 uses the official 16-die
set; the 6×6 uses a 36-cube set (official special cubes substituted with plain
single-letter cubes); the 7×7 draws 49 tiles without replacement from a
frequency-weighted bag. `Qu` SHALL be a single tile face in every source.

#### Scenario: Correct dimensions and tile count
- **WHEN** a board of size N is generated
- **THEN** it has N×N cells (16, 36, or 49)

#### Scenario: 7×7 vowel floor
- **WHEN** a 7×7 board is generated
- **THEN** its number of vowel tiles is at least the configured `vowelMin`

### Requirement: Adjacency at any size
The board SHALL expose adjacency for an N×N grid, returning a cell's up-to-8
orthogonal and diagonal neighbours.

#### Scenario: Neighbour counts at 6×6 and 7×7
- **WHEN** neighbours are requested for a corner, a non-corner edge, and an interior cell
- **THEN** they return 3, 5, and 8 neighbours respectively

### Requirement: Quality-guaranteed generation
Before acceptance a board SHALL satisfy the per-size quality targets in
`balance.json`. Generation SHALL retry with fresh boards until the targets are
met, capped at `maxGenerationAttempts`; if the cap is reached the best board seen
SHALL be accepted and a warning logged. The target checks SHALL use an early-exit
search, not a full solve.

#### Scenario: Generated board meets its targets
- **WHEN** a board is generated for a size whose targets are attainable
- **THEN** the accepted board satisfies every target for that size

#### Scenario: Early-exit search
- **WHEN** `findWordsOfMinLength(board, minLength, count)` is called on a board with more than `count` qualifying words
- **THEN** it returns exactly `count` words and stops early without enumerating all words

### Requirement: Seeded determinism at every size
Given the same seed and size, generation SHALL always produce the same accepted
board, including the reroll sequence.

#### Scenario: Same seed reproduces the board
- **WHEN** generation runs twice with the same size and seed
- **THEN** the two accepted boards are identical
