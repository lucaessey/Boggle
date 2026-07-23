# Project Context

> Note: OpenSpec 1.5.0 reads project context from `openspec/config.yaml`
> (the `context:` field). This file mirrors that context for human readers and
> is kept in sync with `config.yaml`.

## Overview

A Boggle-like word game, built as a PWA. Solo developer. Mobile-first,
touch-based UI.

## Stack & Deployment

- **Stack:** Vite + React + TypeScript
- **Deployment:** GitHub Pages
- **Backend:** none — all state is persisted in `localStorage`

## Conventions

- All tunable constants live in `src/balance.json`. There are **no magic
  numbers** in components or logic modules; every constant is read from
  `balance.json`.
- **Architecture:** core game logic — board generation, dictionary/solver, path
  state machine, and scoring — is written as pure, DOM-free, unit-tested
  modules. React components are thin adapters over those modules.

## Planned Change Sequence

1. `board-and-dice`
2. `dictionary-and-solver`
3. `path-input`
4. `round-core`
5. `pass-and-play`
6. `pwa-and-deploy`

## Scope

**In scope (game modes):**

- Classic timed single round
- Infinite / practice
- Pass-and-play multiplayer for 2–6 players

**Out of scope:**

- Daily puzzle
- Online multiplayer
- Accounts

## Scoring

Pass-and-play uses classic Boggle **duplicate cancellation**: any word found by
two or more players scores zero for all of them.
