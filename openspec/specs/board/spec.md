# board Specification

## Purpose
TBD - created by archiving change board-and-dice. Update Purpose after archive.
## Requirements
### Requirement: Board generation from official dice
The board module SHALL generate a `gridSize`×`gridSize` board (16 cells for the
default 4×4) using the official 16-die classic Boggle letter distributions. Each
of the 16 dice SHALL be placed on exactly one cell, and exactly one face of each
die SHALL be shown on its cell. The `"Qu"` face SHALL be represented as a single
tile face and never split into separate `Q` and `u` tiles.

#### Scenario: Every die used exactly once
- **WHEN** a board is generated
- **THEN** the board has 16 cells
- **AND** each of the 16 dice contributes exactly one face, so every die is used exactly once

#### Scenario: Qu is a single face
- **WHEN** a die whose faces include `"Qu"` shows that face on its cell
- **THEN** the cell's letter value is the single string `"Qu"`, not `"Q"` followed by a separate `"U"`

### Requirement: Dice definitions live in balance.json
The 16 dice definitions SHALL be read from `src/balance.json` rather than being
hard-coded in the board module. The board dimensions SHALL be derived from the
`gridSize` value in `src/balance.json`.

#### Scenario: Dice sourced from balance.json
- **WHEN** the board module generates a board
- **THEN** it reads the 16 dice (each with 6 faces) from `src/balance.json`
- **AND** it does not contain a hard-coded dice list

### Requirement: Seeded determinism
Board generation SHALL accept an optional seed. Given the same seed, generation
SHALL always produce an identical board — both the assignment of dice to cells
and the face chosen on each die MUST be driven by the seeded RNG. When no seed
is provided, generation MAY produce a random board.

#### Scenario: Same seed produces identical boards
- **WHEN** `generateBoard(seed)` is called twice with the same seed value
- **THEN** the two boards are identical in both dice-to-cell assignment and the face shown on each cell

#### Scenario: Different seeds produce different boards
- **WHEN** `generateBoard` is called with two different seed values
- **THEN** the two resulting boards differ

### Requirement: Cell adjacency
The board model SHALL expose an adjacency function that, given a cell index,
returns the indices of that cell's orthogonal and diagonal neighbours (up to 8).

#### Scenario: Corner cell has three neighbours
- **WHEN** the adjacency function is called with a corner cell index on a 4×4 board
- **THEN** it returns exactly 3 neighbour indices

#### Scenario: Edge cell has five neighbours
- **WHEN** the adjacency function is called with a non-corner edge cell index on a 4×4 board
- **THEN** it returns exactly 5 neighbour indices

#### Scenario: Centre cell has eight neighbours
- **WHEN** the adjacency function is called with an interior cell index on a 4×4 board
- **THEN** it returns exactly 8 neighbour indices

### Requirement: Pure, DOM-free module
The board capability SHALL be delivered as a pure, DOM-free module with no
dependency on React, `window`, or `document`, so it can be unit-tested in
isolation.

#### Scenario: No DOM dependencies
- **WHEN** the board module is imported in a non-DOM (node) test environment
- **THEN** it loads and generates boards without referencing any browser or React API

