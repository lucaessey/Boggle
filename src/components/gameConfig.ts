import type { GameModeId } from '../core/round/modes'

/** The four game modes. `blitz` requires a clock (not available in Peaceful). */
export type { GameModeId }

/** The chosen game configuration passed from the menu to the play screen. */
export type GameConfig =
  | { size: number; mode: 'timed'; length: number; gameMode: GameModeId }
  | { size: number; mode: 'peaceful'; goalPercentage: number; gameMode: GameModeId }
