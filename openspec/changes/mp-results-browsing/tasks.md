## 1. Reveal logic (pure)

- [x] 1.1 `longestReveal(boardWords, players)` → `{ board, found, collapsed }` with finder attribution and ties.
- [x] 1.2 `othersFound(players, myId)` → set of words found by everyone except me.
- [x] 1.3 Tests: one/several/no finders of board longest; collapse fires/doesn't; ties both entries; othersFound union; another player's list sort + 2× markers; tap-path validity.

## 2. Results UI

- [x] 2.1 Tappable leaderboard rows (chevron) → full-screen player detail view (name, score, sorted word list, per-word points + 2× markers).
- [x] 2.2 Tap a word → highlight its board path; tap again clears. Own row opens same view.
- [x] 2.3 Reveal-longest renders collapsed entry or two labeled entries with finder names / "Nobody found this."
- [x] 2.4 Missed-word beaten marker when `othersFound` contains the word.
- [x] 2.5 Component tests: leaderboard tap → detail → back; own 2× words shown.

## 3. Verify

- [x] 3.1 `npm test` passes; single-player longest reveal unchanged; no new Firebase writes.
- [x] 3.2 Two-client live sync not verifiable in this environment (documented).
