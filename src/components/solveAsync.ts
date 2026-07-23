/**
 * Solve a board without blocking the UI: in a Web Worker when available,
 * otherwise on the main thread (same `runSolve`, so results are identical).
 * Logs the total word count and solve duration so big-board numbers are visible.
 */
import type { Board } from '../core/board/types'
import { runSolve } from '../core/dictionary/solveTask'

export interface SolveResult {
  total: number
  words: string[]
  ms: number
  viaWorker: boolean
}

export function solveBoardAsync(board: Board): Promise<SolveResult> {
  const log = (r: SolveResult) => {
    console.log(
      `[solve] ${board.size}x${board.size}: ${r.total} words in ${Math.round(r.ms)}ms` +
        ` (${r.viaWorker ? 'worker' : 'main thread'})`,
    )
    return r
  }

  if (typeof Worker !== 'undefined') {
    return new Promise<SolveResult>((resolve) => {
      let settled = false
      const finishMain = () => {
        if (settled) return
        settled = true
        const start = performance.now()
        const { total, words } = runSolve(board)
        resolve(log({ total, words, ms: performance.now() - start, viaWorker: false }))
      }
      try {
        const worker = new Worker(new URL('../workers/solver.worker.ts', import.meta.url), {
          type: 'module',
        })
        worker.onmessage = (e: MessageEvent) => {
          if (settled) return
          settled = true
          worker.terminate()
          const data = e.data as { total: number; words: string[]; ms: number }
          resolve(log({ ...data, viaWorker: true }))
        }
        worker.onerror = () => {
          worker.terminate()
          finishMain() // fall back to the main thread on worker failure
        }
        worker.postMessage(board)
      } catch {
        finishMain()
      }
    })
  }

  // No Worker support: solve on the main thread with the loading state shown.
  return new Promise<SolveResult>((resolve) => {
    const start = performance.now()
    const { total, words } = runSolve(board)
    resolve(log({ total, words, ms: performance.now() - start, viaWorker: false }))
  })
}
