## 1. Pure logic (DOM-free, tested)

- [x] 1.1 `core/leaderboard/leaderboard.ts`: `boardKey`, `personalBestUpdate` (independent bests), `rankEntries` (desc + cap 50, no padding).
- [x] 1.2 `core/leaderboard/profanity.ts`: `validateName` (trim, ≤12 chars, basic blocklist).
- [x] 1.3 Tests: higher-score-only / higher-words-only / beats-neither; ranking desc + cap 50; fewer-than-50 no padding; key isolation; name validation.

## 2. Net layer (all Firebase access)

- [x] 2.1 Extract shared bootstrap into `net/firebase.ts` (config, `fb`, `ensureAuth`, `currentUid`); `room.ts` re-exports.
- [x] 2.2 `net/leaderboard.ts`: `submitLeaderboardScore` (read → write only improved fields), `fetchLeaderboard` (orderByChild.limitToLast(50)), `removeLeaderboardEntries`.

## 3. Consent + submission

- [x] 3.1 `prefs`: consent load/save; reuse nickname.
- [x] 3.2 `LeaderboardSubmit`: opt-in prompt / silent auto-submit; Firebase dynamically imported only on submit.
- [x] 3.3 `Results` gains a `leaderboard` prop; only the timed `Round` passes it (peaceful/multiplayer never write). Gating test.

## 4. Global view UI

- [x] 4.1 `HighScoresScreen`: My Scores / Global tabs; Global lazy-loaded (code-split).
- [x] 4.2 `GlobalLeaderboard`: size tabs, length dropdown, Points/Words toggle, rows (rank/name/value/date), own-row highlight, loading/error/empty states, opt-in-later + remove-me.
- [x] 4.3 Fits a 375px viewport with no horizontal overflow.

## 5. Verify

- [x] 5.1 `npm test` (198 pass); build code-splits Firebase (main bundle: 0 Firebase refs).
- [x] 5.2 Live: read (empty state), write independent bests (30/7 → 20/12 → unchanged; read back 30 & 12), key isolation (5x180 untouched), remove-me, 375px layout — all confirmed against the real database.
