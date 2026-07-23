/**
 * Shared solve routine used by BOTH the Web Worker and the main-thread
 * fallback, so their results are identical by construction. Pure and DOM-free.
 */
import type { Board } from '../board/types'
import { solveBoard } from './solver'

export interface SolveTotals {
  total: number
  words: string[]
}

/** Full exhaustive solve → total findable word count and the word list. */
export function runSolve(board: Board): SolveTotals {
  const result = solveBoard(board)
  return { total: result.size, words: [...result.keys()] }
}
