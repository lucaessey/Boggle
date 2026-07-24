## ADDED Requirements

### Requirement: Pure stats and evaluation core
The system SHALL maintain a pure, DOM-free stats module — the single source of
truth for achievements — persisted to localStorage. It SHALL track lifetime
counters (total accepted words, board sizes played, round lengths played, and
each achievement's unlock state and date) and per-round counters. Achievements
SHALL be evaluated by a pure function of `(stats, event)` for the events word
accepted, word rejected, and round ended, and SHALL unlock in every mode
including Peaceful. A round counts as played once it has been started and then
finished. All achievement thresholds SHALL come from `balance.json`.

#### Scenario: Pure evaluation
- **WHEN** an event is evaluated against the stats
- **THEN** the result (updated stats and newly unlocked ids) depends only on the stats and the event, with no clock or DOM access

#### Scenario: Exact triggers
- **WHEN** an achievement's condition is met exactly
- **THEN** it unlocks; and it does NOT unlock one step short

#### Scenario: Guards
- **WHEN** a round finishes with fewer than the required accepted words
- **THEN** Perfectionist does not unlock; and Mirror Match does not unlock on a palindrome alone

#### Scenario: Persistence and reset
- **WHEN** stats are saved and reloaded
- **THEN** unlocked achievements stay unlocked; and Reset clears all achievement and stat state

### Requirement: Unlock toasts
An achievement unlocking mid-round SHALL show a small non-blocking toast (trophy
icon + name) that does not obscure the grid or interrupt input. Multiple
simultaneous unlocks SHALL queue and show one at a time, never stacked, and
SHALL respect `prefers-reduced-motion`.

#### Scenario: Non-blocking, queued
- **WHEN** one or more achievements unlock during play
- **THEN** a toast appears without blocking input, and additional unlocks are shown one after another

### Requirement: Trophy button and achievements screen
The main menu SHALL show a trophy button in the top-left (≥44×44) with an
"unlocked/total" badge, opening an achievements screen with Back. Unlocked
entries SHALL show the trophy, name, description, and unlock date; locked entries
SHALL show a lock icon, name, and description (how to unlock). The Word Collector
milestones SHALL show progress toward their threshold whether locked or unlocked.
A Reset control behind a confirmation SHALL be present. A "More by this creator"
section SHALL list two games as links opening in a new tab with
`rel="noopener noreferrer"` and a ≥44px target.

#### Scenario: Screen contents
- **WHEN** the achievements screen is open
- **THEN** all 18 achievements are listed with locked/unlocked state, milestones show progress, and the creator links open in a new tab
