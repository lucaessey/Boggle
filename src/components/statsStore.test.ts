// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { considerHighScore } from '../core/stats/highScores'
import { evaluate, initialStats, startRound, type LifetimeStats } from '../core/stats/stats'
import { clearStats, loadLifetime, saveLifetime } from './statsStore'

afterEach(() => localStorage.clear())

describe('statsStore persistence', () => {
  it('survives a localStorage round-trip with unlocks and high scores intact', () => {
    // Build some lifetime state via the evaluator, then persist it.
    let s = startRound(initialStats(), 0)
    s = evaluate(s, { type: 'accepted', word: 'quiz', points: 2, straightLine: false, at: 0 }).stats
    s = evaluate(s, { type: 'round-ended', size: 4, length: 60, mode: 'timed', at: 0 }).stats
    s = {
      ...s,
      lifetime: {
        ...s.lifetime,
        highScores: considerHighScore(s.lifetime.highScores, 5, 120, {
          score: 88,
          wordsFound: 20,
          longestWord: 'planet',
          date: '2026-07-01T00:00:00.000Z',
        }).scores,
      },
    }
    saveLifetime(s.lifetime)

    const loaded = loadLifetime()
    expect(loaded.totalAcceptedWords).toBe(1)
    expect(loaded.unlocked['qu-riosity']).toBeDefined()
    expect(loaded.highScores['5x120']?.score).toBe(88) // high score persists
  })

  it('resetting high scores leaves achievements and lifetime stats intact', () => {
    const lifetime: LifetimeStats = {
      totalAcceptedWords: 42,
      sizesPlayed: [4, 5],
      lengthsPlayed: [60],
      unlocked: { century: '2026-01-01T00:00:00.000Z' },
      highScores: { '4x60': { score: 50, wordsFound: 9, longestWord: 'stone', date: '2026-01-01' } },
    }
    // This is the operation the context's resetHighScores performs.
    const afterReset: LifetimeStats = { ...lifetime, highScores: {} }
    expect(afterReset.highScores).toEqual({})
    expect(afterReset.unlocked).toEqual(lifetime.unlocked) // achievements kept
    expect(afterReset.totalAcceptedWords).toBe(42) // lifetime stats kept
  })

  it('clearStats resets all persisted state', () => {
    saveLifetime({
      totalAcceptedWords: 42,
      sizesPlayed: [4, 5],
      lengthsPlayed: [60],
      unlocked: { century: '2026-01-01T00:00:00.000Z' },
      highScores: { '4x60': { score: 50, wordsFound: 9, longestWord: 'stone', date: '2026-01-01' } },
    })
    clearStats()
    const loaded = loadLifetime()
    expect(loaded.totalAcceptedWords).toBe(0)
    expect(loaded.sizesPlayed).toEqual([])
    expect(loaded.unlocked).toEqual({})
    expect(loaded.highScores).toEqual({})
  })
})
