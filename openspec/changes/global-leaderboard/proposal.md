## Why

High scores were device-local only. Players want to compare against everyone on
the same board. The existing Firebase Realtime Database can back a public
leaderboard cheaply, reusing the shared anonymous-auth bootstrap.

## What Changes

- **24 leaderboards**, one per (board size 4/5/6/7 × round length
  60/90/120/180/240/300s), each with two rankings: highest **points** and most
  **words**. **Solo timed rounds only** — peaceful and multiplayer never write
  (enforced by a prop only the timed `Round` passes to the shared `Results`).
- **Data model** `/leaderboards/{size}x{seconds}/{uid} = { name, score, words,
  updatedAt }`. `score` and `words` are **independent personal bests** — a round
  that beats one but not the other updates only that one; a round that beats
  neither writes nothing. Reads use `orderByChild(metric).limitToLast(50)`
  (rules declare `.indexOn` for both), reversed and capped client-side.
- **Consent**: submitting is opt-in. The first qualifying solo timed round shows
  a results-screen prompt (explains public visibility, asks a ≤12-char display
  name, Submit / No thanks). The choice is remembered in localStorage; a decline
  never re-prompts. The multiplayer nickname is reused as the default name but
  consent is still asked once. A basic profanity filter rejects bad names. A
  "Remove me from the leaderboard" control deletes the player's entries.
- **UI**: the high-scores screen gains **My Scores** / **Global** tabs. Global
  shows board-size tabs, a round-length dropdown (chosen over a third tab row so
  it fits a 375px viewport), and a Points/Words toggle. Rows show rank, name,
  value, and date; the player's own row is highlighted. Up to 50 real entries —
  never padded — with distinct loading, error, and empty states.
- **Code structure**: all Firebase access stays in `net/` (`net/firebase` shared
  bootstrap, `net/leaderboard`); ranking/merge/name logic is pure and tested in
  `core/leaderboard/`; the Global view and Firebase load only when the Global
  tab is opened (verified: main bundle has zero Firebase references).

## Capabilities

### New Capabilities

- `global-leaderboard`: Public per-board leaderboards with opt-in submission,
  independent personal bests, and a browsable Global view.

## Impact

- New `core/leaderboard/{leaderboard,profanity}.ts` (+ tests), `net/firebase.ts`
  (extracted from `room.ts`), `net/leaderboard.ts`, `components/leaderboard/*`.
  `Results`/`Round` gain a leaderboard prop; `HighScoresScreen` gains tabs;
  `prefs` gains consent storage.
- **Deploy note**: requires DB rules for `/leaderboards` allowing per-uid writes
  and `.indexOn: ["score","words"]` per board (already configured).
