## 1. Data + pure logic

- [x] 1.1 `LifetimeStats.highScores` in stats.ts; store loads/defaults it.
- [x] 1.2 `core/stats/highScores.ts`: `highScoreKey`, `getHighScore`, `considerHighScore` (strictly-higher, reads previous first). Pure.

## 2. Tests

- [x] 2.1 Higher replaces; equal/lower does not; keyed correctly (no cross-slot overwrite).
- [x] 2.2 Reads previous best before writing; empty slot → unplayed.
- [x] 2.3 Reset clears high scores only (achievements/stats intact); localStorage round-trip.

## 3. Feedback

- [x] 3.1 Context `recordHighScore` (write after reading previous) + `resetHighScores`; toast queue + component generalised to personal-best items.
- [x] 3.2 Round records the score on round end and passes new-best + previous to Results; Results renders the animated banner (reduced-motion aware); Peaceful never.

## 4. Screen

- [x] 4.1 Top-right high-scores button (mirrors trophy, ≥44×44); App view + Menu wiring.
- [x] 4.2 Screen: size tabs + six length rows (score / words·longest·date or dash·"Not played yet"); fits 375px; remembers last size; reset behind a confirm.

## 5. Verify

- [x] 5.1 `npm test` passes; `openspec validate` passes.
- [x] 5.2 In-browser: both menu buttons; empty slots as dash; first-score banner + toast; higher-score "Previous best"; lower-score no banner; Peaceful no banner/record; no console errors.
