## Why

The game only supports drag input and hasn't been hardened for real phones.
This change adds physical-keyboard typing as a coequal input method for desktop,
and makes touch, layout, and feedback properly mobile-friendly so the game plays
well on an actual device.

## What Changes

- **Keyboard input** (desktop), coexisting with drag — one shared current-word
  state, neither method replaces the other:
  - Window `keydown` (no focused `<input>`, which would pop the mobile keyboard).
    Letters append, Backspace deletes, Enter submits, Escape clears; non-letters
    and keystrokes outside an active round are ignored.
  - `Qu` tiles: the player types Q then U; path-matching treats a Qu tile as
    consuming both letters.
  - New `hasPath(board, word)` in the solver: first valid path or null, DFS with
    the same adjacency/no-reuse rules as drag, early-exit on the first path.
  - As the player types, the first matching path is highlighted live (tiles +
    connecting line, same as drag); an unmatched word shows a distinct "no path"
    style.
  - Mode switching clears the other method's in-progress input.
  - A small desktop-only hint near the grid.
- **Submission order** now: too short → not a real word → not on this board →
  already found → accepted, each with distinct feedback.
- **Touch**: `touch-action: none` and `overscroll-behavior: contain` on the grid;
  `user-select: none` (+ `-webkit-`) and `-webkit-tap-highlight-color:
  transparent` on tiles; `pointercancel` clears without submitting; pointer
  capture on the grid.
- **Layout**: `viewport-fit=cover`; double-tap-zoom disabled on controls; grid +
  timer + word + score fit a 375×667 viewport at all three sizes; safe-area
  insets respected; ≥44×44 touch targets; portrait and landscape supported.
- **Feedback**: haptics via `navigator.vibrate` on tile selection and word
  acceptance, guarded and toggleable in `balance.json`.

## Capabilities

### New Capabilities

- `keyboard-input`: Type-to-enter words with live board-path matching
  (`hasPath`), coexisting with drag under one current-word state.
- `mobile-ux`: Touch handling, safe-area/fit layout across sizes and
  orientations, and toggleable haptic feedback.

### Modified Capabilities

<!-- round-core submission gains the not-on-board outcome; its spec is not yet
     promoted to openspec/specs, so no delta is written here. -->

## Impact

- **New code**: `hasPath` in the solver; `haptics.ts`; a rewritten unified-input
  `BoardTrace`.
- **`balance.json`**: added `haptics` config.
- **Config**: `dev:host` script + launch config for LAN access during device
  testing.
