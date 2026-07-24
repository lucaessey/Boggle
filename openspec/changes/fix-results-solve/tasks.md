## 1. Diagnose

- [x] 1.1 Add staged logging (request/worker/message/component) + node counter; test 4×4 and 7×7; identify the stage that drops the result.
- [x] 1.2 Confirm root cause: `Round` solve effect self-cancels (deps include `solve.status`; cleanup sets `cancelled` before the result lands).

## 2. Fix

- [x] 2.1 `useBoardSolve(board, enabled)` hook — effect deps `[board, enabled]` only; owns `SolveState`.
- [x] 2.2 Round and PeacefulRound use the hook (Peaceful still reuses its solve for results).
- [x] 2.3 `solveTimeoutMs` (balance.json) safety net → `failed`; Results shows "Couldn't load the full word list" and hides reveals.
- [x] 2.4 Worker `error` + `messageerror` handlers fall back to the main thread.
- [x] 2.5 Remove all temporary diagnostic logging.

## 3. Test

- [x] 3.1 The hook reaches a resolved state for every board size (never stuck loading).
- [x] 3.2 The timeout produces `failed` instead of spinning forever.
- [x] 3.3 `npm test` passes; verified in-browser that a timed round now enables the reveal buttons.
