/**
 * Pure, DOM-free trace-path logic for drag-to-select word tracing.
 *
 * No React, no `window`/`document`. The React board component is a thin adapter
 * that feeds pointer positions in and renders the resulting path.
 */

/** A point in the same coordinate space as the tile centres passed to hitTest. */
export interface Point {
  x: number
  y: number
}

/** An ordered, repeat-free list of cell indices forming the current trace. */
export type PathState = readonly number[]

/**
 * Apply one candidate tile to the path and return the next path.
 *
 * Rules:
 * - empty path            -> start at the candidate
 * - candidate === last    -> unchanged (pointer still on the same tile)
 * - candidate === 2nd-last -> backtrack (remove the last tile)
 * - candidate already used -> unchanged (any other used tile does nothing)
 * - 8-way adjacent & unused -> append
 * - otherwise (non-adjacent) -> unchanged
 *
 * Returns the SAME array reference when nothing changes, so callers can skip
 * redundant state updates.
 */
export function extendPath(
  state: PathState,
  candidate: number,
  neighbours: (index: number) => number[],
): PathState {
  if (state.length === 0) return [candidate]

  const last = state[state.length - 1]
  if (candidate === last) return state

  const secondToLast = state.length >= 2 ? state[state.length - 2] : -1
  if (candidate === secondToLast) return state.slice(0, -1)

  if (state.includes(candidate)) return state

  if (neighbours(last).includes(candidate)) return [...state, candidate]

  return state
}

/**
 * Return the index of the tile whose centre is within `radius` of `point`,
 * choosing the nearest when several qualify. Returns null when none do.
 */
export function hitTest(
  point: Point,
  centers: readonly Point[],
  radius: number,
): number | null {
  const r2 = radius * radius
  let best: number | null = null
  let bestD2 = Infinity
  for (let i = 0; i < centers.length; i++) {
    const dx = point.x - centers[i].x
    const dy = point.y - centers[i].y
    const d2 = dx * dx + dy * dy
    if (d2 <= r2 && d2 < bestD2) {
      bestD2 = d2
      best = i
    }
  }
  return best
}

/** The traced letters for a path: the faces of its cells, in order. */
export function pathWord(faces: readonly string[], state: PathState): string {
  return state.map((i) => faces[i]).join('')
}
