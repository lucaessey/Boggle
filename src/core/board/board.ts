/**
 * Pure, DOM-free Boggle board model.
 *
 * `generateBoard` builds a square board from the official dice defined in
 * balance.json, driven entirely by a seeded RNG so the same seed always yields
 * the same board. `neighbours` returns the up-to-8 adjacent cell indices.
 *
 * No React, no `window`/`document` — this module is unit-tested in isolation.
 */
import balance from '../../balance.json'
import { Rng } from './rng'
import type { Board, Cell, Face } from './types'

const GRID_SIZE = balance.gridSize
const DICE: readonly Face[][] = balance.dice

/**
 * Generate a board. With a `seed`, generation is deterministic: the same seed
 * reproduces an identical board (both dice-to-cell assignment and the face
 * chosen on each die are driven by the seeded RNG). Without a seed, a random
 * seed is chosen so each call differs.
 */
export function generateBoard(seed?: number | string): Board {
  const resolvedSeed = seed ?? randomSeed()
  const rng = new Rng(resolvedSeed)

  const cellCount = GRID_SIZE * GRID_SIZE

  // 1. Assign dice to cells: a seeded Fisher-Yates shuffle of die indices.
  const dieOrder = [...Array(cellCount).keys()]
  for (let i = dieOrder.length - 1; i > 0; i--) {
    const j = rng.intBetween(0, i + 1)
    ;[dieOrder[i], dieOrder[j]] = [dieOrder[j], dieOrder[i]]
  }

  // 2. For each cell, roll one face of its assigned die (seeded).
  const cells: Cell[] = dieOrder.map((dieIndex, index) => {
    const faces = DICE[dieIndex]
    const face = faces[rng.intBetween(0, faces.length)]
    return {
      index,
      row: Math.floor(index / GRID_SIZE),
      col: index % GRID_SIZE,
      dieIndex,
      face,
    }
  })

  return { size: GRID_SIZE, cells, seed: resolvedSeed }
}

/**
 * Neighbours of a cell: the indices of its up-to-8 orthogonal and diagonal
 * neighbours on a GRID_SIZE x GRID_SIZE board. Corner cells have 3, edge cells
 * 5, interior cells 8.
 */
export function neighbours(cellIndex: number): number[] {
  const row = Math.floor(cellIndex / GRID_SIZE)
  const col = cellIndex % GRID_SIZE
  const result: number[] = []

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        result.push(r * GRID_SIZE + c)
      }
    }
  }
  return result
}

/** A random seed for un-seeded generation. Only used when no seed is given. */
function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}
