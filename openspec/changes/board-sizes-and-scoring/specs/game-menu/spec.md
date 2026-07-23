## ADDED Requirements

### Requirement: Size and length selection flow
The game SHALL present a menu to choose a board size (4×4, 6×6, 7×7) and then a
round length from the `roundLengths` array in `balance.json` (rendered from the
array, not hardcoded). A Back control at each step SHALL return to the previous
choice. After both choices the game SHALL start.

#### Scenario: Choose size then length then play
- **WHEN** the player picks a size and then a length
- **THEN** a round starts at that size and length

#### Scenario: Back returns to the previous step
- **WHEN** the player is choosing a length and activates Back
- **THEN** they return to the size-selection step

### Requirement: Remembered preferences
The last-used size and length SHALL be saved to `localStorage` and preselected on
the next visit.

#### Scenario: Preferences restored
- **WHEN** the player returns after a previous round
- **THEN** the menu preselects their last-used size and length

### Requirement: Results navigation
The end-of-round results screen SHALL offer Play Again (same size and length, new
board) and Change Settings (return to the menu).

#### Scenario: Play Again keeps settings
- **WHEN** the player chooses Play Again
- **THEN** a new board of the same size is generated and a new round starts at the same length

#### Scenario: Change Settings returns to the menu
- **WHEN** the player chooses Change Settings
- **THEN** the size/length menu is shown
