## Why

Adds long-term goals and replay motivation: an achievements system with a pure,
tunable, unit-tested evaluation core, non-blocking unlock toasts, a trophy button
on the menu, and an achievements screen (plus a "more by this creator" section).

## What Changes

- **Stats core** (pure, DOM-free): tracks lifetime counters (total accepted
  words, sizes played, lengths played, unlock state + date) and per-round
  counters, persisted to localStorage. `evaluate(stats, event)` is a pure
  function over the three events (word accepted, word rejected, round ended) —
  time-derived values arrive on the event, so it is fully unit-testable.
  Achievements unlock in every mode, including Peaceful. A round counts as played
  once started and finished (timer expiry, End Round, or a Peaceful win).
- **18 achievements** defined in a data module, with all thresholds pulled from
  `balance.json`.
- **Unlock toasts**: a small non-blocking toast (trophy + name) that never
  obscures the grid or eats input; multiple unlocks queue and show one at a time;
  respects `prefers-reduced-motion`.
- **Trophy button** (top-left of the menu, ≥44×44) with an "unlocked/total"
  badge, opening an **achievements screen** with Back. Unlocked entries show the
  trophy, name, description, and unlock date. Locked entries show a lock icon and
  the name **and description** (how to unlock). The five Word Collector milestones
  show progress (e.g. "247 / 300") whether locked or unlocked. A "Reset
  achievements" control behind a confirm dialog.
- **More by this creator**: two link rows (⚡ Wordventure, 🐍 Snake), opening in a
  new tab with `rel="noopener noreferrer"`, ≥44px tall.

## Capabilities

### New Capabilities

- `achievements`: A pure stats/evaluation core, 18 tunable achievements, unlock
  toasts, and an achievements screen with a trophy entry point.

## Impact

- **balance.json**: `achievements` thresholds block.
- **New code**: `core/stats/` (stats + defs), `isStraightLine` in the path
  module, an achievements context (toast queue), and menu/screen/toast/trophy
  components. `BoardTrace.onWord` now passes the path; `useGamePlay.submit`
  returns points.
- **Note:** locked achievements show their description (updated from an initial
  "name only" design at the creator's request).
