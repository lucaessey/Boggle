/**
 * Pure, DOM-free board primitives, generalised over board size.
 *
 * `neighbours` works for any N×N grid. `generateRawBoard` produces a single
 * candidate board from the size's letter source in balance.json (dice for 4/6,
 * a frequency-weighted bag for 7), driven by a seeded RNG. Quality-guaranteed
 * generation (reroll until targets are met) lives in ./generate.ts.
 */
import balance from '../../balance.json'
import { Rng } from './rng'
import type { Board, Cell, Face } from './types'

/** Per-size config block from balance.json. */
interface SizeConfig {
  tileHitRadiusPx: number
  targets?: { minLength: number; count: number }[]
  dice?: Face[][]
  bag?: Record<string, number>
  vowelMin?: number
}

const SIZES = balance.sizes as Record<string, SizeConfig>
const VOWELS: readonly string[] = balance.vowels

/** Config for a size, or throw if the size is not configured. */
export function sizeConfig(size: number): SizeConfig {
  const cfg = SIZES[String(size)]
  if (!cfg) throw new Error(`No balance.json config for board size ${size}`)
  return cfg
}

/**
 * Neighbours of a cell on an N×N board: the indices of its up-to-8 orthogonal
 * and diagonal neighbours. Corner cells have 3, edge cells 5, interior 8.
 */
export function neighbours(cellIndex: number, size: number): number[] {
  const row = Math.floor(cellIndex / size)
  const col = cellIndex % size
  const result: number[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < size && c >= 0 && c < size) {
        result.push(r * size + c)
      }
    }
  }
  return result
}

/** Fisher-Yates shuffle of a copy of `items`, driven by the seeded RNG. */
function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.intBetween(0, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Dice-based faces: assign dice to cells (shuffled) and roll one face each. */
function rollDiceFaces(dice: Face[][], size: number, rng: Rng): Cell[] {
  const cellCount = size * size
  const dieOrder = shuffled([...Array(cellCount).keys()], rng)
  return dieOrder.map((dieIndex, index) => {
    const die = dice[dieIndex]
    return {
      index,
      row: Math.floor(index / size),
      col: index % size,
      dieIndex,
      face: die[rng.intBetween(0, die.length)],
    }
  })
}

/** Expand a bag distribution ({letter: count}) into a flat array of faces. */
function expandBag(bag: Record<string, number>): Face[] {
  const out: Face[] = []
  for (const [face, count] of Object.entries(bag)) {
    for (let i = 0; i < count; i++) out.push(face)
  }
  return out
}

/**
 * Bag-based faces: draw `size*size` tiles without replacement from the bag,
 * reshuffling until at least `vowelMin` vowels are present. Deterministic given
 * the RNG. Falls back to the best (most-vowel) draw if the floor can't be met
 * within a bounded number of attempts.
 */
function drawBagFaces(
  bag: Record<string, number>,
  size: number,
  vowelMin: number,
  rng: Rng,
): Cell[] {
  const cellCount = size * size
  const pool = expandBag(bag)
  const isVowel = (f: Face) => VOWELS.includes(f)

  let best: Face[] | null = null
  let bestVowels = -1
  for (let attempt = 0; attempt < 200; attempt++) {
    const draw = shuffled(pool, rng).slice(0, cellCount)
    const vowels = draw.filter(isVowel).length
    if (vowels >= vowelMin) {
      best = draw
      break
    }
    if (vowels > bestVowels) {
      bestVowels = vowels
      best = draw
    }
  }
  const faces = best as Face[]
  return faces.map((face, index) => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
    face,
  }))
}

/** Build a single candidate board for `size` from its configured letter source. */
export function generateRawBoard(size: number, rng: Rng, seed: number | string): Board {
  const cfg = sizeConfig(size)
  let cells: Cell[]
  if (cfg.dice) {
    cells = rollDiceFaces(cfg.dice, size, rng)
  } else if (cfg.bag) {
    cells = drawBagFaces(cfg.bag, size, cfg.vowelMin ?? 0, rng)
  } else {
    throw new Error(`Size ${size} has no dice or bag letter source`)
  }
  return { size, cells, seed }
}
