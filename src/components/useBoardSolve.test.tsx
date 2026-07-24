// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { generateBoard } from '../core/board/generate'
import { useBoardSolve } from './useBoardSolve'

afterEach(cleanup)

// Regression for the stuck-spinner bug: the solve state must always resolve to
// `ready` (or `failed`) and never remain `solving`. In jsdom there is no Worker,
// so this exercises the main-thread path.
describe('useBoardSolve — never remains in loading', () => {
  for (const size of [4, 5, 6, 7]) {
    it(`reaches a resolved state for ${size}x${size}`, async () => {
      const board = generateBoard(size, `hb-${size}`)
      const { result } = renderHook(() => useBoardSolve(board, true))
      await waitFor(() => expect(result.current.status).not.toBe('solving'), { timeout: 8000 })
      expect(result.current.status).toBe('ready')
      if (result.current.status === 'ready') {
        expect(result.current.total).toBeGreaterThan(0)
        expect(result.current.paths.size).toBe(result.current.total)
      }
    })
  }

  it('stays idle while disabled', () => {
    const board = generateBoard(4, 'disabled')
    const { result } = renderHook(() => useBoardSolve(board, false))
    expect(result.current.status).toBe('idle')
  })
})
