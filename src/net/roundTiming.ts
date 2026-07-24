/**
 * Pure synced-round timing. `serverNow` is the estimated server time
 * (Date.now() + serverTimeOffset). Given the server-stamped `startAt`, every
 * client derives the same phase and the same remaining seconds, so the countdown
 * and the round end at the same real moment for everyone.
 */
export interface RoundTiming {
  phase: 'countdown' | 'playing' | 'ended'
  /** Countdown seconds to display (3, 2, 1); 0 once playing. */
  countdownRemaining: number
  /** Seconds left in the round. */
  playRemaining: number
}

export function roundTiming(
  serverNow: number,
  startAt: number,
  countdownSeconds: number,
  roundSeconds: number,
): RoundTiming {
  const countdownEnd = startAt + countdownSeconds * 1000
  const roundEnd = countdownEnd + roundSeconds * 1000
  if (serverNow < countdownEnd) {
    return {
      phase: 'countdown',
      countdownRemaining: Math.max(1, Math.ceil((countdownEnd - serverNow) / 1000)),
      playRemaining: roundSeconds,
    }
  }
  if (serverNow < roundEnd) {
    return {
      phase: 'playing',
      countdownRemaining: 0,
      playRemaining: Math.max(0, Math.ceil((roundEnd - serverNow) / 1000)),
    }
  }
  return { phase: 'ended', countdownRemaining: 0, playRemaining: 0 }
}
