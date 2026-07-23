import { describe, it, expect } from 'vitest'
import { generateBoard } from '../board/generate'
import { solveBoard } from './solver'
import { runSolve } from './solveTask'

// The Web Worker and the main-thread fallback both call `runSolve`, so this
// verifies the shared routine matches the direct solver and is deterministic
// for a seeded board — i.e. worker and main thread return identical results.
describe('runSolve (shared by worker and main thread)', () => {
  it('matches solveBoard exactly for a seeded board', () => {
    for (const size of [4, 6, 7]) {
      const board = generateBoard(size, `solve-${size}`)
      const direct = solveBoard(board)
      const task = runSolve(board)
      expect(task.total).toBe(direct.size)
      expect([...task.words].sort()).toEqual([...direct.keys()].sort())
    }
  })

  it('is deterministic: same seeded board yields the same totals', () => {
    const a = runSolve(generateBoard(6, 'det'))
    const b = runSolve(generateBoard(6, 'det'))
    expect(a.total).toBe(b.total)
    expect(a.words.sort()).toEqual(b.words.sort())
  })
})
