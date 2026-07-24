/**
 * Web Worker: runs the full board solve off the main thread so the UI never
 * blocks. Uses the same `runSolve` as the main-thread fallback, so results are
 * identical. Receives a Board, posts back { total, words, ms }.
 */
import type { Board } from '../core/board/types'
import { runSolve } from '../core/dictionary/solveTask'

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null
  postMessage: (message: unknown) => void
}

ctx.onmessage = (e: MessageEvent) => {
  const board = e.data as Board
  const start = performance.now()
  const { total, entries } = runSolve(board)
  ctx.postMessage({ total, entries, ms: performance.now() - start })
}
