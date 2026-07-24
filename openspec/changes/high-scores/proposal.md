## Why

Adds a per-configuration high-scores system with a menu entry point and a
new-personal-best celebration, giving timed rounds a lasting goal.

## What Changes

- **Data**: one record per (board size, timed length) — 4×6 = 24 slots; Peaceful
  is never recorded. Each record stores score, words found, longest word, and
  date. A record is replaced only by a **strictly higher** score. High scores
  extend the existing stats `lifetime` (persisted via the same store); the
  read/write logic is a pure, DOM-free module. Empty slots are empty (shown as a
  dash), not zero.
- **High-scores button + screen**: a button in the menu's top-right (mirrors the
  trophy top-left, ≥44×44). The screen has size tabs and, per size, six length
  rows ("1:00"–"5:00") with score + (words / longest / date) or "Not played yet".
  Fits 375px wide (tabs + rows, no 24-cell table). Remembers the last-viewed size
  tab for the session. Reset-high-scores control (behind a confirm) clears high
  scores only.
- **New personal best**: when a timed round ends with a strictly higher score for
  that exact size+length, a celebratory "NEW PERSONAL BEST" banner shows above
  the score summary (with the previous best, or "First score for this board"),
  animated (reduced-motion aware). The same message also fires the existing toast
  (queued alongside achievement toasts). The record is written before results
  render, but the previous value is read first. Peaceful never shows the banner.

## Capabilities

### New Capabilities

- `high-scores`: Per size+length best-score records, a high-scores screen, and a
  new-personal-best banner/toast.

## Impact

- **balance.json**: none new (uses `sizes` and `roundLengths`).
- **stats**: `LifetimeStats.highScores` + a pure `core/stats/highScores.ts`.
  Context gains `recordHighScore` / `resetHighScores`; the toast queue and
  component generalise to personal-best items. New menu button + screen; Results
  gains the banner.
