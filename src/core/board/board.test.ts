import { describe, it, expect } from 'vitest'
import balance from '../../balance.json'
import { generateBoard, neighbours } from './board'

const SIZE = balance.gridSize

describe('generateBoard — determinism', () => {
  it('produces an identical board for the same seed', () => {
    const a = generateBoard('seed-1')
    const b = generateBoard('seed-1')
    expect(a).toEqual(b)
    // Explicitly: same dice assignment and same face on every cell.
    expect(a.cells.map((c) => c.dieIndex)).toEqual(b.cells.map((c) => c.dieIndex))
    expect(a.cells.map((c) => c.face)).toEqual(b.cells.map((c) => c.face))
  })

  it('produces different boards for different seeds', () => {
    const a = generateBoard('seed-1')
    const b = generateBoard('seed-2')
    const faceString = (board: typeof a) => board.cells.map((c) => c.face).join('')
    expect(faceString(a)).not.toEqual(faceString(b))
  })
})

describe('generateBoard — dice usage', () => {
  it('uses each of the 16 dice exactly once', () => {
    const board = generateBoard('dice-check')
    const used = board.cells.map((c) => c.dieIndex).sort((x, y) => x - y)
    expect(used).toEqual([...Array(SIZE * SIZE).keys()])
  })

  it('shows a real face of the assigned die on each cell', () => {
    const board = generateBoard('faces')
    for (const cell of board.cells) {
      expect(balance.dice[cell.dieIndex]).toContain(cell.face)
    }
  })

  it('keeps "Qu" as a single face, never split', () => {
    // The die at index 10 in balance.json carries the "Qu" face. Search seeds
    // until that die rolls "Qu", then assert the cell face is exactly "Qu".
    let found = false
    for (let s = 0; s < 200 && !found; s++) {
      const board = generateBoard(s)
      const quCell = board.cells.find((c) => c.face === 'Qu')
      if (quCell) {
        expect(quCell.face).toBe('Qu')
        expect(quCell.face.length).toBe(2)
        found = true
      }
    }
    expect(found).toBe(true)
  })
})

describe('neighbours — adjacency', () => {
  // Indices assume a 4x4 board (SIZE === 4).
  it('returns 3 neighbours for a corner cell', () => {
    expect(neighbours(0)).toHaveLength(3) // top-left
    expect(neighbours(SIZE - 1)).toHaveLength(3) // top-right
    expect(neighbours(SIZE * SIZE - 1)).toHaveLength(3) // bottom-right
  })

  it('returns 5 neighbours for a non-corner edge cell', () => {
    expect(neighbours(1)).toHaveLength(5) // top edge
    expect(neighbours(SIZE)).toHaveLength(5) // left edge (index 4 on 4x4)
  })

  it('returns 8 neighbours for an interior cell', () => {
    expect(neighbours(5)).toHaveLength(8) // interior on 4x4
    expect(neighbours(10)).toHaveLength(8)
  })

  it('returns the correct neighbour set for the top-left corner', () => {
    expect(neighbours(0).sort((a, b) => a - b)).toEqual([1, SIZE, SIZE + 1])
  })
})
