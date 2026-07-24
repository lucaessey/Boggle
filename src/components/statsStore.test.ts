// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { evaluate, initialStats, startRound } from '../core/stats/stats'
import { clearStats, loadLifetime, saveLifetime } from './statsStore'

afterEach(() => localStorage.clear())

describe('statsStore persistence', () => {
  it('survives a localStorage round-trip with unlocks intact', () => {
    // Build some lifetime state via the evaluator, then persist it.
    let s = startRound(initialStats(), 0)
    s = evaluate(s, { type: 'accepted', word: 'quiz', points: 2, straightLine: false, at: 0 }).stats
    s = evaluate(s, { type: 'round-ended', size: 4, length: 60, mode: 'timed', at: 0 }).stats
    saveLifetime(s.lifetime)

    const loaded = loadLifetime()
    expect(loaded.totalAcceptedWords).toBe(1)
    expect(loaded.sizesPlayed).toEqual([4])
    expect(loaded.lengthsPlayed).toEqual([60])
    expect(loaded.unlocked['qu-riosity']).toBeDefined() // stays unlocked
  })

  it('clearStats resets all persisted state', () => {
    saveLifetime({
      totalAcceptedWords: 42,
      sizesPlayed: [4, 5],
      lengthsPlayed: [60],
      unlocked: { century: '2026-01-01T00:00:00.000Z' },
    })
    clearStats()
    const loaded = loadLifetime()
    expect(loaded.totalAcceptedWords).toBe(0)
    expect(loaded.sizesPlayed).toEqual([])
    expect(loaded.unlocked).toEqual({})
  })
})
