## Why

Adds real-time online multiplayer (create/join a room, play the same board,
compete on score) using Firebase Realtime Database, while keeping the app a
static GitHub Pages site and the game logic pure and offline-testable.

## What Changes

- **Firebase behind one module** (`src/net/room.ts`): anonymous auth (uid = player
  id), rooms, settings, seed, results. The SDK is loaded via dynamic `import()`
  and the whole multiplayer UI is `React.lazy` — single-player never downloads
  Firebase. No Firebase imports anywhere else. No Analytics.
- **Data model** `/rooms/{CODE}`: hostId, createdAt, status, settings {size,
  seconds}, seed, startAt, players/{uid}, results/{uid}. Codes are 5 uppercase
  letters excluding I/O/Q, collision-checked. Max 10 players; joins rejected when
  full or past lobby. `onDisconnect()` marks players disconnected; the host's
  onDisconnect closes the room. **Boards are never transmitted — only the seed;**
  every client regenerates the identical board.
- **Menu flow**: Multiplayer → nickname (remembered) → Create / Join (5-char
  code, auto-uppercased) with distinct not-found / full / started errors.
- **Lobby**: big copyable code + live player list; host picks size/length (no
  Peaceful — timed only), non-hosts see them read-only, live; host-only Start at
  ≥2 players; host leaving closes the room.
- **Sync**: on Start the host writes a fresh seed + `ServerValue.TIMESTAMP`
  startAt + status countdown; every client corrects with `.info/serverTimeOffset`
  so the countdown and timer end at the same real moment.
- **During**: no scores/words shared; only the count of players still playing;
  words held locally.
- **Results**: each client writes its word list + raw score; wait for all
  connected players (15s grace); score identically on every client — base linear
  points, **×2 for a word only you found**, base for shared words. Leaderboard +
  your words (2× marked) + the existing reveal options. Host "Play again" reseeds.
- **Interactions**: multiplayer never writes solo high scores; achievements still
  unlock.

## Capabilities

### New Capabilities

- `online-multiplayer`: Firebase-backed rooms with synced timed rounds and
  duplicate-cancel-with-unique-bonus scoring, isolated behind one code-split
  module.

## Impact

- New `firebase` dependency (code-split; absent from the single-player bundle).
- New pure, tested modules: `net/roomCode`, `net/roomTypes` (join rules),
  `net/roundTiming`, `core/round/multiplayerScoring`. New `net/room` (Firebase)
  and lazy `components/multiplayer/*` UI. Menu gains a Multiplayer entry.
- **Deploy note**: requires Realtime Database **security rules** (see tasks) and
  Anonymous auth enabled — both live-verified working for auth + room create.
