import { describe, expect, it } from 'vitest'
import {
  boardKey,
  type LeaderboardEntry,
  personalBestUpdate,
  rankEntries,
} from './leaderboard'

describe('boardKey', () => {
  it('encodes size and seconds as {size}x{seconds}', () => {
    expect(boardKey(5, 180)).toBe('5x180')
    expect(boardKey(4, 60)).toBe('4x60')
    expect(boardKey(7, 300)).toBe('7x300')
  })

  it('keeps every size/length combination on its own board', () => {
    const keys = new Set<string>()
    for (const size of [4, 5, 6, 7]) {
      for (const seconds of [60, 90, 120, 180, 240, 300]) keys.add(boardKey(size, seconds))
    }
    expect(keys.size).toBe(24) // no collisions
    // A 5x5 180s result never lands on another board.
    expect(boardKey(5, 180)).not.toBe(boardKey(5, 120))
    expect(boardKey(5, 180)).not.toBe(boardKey(6, 180))
  })
})

describe('personalBestUpdate — independent bests', () => {
  it('writes both fields for a first entry', () => {
    expect(personalBestUpdate(null, { score: 42, words: 10 })).toEqual({ score: 42, words: 10 })
  })

  it('a higher score updates score only', () => {
    const existing = { score: 40, words: 12 }
    expect(personalBestUpdate(existing, { score: 55, words: 8 })).toEqual({ score: 55 })
  })

  it('a higher word count updates words only', () => {
    const existing = { score: 40, words: 12 }
    expect(personalBestUpdate(existing, { score: 30, words: 20 })).toEqual({ words: 20 })
  })

  it('improving both updates both', () => {
    const existing = { score: 40, words: 12 }
    expect(personalBestUpdate(existing, { score: 60, words: 20 })).toEqual({ score: 60, words: 20 })
  })

  it('a round that beats neither writes nothing', () => {
    const existing = { score: 40, words: 12 }
    expect(personalBestUpdate(existing, { score: 40, words: 12 })).toBeNull() // ties do not beat
    expect(personalBestUpdate(existing, { score: 10, words: 3 })).toBeNull()
  })
})

describe('rankEntries', () => {
  const mk = (uid: string, score: number, words: number, updatedAt = 0): LeaderboardEntry => ({
    uid,
    name: uid,
    score,
    words,
    updatedAt,
  })

  it('sorts descending by the chosen metric and assigns 1-based ranks', () => {
    const entries = [mk('a', 10, 5), mk('b', 30, 2), mk('c', 20, 9)]
    const byScore = rankEntries(entries, 'score')
    expect(byScore.map((e) => [e.uid, e.rank])).toEqual([
      ['b', 1],
      ['c', 2],
      ['a', 3],
    ])
    const byWords = rankEntries(entries, 'words')
    expect(byWords.map((e) => e.uid)).toEqual(['c', 'a', 'b'])
  })

  it('caps at 50 even when more entries exist', () => {
    const many = Array.from({ length: 120 }, (_, i) => mk(`u${i}`, i, i))
    const ranked = rankEntries(many, 'score')
    expect(ranked.length).toBe(50)
    expect(ranked[0].score).toBe(119) // highest first
    expect(ranked[49].rank).toBe(50)
  })

  it('renders exactly as many rows as exist when fewer than 50 — no padding', () => {
    const three = [mk('a', 3, 1), mk('b', 2, 1), mk('c', 1, 1)]
    const ranked = rankEntries(three, 'score')
    expect(ranked.length).toBe(3)
    expect(ranked.every((e) => e.uid && e.name)).toBe(true) // no invented rows
  })

  it('breaks metric ties by earliest updatedAt for determinism', () => {
    const tie = [mk('late', 10, 1, 200), mk('early', 10, 1, 100)]
    expect(rankEntries(tie, 'score').map((e) => e.uid)).toEqual(['early', 'late'])
  })
})
