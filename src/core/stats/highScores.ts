/**
 * Pure, DOM-free high-score logic. One record per (board size, timed length,
 * game mode). Peaceful mode is never recorded. A record is only replaced by a
 * STRICTLY higher score.
 */
import type { GameModeId } from '../round/modes'
import type { HighScoreRecord } from './stats'

export type HighScores = Record<string, HighScoreRecord>

/**
 * Stable key for a size + timed length + game mode. Normal mode keeps the
 * legacy `${size}x${length}` key with no mode suffix, so records saved before
 * modes existed continue to work unchanged (migrate rather than wipe). Other
 * modes get their own suffixed slot and never collide with Normal.
 */
export function highScoreKey(size: number, length: number, mode: GameModeId = 'normal'): string {
  const base = `${size}x${length}`
  return mode === 'normal' ? base : `${base}:${mode}`
}

export function getHighScore(
  scores: HighScores,
  size: number,
  length: number,
  mode: GameModeId = 'normal',
): HighScoreRecord | undefined {
  return scores[highScoreKey(size, length, mode)]
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
  mode: GameModeId = 'normal',
): ConsiderResult {
  const key = highScoreKey(size, length, mode)
  const previous = scores[key]
  const isNewBest = previous === undefined || candidate.score > previous.score
  if (!isNewBest) return { scores, isNewBest: false, previous }
  return { scores: { ...scores, [key]: candidate }, isNewBest: true, previous }
}
