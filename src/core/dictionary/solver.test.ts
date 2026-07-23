import { describe, it, expect } from 'vitest'
import balance from '../../balance.json'
import { generateBoard, neighbours } from '../board/board'
import type { Board, Cell } from '../board/types'
import { isValidWord } from './dictionary'
import { solveBoard } from './solver'

const SIZE = balance.gridSize

/** Build a Board from 16 face strings (row-major) for testing. */
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
    expect(neighbours(path[i - 1])).toContain(path[i])
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

describe('solveBoard — only returns real words', () => {
  it('every returned word is accepted by isValidWord (across random boards)', () => {
    for (let seed = 1; seed <= 8; seed++) {
      const board = generateBoard(seed)
      const result = solveBoard(board)
      for (const [word, path] of result) {
        expect(isValidWord(word)).toBe(true)
        expect(word.length).toBeGreaterThanOrEqual(balance.minWordLength)
        assertValidPath(board, word, path)
      }
    }
  })
})
