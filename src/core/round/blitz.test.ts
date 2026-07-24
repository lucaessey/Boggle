import { describe, expect, it } from 'vitest'
import {
  BLITZ_BONUS_SECONDS,
  BLITZ_START_SECONDS,
  clockAfterSubmit,
  initialClockSeconds,
} from './blitz'

describe('Blitz clock', () => {
  it('starts at its configured start time (default 30)', () => {
    expect(BLITZ_START_SECONDS).toBe(30)
    expect(BLITZ_BONUS_SECONDS).toBe(3)
  })

  it('IGNORES the round length chosen on the previous screen', () => {
    for (const chosen of [60, 90, 120, 180, 240, 300]) {
      expect(initialClockSeconds('blitz', chosen)).toBe(BLITZ_START_SECONDS)
    }
  })

  it('uses the chosen length for every non-Blitz mode', () => {
    expect(initialClockSeconds('normal', 180)).toBe(180)
    expect(initialClockSeconds('long', 90)).toBe(90)
    expect(initialClockSeconds('bonus', 240)).toBe(240)
  })

  it('adds exactly the bonus seconds per accepted word', () => {
    expect(clockAfterSubmit('blitz', 30, true)).toBe(33)
    expect(clockAfterSubmit('blitz', 33, true)).toBe(36)
  })

  it('adds nothing for a rejected word', () => {
    expect(clockAfterSubmit('blitz', 30, false)).toBe(30)
  })

  it('never changes the clock in non-Blitz modes', () => {
    expect(clockAfterSubmit('normal', 30, true)).toBe(30)
    expect(clockAfterSubmit('long', 30, true)).toBe(30)
  })

  it('runs down to exactly zero and ends there', () => {
    // Simulate: start Blitz, accept two words, then tick every second to zero.
    let t = initialClockSeconds('blitz', 300) // 30, chosen length ignored
    t = clockAfterSubmit('blitz', t, true) // 33
    t = clockAfterSubmit('blitz', t, true) // 36
    const decrement = (s: number) => Math.max(0, s - 1)
    let ticks = 0
    while (t > 0) {
      t = decrement(t)
      ticks++
    }
    expect(t).toBe(0) // ends at zero, no negative overshoot
    expect(ticks).toBe(36) // 30 + 3 + 3
  })
})
