## 1. Balance data

- [x] 1.1 Add `maxWordLength` (16) to `src/balance.json` so dictionary length bounds have no magic numbers.

## 2. Dictionary asset

- [x] 2.1 Bundle the ENABLE word list at `src/core/dictionary/enable.txt`, filtered to `minWordLength`–`maxWordLength` letters.

## 3. Trie + dictionary module

- [x] 3.1 Implement a trie (`src/core/dictionary/trie.ts`): insert, `has(word)` (complete word), `node(prefix)` / prefix test.
- [x] 3.2 Implement `src/core/dictionary/dictionary.ts`: load `enable.txt` via `?raw`, compile the trie once (lazy), expose `isValidWord(word)` (case-insensitive, respects `minWordLength`) and access to the trie for the solver.
- [x] 3.3 Keep dictionary pure and DOM-free.

## 4. Solver

- [x] 4.1 Implement `solveBoard(board)` in `src/core/dictionary/solver.ts`: DFS from each cell, trie prefix pruning, no cell reuse, `"Qu"` contributes "qu".
- [x] 4.2 Return each valid word once with one example path (cell-index list); only words ≥ `minWordLength`.

## 5. Tests

- [x] 5.1 `dictionary.test.ts`: `isValidWord` accepts known words (any case), rejects non-words and too-short words; prefix queries behave.
- [x] 5.2 `solver.test.ts`: hand-verified small board returns the expected words with valid adjacent, non-repeating paths.
- [x] 5.3 `solver.test.ts`: every word `solveBoard` returns is accepted by `isValidWord` (across several random boards).

## 6. Demo + verify

- [x] 6.1 Add a dev script that solves 10 boards and prints board letters, total word count, longest 5 words, and count of 3-letter words.
- [x] 6.2 `npm test` passes; `openspec validate dictionary-and-solver` passes.
