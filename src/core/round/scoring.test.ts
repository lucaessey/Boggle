import { describe, it, expect } from 'vitest'
import balance from '../../balance.json'
import { scoreForWord } from './scoring'

describe('scoreForWord (linear)', () => {
  it('scores lengths 3 through 12 linearly with no cap', () => {
    const expected: Record<number, number> = {
      3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10,
    }
    for (let len = 3; len <= 12; len++) {
      expect(scoreForWord('a'.repeat(len))).toBe(expected[len])
    }
  })

  it('scores 0 below minLength', () => {
    expect(scoreForWord('ab')).toBe(0)
    expect(scoreForWord('a')).toBe(0)
    expect(scoreForWord('')).toBe(0)
  })

  it('is derived entirely from the balance.json scoring config', () => {
    const { minLength, basePoints, pointsPerExtraLetter } = balance.scoring
    for (const len of [3, 6, 9, 12]) {
      const expected = basePoints + (len - minLength) * pointsPerExtraLetter
      expect(scoreForWord('a'.repeat(len))).toBe(expected)
    }
  })

  it('counts both letters of a "Qu" word (queen = 5 -> 3)', () => {
    expect(scoreForWord('queen')).toBe(3)
  })
})
