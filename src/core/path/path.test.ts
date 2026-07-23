import { describe, it, expect } from 'vitest'
import { neighbours } from '../board/board'
import {
  crossedTiles,
  extendPath,
  extendPathThroughSegment,
  hitTest,
  pathWord,
  type Point,
} from './path'

// Board layout for reference (4x4, row-major indices):
//   0  1  2  3
//   4  5  6  7
//   8  9 10 11
//  12 13 14 15
const n4 = (i: number) => neighbours(i, 4)

describe('extendPath', () => {
  it('starts the path on an empty state', () => {
    expect(extendPath([], 5, n4)).toEqual([5])
  })

  it('appends an 8-way adjacent, unused tile', () => {
    expect(extendPath([5], 6, n4)).toEqual([5, 6]) // right
    expect(extendPath([5], 0, n4)).toEqual([5, 0]) // diagonal up-left
  })

  it('leaves the path unchanged for a non-adjacent tile', () => {
    const state = [5]
    const next = extendPath(state, 7, n4) // 7 is not adjacent to 5
    expect(next).toEqual([5])
    expect(next).toBe(state) // same reference: no change
  })

  it('backtracks when moving onto the second-to-last tile', () => {
    expect(extendPath([5, 6], 5, n4)).toEqual([5])
    expect(extendPath([5, 6, 7], 6, n4)).toEqual([5, 6])
  })

  it('ignores an already-used tile that is not the second-to-last', () => {
    const state = [5, 6, 10] // 5 is used and adjacent to 10, but not 2nd-last
    const next = extendPath(state, 5, n4)
    expect(next).toEqual([5, 6, 10])
    expect(next).toBe(state)
  })

  it('is a no-op when the candidate is the current last tile', () => {
    const state = [5, 6]
    const next = extendPath(state, 6, n4)
    expect(next).toBe(state)
  })
})

describe('hitTest', () => {
  const centers: Point[] = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 0, y: 100 },
  ]

  it('returns the tile whose centre is within the radius', () => {
    expect(hitTest({ x: 5, y: 5 }, centers, 28)).toBe(0)
    expect(hitTest({ x: 95, y: 2 }, centers, 28)).toBe(1)
  })

  it('returns null when no centre is within the radius', () => {
    expect(hitTest({ x: 50, y: 50 }, centers, 28)).toBeNull()
  })

  it('chooses the nearest centre when several qualify', () => {
    // Point at x=12 is within 28 of both {0,0} (12) and would-be overlaps;
    // nearest is index 0.
    expect(hitTest({ x: 12, y: 0 }, centers, 28)).toBe(0)
    // Point closer to index 1.
    expect(hitTest({ x: 88, y: 0 }, centers, 28)).toBe(1)
  })
})

describe('pathWord', () => {
  const faces = ['Qu', 'E', 'E', 'N', 'A', 'B']

  it('joins the faces of the path in order', () => {
    expect(pathWord(faces, [4, 1, 5])).toBe('AEB')
  })

  it('includes both letters for a "Qu" tile', () => {
    expect(pathWord(faces, [0, 1, 2, 3])).toBe('QuEEN')
  })

  it('is empty for an empty path', () => {
    expect(pathWord(faces, [])).toBe('')
  })
})

describe('fast-swipe interpolation', () => {
  // Grid of centres, one per cell, spaced `spacing` px apart (row-major).
  function gridCenters(size: number, spacing = 100): Point[] {
    const c: Point[] = []
    for (let i = 0; i < size * size; i++) {
      c.push({ x: (i % size) * spacing, y: Math.floor(i / size) * spacing })
    }
    return c
  }
  const RADIUS = 40 // < half of the 100px spacing, so no ambiguous double-hits
  const STEP = 50 // half a tile width
  const n7 = (i: number) => neighbours(i, 7)

  it('captures every tile crossed along a straight row (7x7), in order', () => {
    const c = gridCenters(7)
    const from = c[21] // row 3, col 0
    const to = c[27] // row 3, col 6
    expect(crossedTiles(from, to, c, RADIUS, STEP)).toEqual([22, 23, 24, 25, 26, 27])
    expect(extendPathThroughSegment([21], from, to, c, RADIUS, STEP, n7)).toEqual([
      21, 22, 23, 24, 25, 26, 27,
    ])
  })

  it('captures a diagonal crossing of the grid (7x7), in order', () => {
    const c = gridCenters(7)
    const from = c[0] // top-left
    const to = c[48] // bottom-right
    expect(extendPathThroughSegment([0], from, to, c, RADIUS, STEP, n7)).toEqual([
      0, 8, 16, 24, 32, 40, 48,
    ])
  })

  it('rejects a non-adjacent jump when interpolation yields no bridge', () => {
    // Two far-apart tiles that are NOT adjacent; the finger "jumped" between them.
    const c: Point[] = [
      { x: 0, y: 0 },
      { x: 500, y: 0 },
    ]
    const notAdjacent = () => [] as number[]
    // The segment crosses only the destination tile (no interpolated bridge).
    expect(crossedTiles(c[0], c[1], c, RADIUS, STEP)).toEqual([1])
    // ...and because tile 1 is not adjacent to tile 0, it is rejected — not bridged.
    expect(extendPathThroughSegment([0], c[0], c[1], c, RADIUS, STEP, notAdjacent)).toEqual([0])
  })
})
