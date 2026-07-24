import { describe, expect, it } from 'vitest'
import type { BonusTiles } from '../board/types'
import { bonusScore, pathCrosses, scoreTracedWord } from './bonusScoring'
import { scoreForLength } from './scoring'

describe('bonusScore — length-based bonuses', () => {
  it('double letter makes a 6-letter word score as a 7-letter word', () => {
    const withBonus = bonusScore({
      baseLength: 6,
      crossesDouble: true,
      doubleFaceLen: 1,
      crossesTriple: false,
    })
    expect(withBonus).toBe(scoreForLength(7))
    expect(withBonus).toBeGreaterThan(scoreForLength(6))
  })

  it('triple word multiplies the final score by 3', () => {
    const withBonus = bonusScore({
      baseLength: 6,
      crossesDouble: false,
      doubleFaceLen: 1,
      crossesTriple: true,
    })
    expect(withBonus).toBe(scoreForLength(6) * 3)
  })

  it('both: double-letter length adjustment is applied first, then the triple', () => {
    const both = bonusScore({
      baseLength: 6,
      crossesDouble: true,
      doubleFaceLen: 1,
      crossesTriple: true,
    })
    expect(both).toBe(scoreForLength(7) * 3)
  })

  it('a "Qu" double-letter tile counts as four letters', () => {
    // "Qu" contributes 2 to the base length and, doubled, adds 2 more → +2 length.
    // e.g. a 5-letter word (QuART) crossing the Qu double tile scores as 7.
    const qu = bonusScore({
      baseLength: 5,
      crossesDouble: true,
      doubleFaceLen: 2,
      crossesTriple: false,
    })
    expect(qu).toBe(scoreForLength(7))
  })
})

describe('pathCrosses', () => {
  it('detects a tile in the path and ignores a negative index', () => {
    expect(pathCrosses([3, 7, 8], 7)).toBe(true)
    expect(pathCrosses([3, 7, 8], 4)).toBe(false)
    expect(pathCrosses([3, 7, 8], -1)).toBe(false)
  })
})

describe('scoreTracedWord — resolves bonuses from the board', () => {
  // faces for a tiny 2x2: tile 0 "Qu", others single letters.
  const faces = ['Qu', 'A', 'R', 'T']

  it('with no bonus tiles, returns the base score and no markers', () => {
    const r = scoreTracedWord('CART', [1, 2, 3], undefined, faces)
    expect(r).toEqual({ points: scoreForLength(4), doubleUsed: false, tripleUsed: false })
  })

  it('marks and scores the double-letter tile (including Qu = 4 letters)', () => {
    const bonus: BonusTiles = { doubleIndex: 0, tripleIndex: 3 }
    // Path crosses the Qu double tile (index 0) but not the triple (index 3).
    const r = scoreTracedWord('QUART', [0, 1, 2], bonus, faces) // base length 5
    expect(r.doubleUsed).toBe(true)
    expect(r.tripleUsed).toBe(false)
    expect(r.points).toBe(scoreForLength(7)) // 5 + 2 (Qu doubled)
  })

  it('marks and scores a word crossing both tiles', () => {
    const bonus: BonusTiles = { doubleIndex: 1, tripleIndex: 3 }
    const r = scoreTracedWord('CART', [1, 2, 3], bonus, faces) // base length 4
    expect(r.doubleUsed).toBe(true)
    expect(r.tripleUsed).toBe(true)
    expect(r.points).toBe(scoreForLength(5) * 3) // (4+1) then ×3
  })
})
