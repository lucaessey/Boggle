## ADDED Requirements

### Requirement: Bundled ENABLE word list
The dictionary SHALL bundle the ENABLE word list, filtered to words whose length
is between `minWordLength` and `maxWordLength` (inclusive) as defined in
`src/balance.json`. The list SHALL be compiled into a trie at build time or on
first load. Length bounds MUST come from `balance.json`, not hard-coded.

#### Scenario: List is filtered by length
- **WHEN** the dictionary is loaded
- **THEN** it contains only words of length `minWordLength` through `maxWordLength`
- **AND** it excludes shorter and longer words

#### Scenario: Compiled once
- **WHEN** the dictionary is used repeatedly
- **THEN** the trie is compiled a single time and reused for subsequent lookups

### Requirement: Word validity lookup
The dictionary SHALL expose `isValidWord(word)` returning whether the word is in
the bundled list. Lookup SHALL be case-insensitive and fast (trie traversal).

#### Scenario: Known word accepted
- **WHEN** `isValidWord` is called with a word present in the filtered ENABLE list
- **THEN** it returns `true`, regardless of the input's letter case

#### Scenario: Unknown or out-of-range word rejected
- **WHEN** `isValidWord` is called with a non-word, or a word shorter than `minWordLength`
- **THEN** it returns `false`

### Requirement: Prefix queries for pruning
The dictionary SHALL expose a way to test whether a string is a prefix of any
word, so the solver can prune dead search branches.

#### Scenario: Live prefix
- **WHEN** the solver asks whether "ca" is a prefix
- **THEN** the dictionary reports it is a live prefix (words like "cat" exist)

#### Scenario: Dead prefix
- **WHEN** the solver asks whether "qz" is a prefix
- **THEN** the dictionary reports it is not a prefix of any word
