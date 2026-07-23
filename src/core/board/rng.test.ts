import { describe, it, expect } from 'vitest'
import { Rng } from './rng'

function sequence(seed: number | string, n = 10): number[] {
  const rng = new Rng(seed)
  return Array.from({ length: n }, () => rng.next())
}

describe('Rng', () => {
  it('produces the same sequence for the same seed', () => {
    expect(sequence('boggle')).toEqual(sequence('boggle'))
    expect(sequence(42)).toEqual(sequence(42))
  })

  it('produces different sequences for different seeds', () => {
    expect(sequence('boggle')).not.toEqual(sequence('scrabble'))
    expect(sequence(1)).not.toEqual(sequence(2))
  })

  it('returns floats in [0, 1)', () => {
    const rng = new Rng('range')
    for (let i = 0; i < 1000; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('intBetween stays within [min, max)', () => {
    const rng = new Rng('ints')
    for (let i = 0; i < 1000; i++) {
      const v = rng.intBetween(0, 6)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(6)
    }
  })
})
