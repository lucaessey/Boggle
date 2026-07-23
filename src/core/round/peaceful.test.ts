import { describe, it, expect } from 'vitest'
import { goalCount, hasReachedGoal, progress } from './peaceful'

describe('goalCount — rounds up at each percentage', () => {
  const totals = [1, 10, 37, 100, 101, 847]
  const cases: Record<number, Record<number, number>> = {
    25: { 1: 1, 10: 3, 37: 10, 100: 25, 101: 26, 847: 212 },
    50: { 1: 1, 10: 5, 37: 19, 100: 50, 101: 51, 847: 424 },
    75: { 1: 1, 10: 8, 37: 28, 100: 75, 101: 76, 847: 636 },
    100: { 1: 1, 10: 10, 37: 37, 100: 100, 101: 101, 847: 847 },
  }
  for (const pct of [25, 50, 75, 100]) {
    for (const total of totals) {
      it(`${pct}% of ${total} -> ${cases[pct][total]}`, () => {
        expect(goalCount(total, pct)).toBe(cases[pct][total])
      })
    }
  }

  it('matches ceil(total * pct / 100) directly', () => {
    for (const total of [3, 44, 199, 500]) {
      for (const pct of [25, 50, 75, 100]) {
        expect(goalCount(total, pct)).toBe(Math.ceil((total * pct) / 100))
      }
    }
  })
})

describe('hasReachedGoal', () => {
  it('is true at the goal and beyond, false one short', () => {
    expect(hasReachedGoal(9, 10)).toBe(false) // one short
    expect(hasReachedGoal(10, 10)).toBe(true) // exactly
    expect(hasReachedGoal(11, 10)).toBe(true) // beyond
  })
})

describe('progress', () => {
  it('reports found/total and a floored percentage', () => {
    expect(progress(12, 847)).toEqual({ found: 12, total: 847, percent: 1 })
    expect(progress(0, 100)).toEqual({ found: 0, total: 100, percent: 0 })
    expect(progress(50, 100)).toEqual({ found: 50, total: 100, percent: 50 })
    expect(progress(3, 0)).toEqual({ found: 3, total: 0, percent: 0 }) // no divide-by-zero
  })
})
