## Why

BUG: after a timed round ended, the "Reveal longest/missed" buttons stayed stuck
in the loading state forever — the solve result never arrived.

## Root cause (diagnosed with staged logging, confirmed at 4×4 and 7×7)

The worker received the request, solved fast (4×4: 63 words/281ms; 7×7: 524
words/274ms — proving the DFS prunes on trie prefix and terminates), and posted
back; `solveBoardAsync` received the message. The result was then **dropped in
`Round`'s solve effect**: that effect listed `solve.status` in its dependency
array *and* called `setSolve('solving')` inside itself. Writing that state
re-ran the effect, whose cleanup set `cancelled = true`; when the (successful)
result arrived, `if (!cancelled)` was false, so it was discarded — leaving the
spinner forever. The failure was identical at both sizes; the Peaceful path was
unaffected because its effect depends on `[board]`, not the solve state.

## What Changes

- Extract the solve into a `useBoardSolve(board, enabled)` hook whose effect
  depends only on `[board, enabled]` (never the state it writes), so it no longer
  self-cancels. Round and PeacefulRound both use it.
- **Safety net**: `solveTimeoutMs` (balance.json, default 30000). If no result
  arrives in time, the state becomes `failed`, the spinner stops, and the results
  screen shows "Couldn't load the full word list" with the reveal buttons hidden.
- Attach both `error` and `messageerror` handlers to the worker; either falls
  back to the main thread.

## Capabilities

### New Capabilities

- `results-solve-reliability`: The results solve always resolves to ready or
  failed — never stuck loading — via a non-self-cancelling hook and a timeout.

## Impact

- New `useBoardSolve` hook (owns `SolveState`); Round/Peaceful refactored onto
  it. `solveTimeoutMs` added to balance.json. `messageerror` handler added to
  `solveAsync`.
