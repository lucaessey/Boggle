/** The chosen game configuration passed from the menu to the play screen. */
export type GameConfig =
  | { size: number; mode: 'timed'; length: number }
  | { size: number; mode: 'peaceful'; goalPercentage: number }
