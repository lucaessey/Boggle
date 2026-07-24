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

/**
 * True if the path is a single straight line — every step uses the same
 * (row, col) direction vector. Requires at least two cells. A path that changes
 * direction (turns) is not straight.
 */
export function isStraightLine(path: PathState, size: number): boolean {
  if (path.length < 2) return false
  const rc = (i: number) => ({ r: Math.floor(i / size), c: i % size })
  const first = rc(path[1])
  const zero = rc(path[0])
  const dr = first.r - zero.r
  const dc = first.c - zero.c
  for (let i = 2; i < path.length; i++) {
    const a = rc(path[i - 1])
    const b = rc(path[i])
    if (b.r - a.r !== dr || b.c - a.c !== dc) return false
  }
  return true
}

/**
 * Tiles crossed by the line segment from `from` to `to`, in order, with
 * consecutive duplicates removed. The segment is sampled at intervals no larger
 * than `step` (use half a tile width) and each sample is hit-tested against the
 * tile centres — this recovers intermediate tiles that a fast flick skips over
 * because the browser reported far-apart pointer positions.
 *
 * Sampling starts just after `from` (t > 0) so the tile the path is already on
 * is not re-emitted, and includes the endpoint (t = 1).
 */
export function crossedTiles(
  from: Point,
  to: Point,
  centers: readonly Point[],
  radius: number,
  step: number,
): number[] {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  const steps = Math.max(1, Math.ceil(dist / Math.max(step, 1e-6)))
  const hits: number[] = []
  let last = -1
  for (let s = 1; s <= steps; s++) {
    const t = s / steps
    const hit = hitTest({ x: from.x + dx * t, y: from.y + dy * t }, centers, radius)
    if (hit !== null && hit !== last) {
      hits.push(hit)
      last = hit
    }
  }
  return hits
}

/**
 * Extend `path` by dragging from `from` to `to`: apply `extendPath` for each
 * tile crossed along the segment, in order. The normal adjacency and no-reuse
 * rules apply to every crossed tile, so a genuine non-adjacent jump (e.g. the
 * finger left the grid and re-entered elsewhere, leaving no interpolated tiles
 * between) is rejected rather than silently bridged.
 */
export function extendPathThroughSegment(
  path: PathState,
  from: Point,
  to: Point,
  centers: readonly Point[],
  radius: number,
  step: number,
  neighbours: (index: number) => number[],
): PathState {
  let next = path
  for (const tile of crossedTiles(from, to, centers, radius, step)) {
    next = extendPath(next, tile, neighbours)
  }
  return next
}
