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
import {
  type GameModeId,
  LONG_MODE_MIN_BOARD_WORDS,
  LONG_MODE_MIN_LENGTH,
} from '../round/modes'
import { generateRawBoard, sizeConfig } from './board'
import { Rng } from './rng'
import type { Board } from './types'

const MAX_ATTEMPTS = balance.maxGenerationAttempts
const MIN_TOTAL_WORDS = balance.minTotalWords

export interface Target {
  minLength: number
  count: number
}

/**
 * The full quality targets for a size: the per-size targets plus the global
 * minimum-total-words safety net (checked with the early-exit search, so it
 * stops as soon as `minTotalWords` are found — never a full solve).
 */
export function targetsForSize(size: number): Target[] {
  return [...((sizeConfig(size).targets ?? []) as Target[]), { minLength: 3, count: MIN_TOTAL_WORDS }]
}

/** Whether a board satisfies every target (each checked with early exit). */
export function boardMeetsTargets(board: Board, targets: Target[]): boolean {
  return targets.every(
    (t) => findWordsOfMinLength(board, t.minLength, t.count).words.length >= t.count,
  )
}

/** How many of the targets this board satisfies (used to pick a fallback). */
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

/** Options that let a game mode tighten generation or add bonus tiles. */
export interface GenerateOptions {
  /**
   * Extra quality targets a mode requires (checked with the same early-exit
   * search). Long Words Only passes a "≥10 words of 5+ letters" target so a
   * bad small board isn't unplayable.
   */
  extraTargets?: Target[]
  /**
   * Bonus Tiles mode: designate one double-letter and one (distinct) triple-word
   * tile, drawn from the same seeded RNG so seeded boards stay deterministic.
   */
  bonusTiles?: boolean
}

/** Generation options implied by a game mode (Long adds a target, Bonus adds tiles). */
export function generateOptionsForMode(gameMode: GameModeId): GenerateOptions {
  if (gameMode === 'long') {
    return { extraTargets: [{ minLength: LONG_MODE_MIN_LENGTH, count: LONG_MODE_MIN_BOARD_WORDS }] }
  }
  if (gameMode === 'bonus') return { bonusTiles: true }
  return {}
}

/**
 * Draw the two distinct bonus-tile indices from the RNG. Called at the moment a
 * board is accepted, so the RNG state is deterministic for a given seed.
 */
function assignBonusTiles(board: Board, rng: Rng): Board {
  const n = board.cells.length
  const doubleIndex = rng.intBetween(0, n)
  let tripleIndex = rng.intBetween(0, n)
  while (tripleIndex === doubleIndex) tripleIndex = rng.intBetween(0, n)
  return { ...board, bonus: { doubleIndex, tripleIndex } }
}

/**
 * Generate a board of `size` that meets its quality targets. With a `seed`,
 * generation (including the reroll sequence and any bonus-tile draw) is
 * deterministic. `options` let a game mode add targets or bonus tiles.
 */
export function generateBoard(
  size: number,
  seed?: number | string,
  options: GenerateOptions = {},
): Board {
  const resolvedSeed = seed ?? randomSeed()
  const rng = new Rng(resolvedSeed)
  const targets = [...targetsForSize(size), ...(options.extraTargets ?? [])]
  const goal = targets.length
  const finish = (board: Board): Board => (options.bonusTiles ? assignBonusTiles(board, rng) : board)

  let best: Board | null = null
  let bestScore = -1

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const board = generateRawBoard(size, rng, resolvedSeed)
    const score = qualityScore(board, targets)
    if (score >= goal) return finish(board) // all targets met
    if (score > bestScore) {
      bestScore = score
      best = board
    }
  }

  console.warn(
    `generateBoard(${size}): hit maxGenerationAttempts (${MAX_ATTEMPTS}); ` +
      `accepting best board (${bestScore}/${goal} targets met).`,
  )
  return finish(best as Board)
}
