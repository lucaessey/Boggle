## 1. Pure logic (Firebase-free, tested)

- [x] 1.1 `core/round/multiplayerScoring.ts` — base linear points, ×2 for unique words, base for shared; leaderboard.
- [x] 1.2 `net/roomCode.ts` — 5-letter codes excluding I/O/Q; collision-retry allocator.
- [x] 1.3 `net/roomTypes.ts` — room model + `joinability` (max 10, past-lobby) + connected players.
- [x] 1.4 `net/roundTiming.ts` — phase + remaining from server-corrected clock.

## 2. Tests

- [x] 2.1 Scoring: one player doubles; two get base; mixed set correct for all.
- [x] 2.2 Codes exclude I/O/Q and retry on collision.
- [x] 2.3 Join rejected at 10 players and past lobby; rejoin allowed.
- [x] 2.4 Same seed → identical boards across separately constructed clients.
- [x] 2.5 Synced timing agrees across clients with the same server time.

## 3. Firebase module (net/room.ts)

- [x] 3.1 Dynamic-import init + anonymous auth (uid = player id); config inline, no Analytics.
- [x] 3.2 createRoom (allocate code, host player, onDisconnect), joinRoom (validate + write), subscribeRoom, subscribeServerOffset.
- [x] 3.3 updateSettings, startRound (seed + ServerValue.TIMESTAMP + countdown + clear results), submitResults, leaveRoom (host closes room), onDisconnect connected=false.

## 4. UI (lazy-loaded)

- [x] 4.1 Menu "Multiplayer" entry; nickname (localStorage) + Create/Join with distinct errors.
- [x] 4.2 Lobby: big copyable code, live player list, host size/length (no Peaceful), read-only for non-hosts, host-only Start ≥2, host-leave closes room.
- [x] 4.3 MultiplayerRound: synced countdown/timer, board hidden until go, players-still-playing count, local words, submit + 15s grace, leaderboard + own words (2× marked) + reveal options + host Play Again.
- [x] 4.4 Achievements unlock in multiplayer; no solo high-score write.

## 5. Deploy + verify

- [x] 5.1 `npm test` passes; build works for GitHub Pages; main bundle has zero Firebase (verified); firebase in its own chunk.
- [x] 5.2 Live (single client): anonymous auth, create room, lobby, host settings change, leave — all work against the real project.
- [ ] 5.3 REQUIRES USER: set Realtime Database security rules + verify two-client sync (join, synced countdown, results aggregation) on two devices.
