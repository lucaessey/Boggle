## ADDED Requirements

### Requirement: Pointer-based tile hit-testing
The system SHALL select the tile whose centre is within `tileHitRadiusPx` (from
`src/balance.json`) of the pointer position. When several tiles are within the
radius, the nearest centre SHALL win. When none are, no tile is selected. Mouse
and touch SHALL be handled by a single Pointer Events code path.

#### Scenario: Pointer within a tile's radius
- **WHEN** the pointer is within `tileHitRadiusPx` of a tile's centre
- **THEN** that tile is the hit-tested tile

#### Scenario: Pointer outside every tile's radius
- **WHEN** the pointer is farther than `tileHitRadiusPx` from every tile centre
- **THEN** no tile is hit-tested

### Requirement: Path extension rules
The trace SHALL be an ordered list of cell indices with no repeats. Given a
candidate tile, the path SHALL update as follows: an empty path starts at the
candidate; a candidate 8-way adjacent to the last tile and not already in the
path is appended; a candidate equal to the second-to-last tile removes the last
tile (backtrack); any other candidate (non-adjacent, or an already-used tile that
is not the second-to-last) leaves the path unchanged.

#### Scenario: Start the path
- **WHEN** the path is empty and a tile is selected
- **THEN** the path becomes that single tile

#### Scenario: Append an adjacent, unused tile
- **WHEN** the candidate is 8-way adjacent to the last tile and not already in the path
- **THEN** the candidate is appended to the path

#### Scenario: Reject a non-adjacent tile
- **WHEN** the candidate is not 8-way adjacent to the last tile
- **THEN** the path is unchanged

#### Scenario: Backtrack onto the second-to-last tile
- **WHEN** the candidate equals the second-to-last tile in the path
- **THEN** the last tile is removed from the path

#### Scenario: Ignore other used tiles
- **WHEN** the candidate is already in the path but is not the second-to-last tile
- **THEN** the path is unchanged

### Requirement: Visible trace feedback
Selected tiles SHALL be visibly highlighted and a line SHALL connect the tiles of
the path in order. The in-progress word SHALL be shown above the grid while
tracing. On pointer release, the traced word SHALL be shown below the grid and
the path SHALL be cleared.

#### Scenario: In-progress feedback
- **WHEN** tiles are being traced
- **THEN** those tiles are highlighted, connected by a line, and the current word is shown above the grid

#### Scenario: Release finalises the word
- **WHEN** the pointer is released
- **THEN** the traced word is shown below the grid
- **AND** the path is cleared
