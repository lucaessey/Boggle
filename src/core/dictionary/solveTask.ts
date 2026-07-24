/**
 * Shared solve routine used by BOTH the Web Worker and the main-thread
 * fallback, so their results are identical by construction. Pure and DOM-free.
 */
import type { Board } from '../board/types'
import { solveBoard } from './solver'

export interface SolveTotals {
  total: number
  /** [word, example path] for every findable word. */
  entries: [string, number[]][]
}

/** Full exhaustive solve → total count and every word with one example path. */
export function runSolve(board: Board): SolveTotals {
  const result = solveBoard(board)
  return { total: result.size, entries: [...result.entries()] }
}
