## ADDED Requirements

### Requirement: Firebase isolated and code-split
All Firebase access SHALL be behind a single module (`src/net/room.ts`) with no
Firebase imports elsewhere; the SDK SHALL be loaded via dynamic import and the
multiplayer UI lazy-loaded, so single-player never downloads Firebase. Game logic
SHALL stay pure and offline-testable. Analytics SHALL NOT be included.

#### Scenario: Single-player bundle has no Firebase
- **WHEN** the app is built
- **THEN** the main bundle contains no Firebase code, and it loads only when a user opens Multiplayer

### Requirement: Rooms, codes, and joins
Room codes SHALL be 5 uppercase letters excluding I, O and Q, checked for
collision before claiming. A room SHALL hold at most 10 players; joins SHALL be
rejected when full and once status is past "lobby", with distinct errors for
not-found / full / started. `onDisconnect()` SHALL mark players disconnected, and
the host leaving SHALL close the room. Boards SHALL never be transmitted — only
the seed — and every client SHALL generate the identical board from it.

#### Scenario: Code excludes confusable letters, retries on collision
- **WHEN** a code is generated
- **THEN** it is 5 letters with no I/O/Q, and generation retries if the code is taken

#### Scenario: Join rejected when full or started
- **WHEN** a player tries to join a full room or one past the lobby
- **THEN** the join is rejected with the matching reason

#### Scenario: Identical boards from a seed
- **WHEN** two clients receive the same seed
- **THEN** each generates the identical board locally

### Requirement: Synced timed rounds
On Start the host SHALL write a fresh seed, a server-timestamped `startAt`, and
status "countdown". Every client SHALL correct for clock skew using
`.info/serverTimeOffset` so the 3-second countdown and the round timer end at the
same real moment. The board SHALL be hidden until the countdown ends. During the
round no scores or words SHALL be shared — only the count of players still
playing — and words SHALL be held locally.

#### Scenario: Everyone ends together
- **WHEN** clients share the same server-stamped startAt
- **THEN** they compute the same phase and remaining time from the corrected clock

### Requirement: Multiplayer scoring and results
At round end each client SHALL write its full word list and raw score, then wait
for all connected players to submit with a 15-second grace period (absent players
scored on whatever they submitted, or zero). Scoring SHALL be computed
identically on every client from the complete results set: base linear points per
word, DOUBLE for a word found by exactly one player, base for words found by two
or more. Results SHALL show a leaderboard by final score, then the player's own
words longest-first with points and a clear marker on 2× words, plus the existing
reveal options. Multiplayer SHALL NOT write solo high scores; achievements SHALL
still unlock. The host SHALL be able to reseed and replay with the same room.

#### Scenario: Unique-word bonus
- **WHEN** a word is found by exactly one player
- **THEN** that player scores double its base points; words found by two or more score base for each

#### Scenario: No solo high score written
- **WHEN** a multiplayer round ends
- **THEN** no solo high-score record is written, but achievements may unlock
