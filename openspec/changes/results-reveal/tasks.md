## 1. Pure logic + data

- [x] 1.1 `core/round/results.ts`: `sortWords` (longest-first, alpha ties), `longestWords`, `missedWords`.
- [x] 1.2 balance.json: `minTotalWords` (30), `missedWordsDisplayCap` (100).
- [x] 1.3 `generate.ts`: `targetsForSize` adds a min-words target; export `boardMeetsTargets`; enforce via early-exit search only.
- [x] 1.4 `runSolve`/worker/`solveAsync` return `entries` (word→path).

## 2. Tests

- [x] 2.1 Found sort longest-first/alpha; missed excludes found + same sort; cap limits list and "showing X of Y".
- [x] 2.2 Longest reveal returns all tied words.
- [x] 2.3 Generation rejects a hand board with <30 words.
- [x] 2.4 Solve entries give valid paths (adjacent, no reuse) for tap-to-highlight.
- [x] 2.5 Reveal buttons disabled until the solve resolves (component test).

## 3. Results screen

- [x] 3.1 Rewrite Results: pinned score summary, sorted found list (word/len/points), compact board.
- [x] 3.2 Reveal longest / missed buttons (disabled+spinner until ready; hidden on failure; collapse toggles); missed cap + note.
- [x] 3.3 Tap any word → highlight its `solveBoard` path (line as in play); tap again clears; active row marked.
- [x] 3.4 `BoardTrace` display props (`externalPath`, `hideChrome`, `compact`).

## 4. Wiring

- [x] 4.1 Round: async solve on round end (worker), pass board + solve to Results; reset on Play Again.
- [x] 4.2 PeacefulRound: keep and reuse its solve result; pass to Results.

## 5. Verify

- [x] 5.1 `npm test` passes; `openspec validate results-reveal` passes.
- [x] 5.2 In-browser at 375×667: no page scroll, board + summary visible, lists scroll; tap-to-path draws the line; missed cap note; reveals reused in Peaceful; no console errors.
