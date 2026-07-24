/**
 * Pure, DOM-free Blitz-mode clock logic.
 *
 * Blitz starts at `startSeconds` (ignoring the round length chosen on the
 * previous screen) and every ACCEPTED word adds `bonusSeconds`. The round ends
 * when the clock reaches zero; there is no maximum. All values come from
 * balance.json.
 */
import balance from '../../balance.json'
import type { GameModeId } from './modes'

export const BLITZ_START_SECONDS = balance.gameModes.blitz.startSeconds
export const BLITZ_BONUS_SECONDS = balance.gameModes.blitz.bonusSeconds

/**
 * The starting clock for a timed round. Blitz uses its own fixed start and
 * IGNORES the chosen round length; every other mode uses the chosen length.
 */
export function initialClockSeconds(gameMode: GameModeId, chosenLength: number): number {
  return gameMode === 'blitz' ? BLITZ_START_SECONDS : chosenLength
}

/**
 * The clock after a submission. In Blitz, an accepted word adds exactly
 * `BLITZ_BONUS_SECONDS`; a rejected word adds nothing. In every other mode the
 * clock is unchanged by submissions.
 */
export function clockAfterSubmit(
  gameMode: GameModeId,
  remaining: number,
  accepted: boolean,
): number {
  if (gameMode === 'blitz' && accepted) return remaining + BLITZ_BONUS_SECONDS
  return remaining
}
