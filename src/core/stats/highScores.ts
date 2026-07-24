/**
 * Pure, DOM-free high-score logic. One record per (board size, timed length).
 * Peaceful mode is never recorded. A record is only replaced by a STRICTLY
 * higher score.
 */
import type { HighScoreRecord } from './stats'

export type HighScores = Record<string, HighScoreRecord>

/** Stable key for a size + timed length. */
export function highScoreKey(size: number, length: number): string {
  return `${size}x${length}`
}

export function getHighScore(
  scores: HighScores,
  size: number,
  length: number,
): HighScoreRecord | undefined {
  return scores[highScoreKey(size, length)]
}

export interface ConsiderResult {
  scores: HighScores
  /** True if `candidate` strictly beat the previous record (or there was none). */
  isNewBest: boolean
  /** The previous record for this slot (read BEFORE any write). */
  previous: HighScoreRecord | undefined
}

/**
 * Consider a candidate record for a slot. Reads the previous value first; writes
 * only if the candidate's score is strictly higher. An equal score does not
 * replace the record.
 */
export function considerHighScore(
  scores: HighScores,
  size: number,
  length: number,
  candidate: HighScoreRecord,
): ConsiderResult {
  const key = highScoreKey(size, length)
  const previous = scores[key]
  const isNewBest = previous === undefined || candidate.score > previous.score
  if (!isNewBest) return { scores, isNewBest: false, previous }
  return { scores: { ...scores, [key]: candidate }, isNewBest: true, previous }
}
