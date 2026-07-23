import { describe, it, expect } from 'vitest'
import balance from '../../balance.json'
import { neighbours } from './board'
import { generateBoard } from './generate'
import { findWordsOfMinLength } from '../dictionary/findWords'

const SIZES = [4, 6, 7]

describe('neighbours — adjacency at every size', () => {
  it('4x4: corner 3, edge 5, interior 8', () => {
    expect(neighbours(0, 4)).toHaveLength(3)
    expect(neighbours(1, 4)).toHaveLength(5)
    expect(neighbours(5, 4)).toHaveLength(8)
  })

  it('6x6: corner 3, edge 5, interior/center 8', () => {
    expect(neighbours(0, 6)).toHaveLength(3) // top-left corner
    expect(neighbours(35, 6)).toHaveLength(3) // bottom-right corner
    expect(neighbours(1, 6)).toHaveLength(5) // top edge
    expect(neighbours(6, 6)).toHaveLength(5) // left edge
    expect(neighbours(7, 6)).toHaveLength(8) // interior (row1,col1)
    expect(neighbours(14, 6)).toHaveLength(8) // center-ish (row2,col2)
  })

  it('7x7: corner 3, edge 5, center 8', () => {
    expect(neighbours(0, 7)).toHaveLength(3) // corner
    expect(neighbours(48, 7)).toHaveLength(3) // corner
    expect(neighbours(3, 7)).toHaveLength(5) // top edge
    expect(neighbours(7, 7)).toHaveLength(5) // left edge
    expect(neighbours(24, 7)).toHaveLength(8) // exact center (row3,col3)
    expect(neighbours(8, 7)).toHaveLength(8) // interior
  })

  it('returns the exact neighbour set for a 6x6 interior cell', () => {
    expect(neighbours(7, 6).sort((a, b) => a - b)).toEqual([0, 1, 2, 6, 8, 12, 13, 14])
  })
})

describe('generateBoard — dimensions and tile counts', () => {
  for (const size of SIZES) {
    it(`size ${size} produces ${size * size} cells with non-empty faces`, () => {
      const board = generateBoard(size, `dims-${size}`)
      expect(board.size).toBe(size)
      expect(board.cells).toHaveLength(size * size)
      for (const cell of board.cells) expect(cell.face.length).toBeGreaterThan(0)
    })
  }
})

describe('generateBoard — dice usage (dice-based sizes)', () => {
  it('4x4 uses each of the 16 dice exactly once', () => {
    const board = generateBoard(4, 'dice-4')
    const used = board.cells.map((c) => c.dieIndex).sort((a, b) => (a ?? 0) - (b ?? 0))
    expect(used).toEqual([...Array(16).keys()])
  })

  it('6x6 uses each of the 36 dice exactly once', () => {
    const board = generateBoard(6, 'dice-6')
    const used = board.cells.map((c) => c.dieIndex).sort((a, b) => (a ?? 0) - (b ?? 0))
    expect(used).toEqual([...Array(36).keys()])
  })
})

describe('generateBoard — 7x7 bag vowel floor', () => {
  it('has at least vowelMin vowel tiles', () => {
    const vowelMin = balance.sizes['7'].vowelMin
    const vowels: string[] = balance.vowels
    const board = generateBoard(7, 'vowels-7')
    const vowelCount = board.cells.filter((c) => vowels.includes(c.face)).length
    expect(vowelCount).toBeGreaterThanOrEqual(vowelMin)
  })
})

describe('generateBoard — seeded determinism at every size', () => {
  for (const size of SIZES) {
    it(`size ${size}: same seed yields an identical board`, () => {
      const a = generateBoard(size, `det-${size}`)
      const b = generateBoard(size, `det-${size}`)
      expect(a.cells.map((c) => c.face)).toEqual(b.cells.map((c) => c.face))
    })
  }

  it('different seeds yield different boards (4x4)', () => {
    const a = generateBoard(4, 'seed-a').cells.map((c) => c.face).join('')
    const b = generateBoard(4, 'seed-b').cells.map((c) => c.face).join('')
    expect(a).not.toEqual(b)
  })
})

describe('generateBoard — meets per-size quality targets', () => {
  for (const size of SIZES) {
    it(`size ${size}: accepted board satisfies every target`, () => {
      const targets = balance.sizes[String(size) as '4' | '6' | '7'].targets
      const board = generateBoard(size, `targets-${size}`)
      for (const t of targets) {
        const found = findWordsOfMinLength(board, t.minLength, t.count)
        expect(found.words.length).toBeGreaterThanOrEqual(t.count)
      }
    })
  }
})
