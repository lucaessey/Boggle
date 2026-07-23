import { describe, it, expect } from 'vitest'
import balance from '../../balance.json'
import { neighbours } from '../board/board'
import { generateBoard } from '../board/generate'
import type { Board, Cell } from '../board/types'
import { isValidWord } from './dictionary'
import { hasPath, solveBoard } from './solver'

const SIZE = 4

/** Build a 4x4 Board from 16 face strings (row-major) for testing. */
function makeBoard(faces: string[]): Board {
  const cells: Cell[] = faces.map((face, index) => ({
    index,
    row: Math.floor(index / SIZE),
    col: index % SIZE,
    dieIndex: 0,
    face,
  }))
  return { size: SIZE, cells, seed: 'test' }
}

/** Assert a path is a legal Boggle path that spells `word`. */
function assertValidPath(board: Board, word: string, path: number[]) {
  // No repeated cells.
  expect(new Set(path).size).toBe(path.length)
  // Consecutive cells are adjacent.
  for (let i = 1; i < path.length; i++) {
    expect(neighbours(path[i - 1], board.size)).toContain(path[i])
  }
  // The path spells the word (Qu contributes two letters).
  const spelled = path.map((idx) => board.cells[idx].face.toLowerCase()).join('')
  expect(spelled).toBe(word)
}

describe('solveBoard — hand-verified board', () => {
  // Layout (index: letter):
  //   0 D   1 O   2 G   3 E
  //   4 A   5 T   6 S   7 N
  //   8 R   9 E  10 L  11 P
  //  12 B  13 I  14 M  15 K
  const board = makeBoard([
    'D', 'O', 'G', 'E',
    'A', 'T', 'S', 'N',
    'R', 'E', 'L', 'P',
    'B', 'I', 'M', 'K',
  ])
  const result = solveBoard(board)

  it('finds words that are actually constructible', () => {
    for (const word of ['dog', 'dot', 'got', 'dote', 'toad', 'rat', 'tar', 'star', 'dogs']) {
      expect(result.has(word)).toBe(true)
    }
  })

  it('does not find words whose letters are not adjacent on the board', () => {
    // No A neighbours S here, so "sat" cannot be traced.
    expect(result.has('sat')).toBe(false)
  })

  it('returns a legal, non-repeating path for every word', () => {
    for (const [word, path] of result) {
      assertValidPath(board, word, path)
    }
    expect(result.size).toBeGreaterThan(0)
  })
})

describe('hasPath', () => {
  // Layout (index: letter):
  //   0 D   1 O   2 G   3 E
  //   4 A   5 T   6 S   7 N
  //   8 R   9 E  10 L  11 P
  //  12 B  13 I  14 M  15 K
  const board = makeBoard([
    'D', 'O', 'G', 'E',
    'A', 'T', 'S', 'N',
    'R', 'E', 'L', 'P',
    'B', 'I', 'M', 'K',
  ])

  function isLegalPathFor(word: string, path: number[]) {
    expect(new Set(path).size).toBe(path.length) // no reuse
    for (let i = 1; i < path.length; i++) {
      expect(neighbours(path[i - 1], board.size)).toContain(path[i])
    }
    const spelled = path.map((i) => board.cells[i].face.toLowerCase()).join('')
    expect(spelled).toBe(word.toLowerCase())
  }

  it('returns a valid path for a word that is on the board', () => {
    const path = hasPath(board, 'dote') // D0-O1-T5-E9
    expect(path).not.toBeNull()
    isLegalPathFor('dote', path as number[])
  })

  it('returns null when the letters are present but not connected', () => {
    // "sat": S6 has no adjacent A, so it cannot be traced.
    expect(hasPath(board, 'sat')).toBeNull()
  })

  it('returns null when the word requires reusing a cell', () => {
    // "tot" needs two T's, but there is only one T tile — no reuse allowed.
    expect(hasPath(board, 'tot')).toBeNull()
  })

  it('treats a "Qu" tile as consuming both typed letters', () => {
    // Board with a Qu tile: Qu(0)-E(1)-E(2)-N(3) spells "queen".
    const quBoard = makeBoard([
      'Qu', 'E', 'E', 'N',
      'A', 'B', 'C', 'D',
      'F', 'G', 'H', 'I',
      'J', 'K', 'L', 'M',
    ])
    const path = hasPath(quBoard, 'queen')
    expect(path).not.toBeNull()
    expect(path).toEqual([0, 1, 2, 3])
    // The typed 'q' and 'u' are both consumed by the single Qu tile.
    expect((path as number[]).length).toBe(4)
  })
})

describe('solveBoard — only returns real words', () => {
  it('every returned word is accepted by isValidWord (across random boards)', () => {
    for (let seed = 1; seed <= 8; seed++) {
      const board = generateBoard(4, seed)
      const result = solveBoard(board)
      for (const [word, path] of result) {
        expect(isValidWord(word)).toBe(true)
        expect(word.length).toBeGreaterThanOrEqual(balance.minWordLength)
        assertValidPath(board, word, path)
      }
    }
  })
})
