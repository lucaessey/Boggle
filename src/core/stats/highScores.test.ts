import { describe, it, expect } from 'vitest'
import { considerHighScore, getHighScore, type HighScores } from './highScores'
import type { HighScoreRecord } from './stats'

const rec = (score: number): HighScoreRecord => ({
  score,
  wordsFound: 10,
  longestWord: 'planet',
  date: '2026-01-01T00:00:00.000Z',
})

describe('considerHighScore', () => {
  it('records the first score for an empty slot', () => {
    const r = considerHighScore({}, 4, 60, rec(50))
    expect(r.isNewBest).toBe(true)
    expect(r.previous).toBeUndefined()
    expect(getHighScore(r.scores, 4, 60)?.score).toBe(50)
  })

  it('a strictly higher score replaces the record', () => {
    const start: HighScores = { '4x60': rec(50) }
    const r = considerHighScore(start, 4, 60, rec(51))
    expect(r.isNewBest).toBe(true)
    expect(getHighScore(r.scores, 4, 60)?.score).toBe(51)
  })

  it('an equal score does NOT replace the record', () => {
    const start: HighScores = { '4x60': rec(50) }
    const r = considerHighScore(start, 4, 60, rec(50))
    expect(r.isNewBest).toBe(false)
    expect(getHighScore(r.scores, 4, 60)?.score).toBe(50)
  })

  it('a lower score does NOT replace the record', () => {
    const start: HighScores = { '4x60': rec(50) }
    const r = considerHighScore(start, 4, 60, rec(49))
    expect(r.isNewBest).toBe(false)
    expect(getHighScore(r.scores, 4, 60)?.score).toBe(50)
  })

  it('reads the previous best BEFORE writing the new one', () => {
    const start: HighScores = { '4x60': rec(40) }
    const r = considerHighScore(start, 4, 60, rec(88))
    expect(r.previous?.score).toBe(40) // previous, not the new value
    expect(getHighScore(r.scores, 4, 60)?.score).toBe(88)
  })

  it('keys by both size and length — no cross-slot overwrite', () => {
    let scores: HighScores = {}
    scores = considerHighScore(scores, 5, 120, rec(30)).scores
    // A 5x5 3:00 must not touch 5x5 2:00.
    scores = considerHighScore(scores, 5, 180, rec(99)).scores
    // A 6x6 2:00 must not touch 5x5 2:00.
    scores = considerHighScore(scores, 6, 120, rec(99)).scores
    expect(getHighScore(scores, 5, 120)?.score).toBe(30)
    expect(getHighScore(scores, 5, 180)?.score).toBe(99)
    expect(getHighScore(scores, 6, 120)?.score).toBe(99)
    expect(getHighScore(scores, 5, 60)).toBeUndefined() // never played
  })
})
