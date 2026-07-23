## ADDED Requirements

### Requirement: 5x5 Big Boggle size
The game SHALL offer a 5×5 board, positioned between 4×4 and 6×6 in the size
menu, generated from the official 25-die Big Boggle set in `balance.json` with
`Qu` a single face. It SHALL have its own `tileHitRadiusPx` and quality targets:
at least one word of 5+ letters, at least one of 6+, and at least 2 distinct
words of 5+.

#### Scenario: 5x5 generation
- **WHEN** a 5×5 board is generated
- **THEN** it has 25 cells, each of the 25 dice is used exactly once, and it meets its quality targets

#### Scenario: 5x5 adjacency
- **WHEN** neighbours are requested on a 5×5 board for a corner, a non-corner edge, and the centre
- **THEN** they return 3, 5, and 8 neighbours respectively

#### Scenario: Four size buttons
- **WHEN** the size menu is shown
- **THEN** it offers 4×4, 5×5, 6×6, and 7×7, all tappable on a 375px-wide viewport
