## 1. Config, types, pure logic (tested)

- [x] 1.1 balance.json `gameModes` block; `GameModeId` + mode registry (`core/round/modes.ts`); `Board.bonus`.
- [x] 1.2 `core/round/blitz.ts` (initial clock ignores length; +bonus on accept only) + tests.
- [x] 1.3 `core/round/bonusScoring.ts` (double length adjust, triple ×3, order, Qu case) + `scoreForLength` + tests.
- [x] 1.4 `generate.ts` extra targets (Long ≥10 of 5+) + deterministic bonus-tile draw + tests.
- [x] 1.5 High-score key includes mode (Normal = legacy key) + tests; `isLeaderboardEligibleMode` + test.

## 2. Menu + config plumbing

- [x] 2.1 Menu mode step after length/goal; Blitz label + note; greyed in Peaceful; persist last mode.
- [x] 2.2 `GameConfig.gameMode`; App passes it (and keys on it) to Round/PeacefulRound.

## 3. Gameplay wiring

- [x] 3.1 `useGamePlay` takes min length + mode, threads path for bonus scoring, distinct long message.
- [x] 3.2 Round: Blitz clock + pulse, mode board gen, high score per mode, leaderboard gated to Normal.
- [x] 3.3 PeacefulRound: mode board gen, min length, Long goal counts 5+ words.
- [x] 3.4 BoardTrace renders labelled bonus tiles; Results marks bonus words + Long missed filter.

## 4. Multiplayer

- [x] 4.1 `RoomSettings.mode` (optional → Normal); Lobby host picker + guest read-only display.
- [x] 4.2 MultiplayerRound applies mode (board gen + min length); Blitz/Bonus disabled in MP with a note.

## 5. Verify

- [x] 5.1 `npm test` green (231); typecheck + production build clean; Firebase still code-split.
- [x] 5.2 In-browser: mode screen (labels/descs), Peaceful greys Blitz, Bonus badges render, Blitz starts 0:30 (ignores 5:00) and +3s/pulse on an accepted word.
