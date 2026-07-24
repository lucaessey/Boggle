/**
 * Pure, DOM-free scoring.
 *
 * Linear model, configured entirely in balance.json:
 *   score = basePoints + (wordLength - minLength) * pointsPerExtraLetter
 * Words shorter than `minLength` score 0. There is no upper cap.
 *
 * `scoreForWord` keeps a stable signature so a future non-linear table could
 * replace the body without touching any call site. The formula's constants live
 * only in balance.json — none are hardcoded here.
 */
import balance from '../../balance.json'

const { minLength, basePoints, pointsPerExtraLetter } = balance.scoring

/**
 * Points for an effective letter length. Kept separate from `scoreForWord` so
 * Bonus Tiles mode (which adjusts the effective length, e.g. a double-letter
 * tile counting twice) can score in the same linear model without a word string.
 */
export function scoreForLength(len: number): number {
  if (len < minLength) return 0
  return basePoints + (len - minLength) * pointsPerExtraLetter
}

/** Points for a word, by its letter length (a "Qu" tile counts as two letters). */
export function scoreForWord(word: string): number {
  return scoreForLength(word.length)
}
