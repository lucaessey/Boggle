/**
 * Solve a board without blocking the UI: in a Web Worker when available,
 * otherwise on the main thread (same `runSolve`, so results are identical).
 * Logs the total word count and solve duration. Rejects only if BOTH the worker
 * and the main-thread fallback fail — the caller then hides reveal options.
 */
import type { Board } from '../core/board/types'
import { runSolve } from '../core/dictionary/solveTask'

export interface SolveResult {
  total: number
  entries: [string, number[]][]
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

  const solveOnMainThread = (): SolveResult => {
    const start = performance.now()
    const { total, entries } = runSolve(board)
    return { total, entries, ms: performance.now() - start, viaWorker: false }
  }

  if (typeof Worker !== 'undefined') {
    return new Promise<SolveResult>((resolve, reject) => {
      let settled = false
      const fallback = () => {
        if (settled) return
        settled = true
        try {
          resolve(log(solveOnMainThread()))
        } catch (err) {
          reject(err) // both worker and main thread failed
        }
      }
      try {
        const worker = new Worker(new URL('../workers/solver.worker.ts', import.meta.url), {
          type: 'module',
        })
        worker.onmessage = (e: MessageEvent) => {
          if (settled) return
          settled = true
          worker.terminate()
          const data = e.data as { total: number; entries: [string, number[]][]; ms: number }
          resolve(log({ ...data, viaWorker: true }))
        }
        // Both error paths fall back to the main thread rather than hanging.
        worker.onerror = () => {
          worker.terminate()
          fallback()
        }
        worker.onmessageerror = () => {
          worker.terminate()
          fallback()
        }
        worker.postMessage(board)
      } catch {
        fallback()
      }
    })
  }

  return new Promise<SolveResult>((resolve, reject) => {
    try {
      resolve(log(solveOnMainThread()))
    } catch (err) {
      reject(err)
    }
  })
}
