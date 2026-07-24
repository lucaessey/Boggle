/**
 * Pure, DOM-free scoring for Bonus Tiles mode.
 *
 * Scoring is LENGTH-based (not letter-value based), so the bonuses are defined
 * in terms of length:
 *  - DOUBLE LETTER: if the traced path crosses that tile, the tile counts twice
 *    toward the word's effective length. A normal letter adds +1 (a 6-letter
 *    word scores as 7); a "Qu" tile adds +2 (it already contributes 2, so it
 *    counts as four letters).
 *  - TRIPLE WORD: if the path crosses that tile, the final score is ×3.
 *  - If a path crosses BOTH, the double-letter length adjustment is applied
 *    first, then the triple multiplier.
 */
import type { BonusTiles } from '../board/types'
import { scoreForLength } from './scoring'

export interface BonusScoreResult {
  points: number
  doubleUsed: boolean
  tripleUsed: boolean
}

/** True if the traced path includes `index` (index < 0 → never). */
export function pathCrosses(path: readonly number[], index: number): boolean {
  return index >= 0 && path.includes(index)
}

/**
 * Score under Bonus Tiles rules from primitive inputs (no board), so the math is
 * unit-testable in isolation.
 * - `baseLength`: the word's letter length (a "Qu" tile already counts as 2).
 * - `doubleFaceLen`: how many letters the double-letter tile contributes (1, or
 *   2 for a "Qu" tile) — only used when `crossesDouble`.
 */
export function bonusScore(params: {
  baseLength: number
  crossesDouble: boolean
  doubleFaceLen: number
  crossesTriple: boolean
}): number {
  const effectiveLen = params.crossesDouble
    ? params.baseLength + params.doubleFaceLen
    : params.baseLength
  const score = scoreForLength(effectiveLen)
  return params.crossesTriple ? score * 3 : score
}

/**
 * Score a traced word for a board that may carry bonus tiles. When `bonus` is
 * undefined (any non-Bonus mode) this is exactly the base length score with no
 * markers. `faces` are the per-cell face strings (e.g. "A", "Qu").
 */
export function scoreTracedWord(
  word: string,
  path: readonly number[],
  bonus: BonusTiles | undefined,
  faces: readonly string[],
): BonusScoreResult {
  if (!bonus) {
    return { points: scoreForLength(word.length), doubleUsed: false, tripleUsed: false }
  }
  const doubleUsed = pathCrosses(path, bonus.doubleIndex)
  const tripleUsed = pathCrosses(path, bonus.tripleIndex)
  const doubleFaceLen = doubleUsed ? (faces[bonus.doubleIndex]?.length ?? 1) : 1
  const points = bonusScore({
    baseLength: word.length,
    crossesDouble: doubleUsed,
    doubleFaceLen,
    crossesTriple: tripleUsed,
  })
  return { points, doubleUsed, tripleUsed }
}
