/**
 * Pure, DOM-free game-mode registry. The four modes and all their tunables live
 * in balance.json; this module gives them a typed surface for the rest of the
 * app. `blitz` requires a clock, so it is unavailable in Peaceful.
 */
import balance from '../../balance.json'

export type GameModeId = 'normal' | 'blitz' | 'long' | 'bonus'

interface ModeMeta {
  name: string
  desc: string
  requiresClock?: boolean
}

const MODES = balance.gameModes as unknown as Record<string, ModeMeta> & {
  order: GameModeId[]
}

/** All mode ids in display order. */
export const MODE_ORDER: GameModeId[] = MODES.order

export function isGameModeId(value: unknown): value is GameModeId {
  return typeof value === 'string' && MODE_ORDER.includes(value as GameModeId)
}

/** Display metadata (name + one-line description) for a mode. */
export function modeMeta(id: GameModeId): ModeMeta {
  return MODES[id]
}

/** Blitz needs a clock, so it cannot run in Peaceful (no timer). */
export function requiresClock(id: GameModeId): boolean {
  return modeMeta(id).requiresClock === true
}

// Per-mode tunables, read once from balance.json.
export const LONG_MODE_MIN_LENGTH: number = balance.gameModes.long.minLength
export const LONG_MODE_MIN_BOARD_WORDS: number = balance.gameModes.long.minBoardWords

/** The minimum accepted word length for a mode (Long Words Only raises it). */
export function minWordLengthForMode(id: GameModeId, baseMin: number): number {
  return id === 'long' ? LONG_MODE_MIN_LENGTH : baseMin
}
