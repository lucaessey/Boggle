## Why

Adds visual polish: per-screen background images with a readability scrim, and
subtle 3D beveled tiles that press in when traced — without hurting the 7×7 drag
performance path.

## What Changes

- **Backgrounds** (imported as Vite assets, base-safe for Pages):
  `background_1.jpg` (500×350, 8.6 KB) on the multiplayer lobby and the
  round-length selector; `background_2.avif` (360×360, 3.6 KB) everywhere else.
  Rendered as a fixed full-height layer with `background-size: cover`, centered,
  no repeat — NOT `background-attachment: fixed` (janks on iOS). Both preloaded.
  A semi-transparent scrim sits between image and content with a tunable
  `--scrim-opacity` variable (theme-aware light/dark).
- **3D tiles** (box-shadow only — no filter/backdrop-filter/3D transforms): a
  soft outer drop shadow plus an inset bevel (light top-left, dark bottom-right).
  On selection a tile presses in: `translateY(2px)`, the outer shadow shrinks,
  and the bevel flips (light to bottom-right). ~80ms transition; `will-change:
  transform` only on path tiles; `prefers-reduced-motion` keeps the static bevel
  and drops the animation. The press is transform + shadow only (no layout), and
  hit-testing is unaffected because tile centers are measured at pointerdown
  (before any press).

## Capabilities

### New Capabilities

- `screen-styling`: Per-screen backgrounds with a tunable scrim and physical
  beveled tiles with a press-in interaction.

## Impact

- New `src/assets/background_{1,2}` (moved from repo root); `Background` provider
  + `useScreenBackground` hook wired into App/Menu/Lobby. Tile CSS in
  BoardTrace.css. No JS/behaviour change to tracing.
