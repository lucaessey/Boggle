import { useEffect, useState } from 'react'
import balance from '../balance.json'
import type { Board } from '../core/board/types'
import { solveBoardAsync } from './solveAsync'

const SOLVE_TIMEOUT_MS = balance.solveTimeoutMs

/** Post-round solve status used by the results screen. */
export type SolveState =
  | { status: 'idle' }
  | { status: 'solving' }
  | { status: 'ready'; total: number; paths: Map<string, number[]> }
  | { status: 'failed' }

/**
 * Solve a board off the main thread once `enabled` is true, exposing a
 * SolveState that always resolves to `ready` or `failed` — never stuck on
 * `solving`.
 *
 * The effect depends only on `[board, enabled]`, NOT on the solve state it sets;
 * that is what avoids the self-cancelling-effect bug where writing `solving`
 * re-ran the effect and its cleanup cancelled the in-flight solve. A
 * `solveTimeoutMs` safety net guarantees the spinner never spins forever.
 */
export function useBoardSolve(board: Board, enabled: boolean): SolveState {
  const [solve, setSolve] = useState<SolveState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled) {
      setSolve({ status: 'idle' })
      return
    }
    setSolve({ status: 'solving' })
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled) setSolve({ status: 'failed' })
    }, SOLVE_TIMEOUT_MS)

    solveBoardAsync(board)
      .then((r) => {
        if (cancelled) return
        clearTimeout(timeout)
        setSolve({ status: 'ready', total: r.total, paths: new Map(r.entries) })
      })
      .catch(() => {
        if (cancelled) return
        clearTimeout(timeout)
        setSolve({ status: 'failed' })
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [board, enabled])

  return solve
}
