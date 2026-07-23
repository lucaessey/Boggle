# board-solver Specification

## Purpose
TBD - created by archiving change dictionary-and-solver. Update Purpose after archive.
## Requirements
### Requirement: Solve a board for all valid words
`solveBoard(board)` SHALL return every valid dictionary word findable on the
board, each with one example path. A path is an ordered list of cell indices.
Search SHALL use depth-first traversal with trie prefix pruning and MUST NOT
reuse a cell within a single word's path. Only words of at least `minWordLength`
letters SHALL be returned.

#### Scenario: Returns findable words with a path
- **WHEN** `solveBoard` is called on a board
- **THEN** it returns each findable valid word exactly once
- **AND** each returned word has an example path of cell indices that spells it via adjacent, non-repeated cells

#### Scenario: No cell reuse
- **WHEN** a candidate word would require visiting the same cell twice
- **THEN** that path is not used

#### Scenario: Only real words
- **WHEN** `solveBoard` returns a set of words
- **THEN** every returned word is accepted by `isValidWord`

### Requirement: Qu tile contributes two letters
A tile showing the `"Qu"` face SHALL contribute both letters `q` and `u`, in
order, to the word string formed along a path.

#### Scenario: Qu spans two letters
- **WHEN** a path steps onto a `"Qu"` tile
- **THEN** the formed word gains the substring "qu" at that step
- **AND** trie pruning is applied across both letters

