import { describe, expect, it } from 'vitest'
import { findWordsOfMinLength } from '../dictionary/findWords'
import { LONG_MODE_MIN_BOARD_WORDS, LONG_MODE_MIN_LENGTH } from '../round/modes'
import {
  boardMeetsTargets,
  generateBoard,
  generateOptionsForMode,
} from './generate'
import type { Board, Cell } from './types'

/** A board of a single repeated face (no valid words) for negative checks. */
function uniformBoard(size: number, face: string): Board {
  const cells: Cell[] = []
  for (let i = 0; i < size * size; i++) {
    cells.push({ index: i, row: Math.floor(i / size), col: i % size, face })
  }
  return { size, cells, seed: 'uniform' }
}

describe('Long Words Only board generation', () => {
  const target = [{ minLength: LONG_MODE_MIN_LENGTH, count: LONG_MODE_MIN_BOARD_WORDS }]

  it('rejects a board with fewer than 10 words of 5+ letters', () => {
    // An all-"A" board has zero words, so it fails the long-mode target.
    expect(boardMeetsTargets(uniformBoard(4, 'A'), target)).toBe(false)
  })

  it('generateOptionsForMode("long") adds the 5+/10-words target', () => {
    expect(generateOptionsForMode('long')).toEqual({ extraTargets: target })
  })

  it('produces boards that actually contain 10+ words of 5+ letters', () => {
    for (const seed of ['long-a', 'long-b', 'long-c']) {
      const board = generateBoard(4, seed, generateOptionsForMode('long'))
      const found = findWordsOfMinLength(board, LONG_MODE_MIN_LENGTH, LONG_MODE_MIN_BOARD_WORDS)
      expect(found.words.length).toBeGreaterThanOrEqual(LONG_MODE_MIN_BOARD_WORDS)
    }
  })
})

describe('Bonus Tiles generation', () => {
  it('is deterministic for a given seed', () => {
    const a = generateBoard(4, 'bonus-seed', { bonusTiles: true })
    const b = generateBoard(4, 'bonus-seed', { bonusTiles: true })
    expect(a.bonus).toEqual(b.bonus)
    expect(a.bonus).toBeDefined()
  })

  it('picks two distinct in-range tiles', () => {
    for (const seed of ['s1', 's2', 's3', 's4']) {
      const board = generateBoard(5, seed, generateOptionsForMode('bonus'))
      const { doubleIndex, tripleIndex } = board.bonus!
      const n = board.cells.length
      expect(doubleIndex).not.toBe(tripleIndex)
      for (const idx of [doubleIndex, tripleIndex]) {
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(n)
      }
    }
  })

  it('leaves non-bonus modes without bonus tiles', () => {
    expect(generateBoard(4, 'x', generateOptionsForMode('normal')).bonus).toBeUndefined()
    expect(generateBoard(4, 'x', generateOptionsForMode('long')).bonus).toBeUndefined()
  })
})
