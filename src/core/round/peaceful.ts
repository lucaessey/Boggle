/**
 * Pure, DOM-free logic for Peaceful (untimed, goal-based) mode.
 */

/** Words needed to win: a percentage of the board's total, rounded up. */
export function goalCount(totalWords: number, goalPercentage: number): number {
  return Math.ceil((totalWords * goalPercentage) / 100)
}

/** The player has won once they've found at least `goal` words. */
export function hasReachedGoal(foundCount: number, goal: number): boolean {
  return foundCount >= goal
}

export interface Progress {
  found: number
  total: number
  /** Whole-number percent of the board's words found (floored). */
  percent: number
}

export function progress(foundCount: number, totalWords: number): Progress {
  const percent = totalWords > 0 ? Math.floor((foundCount / totalWords) * 100) : 0
  return { found: foundCount, total: totalWords, percent }
}
