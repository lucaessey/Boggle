/**
 * Quality-guaranteed board generation.
 *
 * Rerolls fresh candidate boards (all driven by one seeded RNG, so the reroll
 * sequence is deterministic) until the board satisfies the per-size quality
 * targets in balance.json, capped at `maxGenerationAttempts`. If the cap is hit,
 * the best board seen so far is accepted and a warning is logged.
 *
 * Target checks use the early-exit `findWordsOfMinLength`, never a full solve.
 */
import balance from '../../balance.json'
import { findWordsOfMinLength } from '../dictionary/findWords'
import { generateRawBoard, sizeConfig } from './board'
import { Rng } from './rng'
import type { Board } from './types'

const MAX_ATTEMPTS = balance.maxGenerationAttempts

interface Target {
  minLength: number
  count: number
}

/** How many of the size's targets this board satisfies (used to pick a fallback). */
function qualityScore(board: Board, targets: Target[]): number {
  let satisfied = 0
  for (const t of targets) {
    if (findWordsOfMinLength(board, t.minLength, t.count).words.length >= t.count) {
      satisfied++
    }
  }
  return satisfied
}

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}

/**
 * Generate a board of `size` that meets its quality targets. With a `seed`,
 * generation (including the reroll sequence) is deterministic.
 */
export function generateBoard(size: number, seed?: number | string): Board {
  const resolvedSeed = seed ?? randomSeed()
  const rng = new Rng(resolvedSeed)
  const targets = (sizeConfig(size).targets ?? []) as Target[]
  const goal = targets.length

  let best: Board | null = null
  let bestScore = -1

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const board = generateRawBoard(size, rng, resolvedSeed)
    const score = qualityScore(board, targets)
    if (score >= goal) return board // all targets met
    if (score > bestScore) {
      bestScore = score
      best = board
    }
  }

  console.warn(
    `generateBoard(${size}): hit maxGenerationAttempts (${MAX_ATTEMPTS}); ` +
      `accepting best board (${bestScore}/${goal} targets met).`,
  )
  return best as Board
}
