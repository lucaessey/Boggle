## Why

A word game needs to know which words are real and which words a given board
can actually produce. This change adds the dictionary (fast validity lookup) and
the board solver (every findable word plus an example path). Both are pure,
DOM-free modules the round logic and scoring will build on.

## What Changes

- Bundle the **ENABLE** word list (public domain, ~172.8k words), filtered to
  words of `minWordLength`–`maxWordLength` letters (3–16). It is compiled into a
  **trie on first load**.
- Add `isValidWord(word)` — a fast, case-insensitive lookup against the full
  filtered list.
- Add `solveBoard(board)` — returns every valid word findable on the board with
  one example path, using **DFS with trie prefix pruning** and **no cell reuse**.
  A `"Qu"` tile contributes **both** letters (`q` then `u`) to the path string.
- Add unit tests: a hand-verified small board, and a property test that every
  word `solveBoard` returns is accepted by `isValidWord`.
- Add a dev script that solves 10 boards and prints board letters, total word
  count, longest 5 words, and count of 3-letter words.

No breaking changes — net-new modules consumed by later changes.

## Capabilities

### New Capabilities

- `dictionary`: Bundled ENABLE word list (filtered 3–16 letters) compiled into a
  trie, exposing `isValidWord` and prefix queries for the solver.
- `board-solver`: `solveBoard(board)` enumerating all findable valid words with
  one example path each, via DFS + trie prefix pruning and no cell reuse.

### Modified Capabilities

<!-- None. -->

## Impact

- **New code:** `src/core/dictionary/` — the ENABLE asset (`enable.txt`), a trie,
  a dictionary module, and the solver. All pure and DOM-free.
- **`src/balance.json`:** add `maxWordLength` (16) so the dictionary length
  filter has no magic numbers (`minWordLength` already present).
- **Asset size:** ~1.7 MB text list, loaded via Vite `?raw` and compiled to a
  trie once at first use.
- **Downstream:** unblocks `round-core` (scoring valid words) and `pass-and-play`.
