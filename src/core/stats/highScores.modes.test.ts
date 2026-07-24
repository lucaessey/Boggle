import { describe, expect, it } from 'vitest'
import { considerHighScore, getHighScore, type HighScores, highScoreKey } from './highScores'
import type { HighScoreRecord } from './stats'

const rec = (score: number): HighScoreRecord => ({
  score,
  wordsFound: score,
  longestWord: 'test',
  date: '2026-01-01T00:00:00.000Z',
})

describe('high-score keys per mode', () => {
  it('Normal keeps the legacy key; other modes are suffixed', () => {
    expect(highScoreKey(4, 60, 'normal')).toBe('4x60')
    expect(highScoreKey(4, 60)).toBe('4x60') // default is normal
    expect(highScoreKey(4, 60, 'blitz')).toBe('4x60:blitz')
    expect(highScoreKey(5, 180, 'long')).toBe('5x180:long')
    expect(highScoreKey(6, 120, 'bonus')).toBe('6x120:bonus')
  })
})

describe('records are keyed per mode and do not overwrite each other', () => {
  it('a Blitz record does not touch the Normal record for the same size+length', () => {
    // A legacy Normal record saved before modes existed.
    const legacy: HighScores = { '4x60': rec(100) }

    const afterBlitz = considerHighScore(legacy, 4, 60, rec(50), 'blitz')
    expect(afterBlitz.isNewBest).toBe(true)
    // Normal record is untouched (migration: pre-existing record survives).
    expect(getHighScore(afterBlitz.scores, 4, 60, 'normal')?.score).toBe(100)
    // Blitz got its own slot.
    expect(getHighScore(afterBlitz.scores, 4, 60, 'blitz')?.score).toBe(50)
  })

  it('each mode holds an independent best', () => {
    let scores: HighScores = {}
    for (const [mode, score] of [
      ['normal', 10],
      ['blitz', 20],
      ['long', 30],
      ['bonus', 40],
    ] as const) {
      scores = considerHighScore(scores, 4, 90, rec(score), mode).scores
    }
    expect(getHighScore(scores, 4, 90, 'normal')?.score).toBe(10)
    expect(getHighScore(scores, 4, 90, 'blitz')?.score).toBe(20)
    expect(getHighScore(scores, 4, 90, 'long')?.score).toBe(30)
    expect(getHighScore(scores, 4, 90, 'bonus')?.score).toBe(40)
  })

  it('pre-existing Normal record is not replaced by a lower Normal score', () => {
    const legacy: HighScores = { '4x60': rec(100) }
    const result = considerHighScore(legacy, 4, 60, rec(80), 'normal')
    expect(result.isNewBest).toBe(false)
    expect(getHighScore(result.scores, 4, 60, 'normal')?.score).toBe(100)
  })
})
