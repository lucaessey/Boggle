import { describe, it, expect } from 'vitest'
import { roundTiming } from './roundTiming'

// startAt = 1000ms, countdown 3s, round 60s.
// countdown ends at 4000; round ends at 64000.
const START = 1000

describe('roundTiming (synced from server time)', () => {
  it('is in countdown before the countdown ends, showing 3/2/1', () => {
    expect(roundTiming(START, START, 3, 60).phase).toBe('countdown')
    expect(roundTiming(START, START, 3, 60).countdownRemaining).toBe(3)
    expect(roundTiming(START + 2500, START, 3, 60).countdownRemaining).toBe(1)
  })

  it('is playing between countdown end and round end, with the shared remaining', () => {
    const t = roundTiming(START + 3000, START, 3, 60) // exactly at countdown end
    expect(t.phase).toBe('playing')
    expect(t.playRemaining).toBe(60)
    expect(roundTiming(START + 3000 + 2000, START, 3, 60).playRemaining).toBe(58)
  })

  it('is ended at/after the round end', () => {
    expect(roundTiming(START + 3000 + 60000, START, 3, 60).phase).toBe('ended')
    expect(roundTiming(START + 99999, START, 3, 60).phase).toBe('ended')
  })

  it('two clients with the same server time agree exactly', () => {
    const a = roundTiming(START + 30000, START, 3, 60)
    const b = roundTiming(START + 30000, START, 3, 60)
    expect(a).toEqual(b)
  })
})
