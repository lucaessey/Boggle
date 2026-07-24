import { describe, it, expect } from 'vitest'
import { computeMultiplayerScores, type PlayerResult } from './multiplayerScoring'

// Fixed base so the arithmetic is obvious (each word worth 10 base points).
const base = () => 10

const p = (uid: string, words: string[]): PlayerResult => ({ uid, name: uid, words })

function totalFor(scores: ReturnType<typeof computeMultiplayerScores>, uid: string) {
  return scores.find((s) => s.uid === uid)?.total
}

describe('computeMultiplayerScores', () => {
  it('doubles a word found by exactly one player', () => {
    const scores = computeMultiplayerScores([p('a', ['cat']), p('b', ['dog'])], base)
    expect(totalFor(scores, 'a')).toBe(20) // cat unique -> 2x
    expect(totalFor(scores, 'b')).toBe(20) // dog unique -> 2x
    expect(scores.find((s) => s.uid === 'a')?.words[0].bonus).toBe(true)
  })

  it('gives base points to a word found by two players', () => {
    const scores = computeMultiplayerScores([p('a', ['cat']), p('b', ['cat'])], base)
    expect(totalFor(scores, 'a')).toBe(10) // shared -> base
    expect(totalFor(scores, 'b')).toBe(10)
    expect(scores.find((s) => s.uid === 'a')?.words[0].bonus).toBe(false)
  })

  it('computes a mixed set correctly for all players', () => {
    // cat: a only (2x). dog: a+b (base each). bird: b only (2x).
    const scores = computeMultiplayerScores(
      [p('a', ['cat', 'dog']), p('b', ['dog', 'bird'])],
      base,
    )
    expect(totalFor(scores, 'a')).toBe(20 + 10) // cat 2x + dog base
    expect(totalFor(scores, 'b')).toBe(10 + 20) // dog base + bird 2x
  })

  it('uses the injected base points (linear rule) per word', () => {
    const byLength = (w: string) => w.length
    const scores = computeMultiplayerScores([p('a', ['abcd']), p('b', ['xy', 'abcd'])], byLength)
    // abcd shared -> base (4) each; xy unique to b -> 2x (4).
    expect(totalFor(scores, 'a')).toBe(4)
    expect(totalFor(scores, 'b')).toBe(4 + 4)
  })

  it('counts each word once per player even if submitted twice, and sorts by score', () => {
    const scores = computeMultiplayerScores([p('a', ['cat', 'cat']), p('b', [])], base)
    expect(totalFor(scores, 'a')).toBe(20) // counted once, unique -> 2x
    expect(scores[0].uid).toBe('a') // leaderboard sorted desc
  })
})
