// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'

// A solve that never resolves — exercises the timeout safety net.
vi.mock('./solveAsync', () => ({
  solveBoardAsync: () => new Promise(() => {}),
}))

import balance from '../balance.json'
import { generateBoard } from '../core/board/generate'
import { useBoardSolve } from './useBoardSolve'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('useBoardSolve — timeout safety net', () => {
  it('fails after solveTimeoutMs instead of spinning forever', () => {
    vi.useFakeTimers()
    const board = generateBoard(4, 'timeout') // generation uses findWordsOfMinLength, not solveAsync
    const { result } = renderHook(() => useBoardSolve(board, true))
    expect(result.current.status).toBe('solving')

    act(() => {
      vi.advanceTimersByTime(balance.solveTimeoutMs + 1)
    })
    expect(result.current.status).toBe('failed')
  })
})
