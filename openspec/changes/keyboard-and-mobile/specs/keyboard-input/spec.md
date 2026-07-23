## ADDED Requirements

### Requirement: Type-to-enter coexisting with drag
The game SHALL accept typed input via window `keydown` (not a focused input
element) as a second method that coexists with drag. Letter keys append to the
current word, Backspace removes the last letter, Enter submits, and Escape
clears. Non-letter keys and any keystrokes outside an active round SHALL be
ignored. There SHALL be a single current-word state: typing while a drag is in
progress clears the drag and starts a typed word, and starting a drag clears a
typed word.

#### Scenario: Typing builds and submits a word
- **WHEN** the player types letters during an active round and presses Enter
- **THEN** the typed word is submitted

#### Scenario: Keystrokes ignored outside a round
- **WHEN** a key is pressed while no round is active
- **THEN** nothing changes

#### Scenario: Switching methods replaces the input
- **WHEN** a typed word is in progress and the player starts a drag
- **THEN** the typed word is cleared and the drag path becomes the current word

### Requirement: Board path lookup
`hasPath(board, word)` SHALL return the first valid path (ordered cell indices)
that spells the word using 8-way adjacency and no cell reuse, or null if none
exists. It SHALL treat a "Qu" tile as consuming both letters of the typed word
and SHALL early-exit on the first path found.

#### Scenario: Word present on the board
- **WHEN** `hasPath` is asked for a word traceable on the board
- **THEN** it returns a legal, non-repeating adjacent path spelling the word

#### Scenario: Letters present but not connected
- **WHEN** the word's letters exist on the board but cannot be connected without reuse or non-adjacency
- **THEN** `hasPath` returns null

#### Scenario: Qu tile consumes two letters
- **WHEN** the player types Q then U and a Qu tile is on the path
- **THEN** the single Qu tile satisfies both letters

### Requirement: Live typed-path feedback
While typing, the first matching path SHALL be highlighted on the board (tiles
and connecting line, as in drag). When no path matches the typed word, it SHALL
be shown in a distinct "no path" style. On desktop a hint SHALL be shown near
the grid.

#### Scenario: Live highlight
- **WHEN** the typed word currently matches a board path
- **THEN** that path's tiles are highlighted and connected by a line

#### Scenario: No-path styling
- **WHEN** the typed word does not match any board path
- **THEN** the word is shown in the distinct no-path style
