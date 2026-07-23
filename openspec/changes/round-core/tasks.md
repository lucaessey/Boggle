## 1. Reuse check (dictionary & solver)

- [x] 1.1 Confirm the existing `dictionary-and-solver` capability satisfies requirements 1-4 (ENABLE trie, `isValidWord`, `solveBoard` DFS+pruning+no-reuse, tests) — reuse, do not re-implement.

## 2. Pure round logic

- [x] 2.1 `src/core/round/scoring.ts` — `scoreForWord(word)` using `scoreByLength` (keys are minimum lengths; 8 = "8 or more"; below `minWordLength` scores 0).
- [x] 2.2 `src/core/round/round.ts` — `classifySubmission(word, found, deps)` returning `too-short | not-a-word | already-found | accepted`, checked in that order; pure (dictionary injected via deps).
- [x] 2.3 Keep the round module pure and DOM-free.

## 3. Tests

- [x] 3.1 `scoring.test.ts` — length brackets 3-8+, sub-minimum = 0, "Qu" word counts both letters.
- [x] 3.2 `round.test.ts` — `classifySubmission` returns each outcome and respects the priority order (too-short before not-a-word, etc.), using an injected fake dictionary.

## 4. Round UI

- [x] 4.1 Adapt `BoardTrace`: submit the traced word via an `onWord` callback on release; add a `disabled` prop that ignores pointer input when the round is not running.
- [x] 4.2 Round component: Start button + countdown of `roundSeconds`; running score; feedback (colour + message) per submission outcome; found-words list with points.
- [x] 4.3 On timer zero: lock input and show results (final score, found words with points, total words on board from `solveBoard`).
- [x] 4.4 Play Again: fresh board + reset.

## 5. Diagnostic + verify

- [x] 5.1 Run the existing 10-board `solve:demo` diagnostic and confirm output (board letters, total words, longest 5, 3-letter count).
- [x] 5.2 `npm test` passes; `openspec validate round-core` passes; round plays correctly at localhost with no console errors.
