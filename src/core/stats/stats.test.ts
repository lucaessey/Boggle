import { describe, it, expect } from 'vitest'
import {
  evaluate,
  initialStats,
  startRound,
  type AchievementEvent,
  type Stats,
} from './stats'

const acc = (
  word: string,
  opts: { points?: number; straightLine?: boolean; at?: number } = {},
): AchievementEvent => ({
  type: 'accepted',
  word,
  points: opts.points ?? 1,
  straightLine: opts.straightLine ?? false,
  at: opts.at ?? 0,
})
const rej = (at = 0): AchievementEvent => ({ type: 'rejected', at })
const ended = (
  size: number,
  length: number | null,
  mode: 'timed' | 'peaceful' = 'timed',
  at = 0,
): AchievementEvent => ({ type: 'round-ended', size, length, mode, at })

/** Apply events in order, collecting every newly-unlocked id. */
function run(events: AchievementEvent[], stats0: Stats = startRound(initialStats(), 0)) {
  let s = stats0
  const unlocked: string[] = []
  for (const e of events) {
    const r = evaluate(s, e)
    s = r.stats
    unlocked.push(...r.unlocked)
  }
  return { stats: s, unlocked }
}

describe('achievement triggers (exact, not one step short)', () => {
  it('First Blood: first word within the window, not just outside it', () => {
    expect(run([acc('cat', { at: 5000 })]).unlocked).toContain('first-blood')
    expect(run([acc('cat', { at: 5001 })]).unlocked).not.toContain('first-blood')
    // Only the FIRST word counts: a fast 2nd word after a slow 1st does not.
    expect(run([acc('cat', { at: 6000 }), acc('dog', { at: 6100 })]).unlocked).not.toContain(
      'first-blood',
    )
  })

  it('Century: 100 in a round, not 99', () => {
    expect(run([acc('a', { points: 100 })]).unlocked).toContain('century')
    expect(run([acc('a', { points: 99 })]).unlocked).not.toContain('century')
  })

  it('Qu-riosity: a Qu word only', () => {
    expect(run([acc('quiz')]).unlocked).toContain('qu-riosity')
    expect(run([acc('cat')]).unlocked).not.toContain('qu-riosity')
  })

  it('Long Haul: 8+ letters, not 7', () => {
    expect(run([acc('elephant')]).unlocked).toContain('long-haul') // 8
    expect(run([acc('cheetah')]).unlocked).not.toContain('long-haul') // 7
  })

  it('Perfectionist: 5 accepted and 0 rejected at round end', () => {
    const five = [acc('a'), acc('b'), acc('c'), acc('d'), acc('e'), ended(4, 60)]
    expect(run(five).unlocked).toContain('perfectionist')
  })

  it('Perfectionist does NOT unlock with fewer than 5 accepted words', () => {
    const four = [acc('a'), acc('b'), acc('c'), acc('d'), ended(4, 60)]
    expect(run(four).unlocked).not.toContain('perfectionist')
  })

  it('Perfectionist does NOT unlock if any word was rejected', () => {
    const withReject = [acc('a'), acc('b'), acc('c'), acc('d'), acc('e'), rej(), ended(4, 60)]
    expect(run(withReject).unlocked).not.toContain('perfectionist')
  })

  it('Scattershot: 20 invalid, not 19', () => {
    expect(run(Array.from({ length: 20 }, () => rej())).unlocked).toContain('scattershot')
    expect(run(Array.from({ length: 19 }, () => rej())).unlocked).not.toContain('scattershot')
  })

  it('Rapid Fire uses a ROLLING window, not fixed 10s buckets', () => {
    // 5 words at 0,3000,6000,9000,11000 — no rolling 10s window holds all 5.
    const first5 = [
      acc('a', { at: 0 }),
      acc('b', { at: 3000 }),
      acc('c', { at: 6000 }),
      acc('d', { at: 9000 }),
      acc('e', { at: 11000 }),
    ]
    expect(run(first5).unlocked).not.toContain('rapid-fire')
    // A 6th at 12000 makes 3000..12000 hold 5 words → unlock (fixed buckets would miss it).
    expect(run([...first5, acc('f', { at: 12000 })]).unlocked).toContain('rapid-fire')
  })

  it('Grand Tour: a round at all four sizes, not three', () => {
    expect(run([ended(4, 60), ended(5, 60), ended(6, 60)]).unlocked).not.toContain('grand-tour')
    expect(
      run([ended(4, 60), ended(5, 60), ended(6, 60), ended(7, 60)]).unlocked,
    ).toContain('grand-tour')
  })

  it('Clock Watcher: all six timed lengths; Peaceful does not count', () => {
    const fiveTimedPlusPeaceful = [
      ended(4, 60),
      ended(4, 90),
      ended(4, 120),
      ended(4, 180),
      ended(4, 240),
      ended(4, null, 'peaceful'),
    ]
    expect(run(fiveTimedPlusPeaceful).unlocked).not.toContain('clock-watcher')
    expect(run([...fiveTimedPlusPeaceful, ended(4, 300)]).unlocked).toContain('clock-watcher')
  })

  it('No Vowels Required: Y is allowed, real vowels are not', () => {
    expect(run([acc('cry')]).unlocked).toContain('no-vowels')
    expect(run([acc('nth')]).unlocked).toContain('no-vowels')
    expect(run([acc('cat')]).unlocked).not.toContain('no-vowels')
  })

  it('Palindrome: 3+ letters, not 2', () => {
    expect(run([acc('tot')]).unlocked).toContain('palindrome')
    expect(run([acc('aa')]).unlocked).not.toContain('palindrome') // too short
    expect(run([acc('cat')]).unlocked).not.toContain('palindrome')
  })

  it('Mirror Match: a word and its reverse; a palindrome alone does NOT count', () => {
    expect(run([acc('star'), acc('rats')]).unlocked).toContain('mirror-match')
    expect(run([acc('level')]).unlocked).not.toContain('mirror-match') // palindrome only
    expect(run([acc('tot')]).unlocked).not.toContain('mirror-match')
  })

  it('Straight Shooter: 4+ letters in a straight line, not a shorter or bent path', () => {
    expect(run([acc('star', { straightLine: true })]).unlocked).toContain('straight-shooter')
    expect(run([acc('cat', { straightLine: true })]).unlocked).not.toContain('straight-shooter') // 3
    expect(run([acc('star', { straightLine: false })]).unlocked).not.toContain('straight-shooter')
  })

  it('Word Collector milestones unlock at exactly their thresholds', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => acc(`w${i}`))
    expect(run(many(99)).unlocked).not.toContain('collector-1')
    expect(run(many(100)).unlocked).toContain('collector-1')
    const at500 = run(many(500)).unlocked
    expect(at500).toEqual(
      expect.arrayContaining(['collector-1', 'collector-2', 'collector-3', 'collector-4', 'collector-5']),
    )
    // Lifetime count is cumulative and independent of rounds.
    expect(run(many(250)).stats.lifetime.totalAcceptedWords).toBe(250)
  })

  it('never re-reports an already-unlocked achievement', () => {
    const s1 = evaluate(startRound(initialStats(), 0), acc('quiz'))
    expect(s1.unlocked).toContain('qu-riosity')
    const s2 = evaluate(s1.stats, acc('quiz'))
    expect(s2.unlocked).not.toContain('qu-riosity')
  })
})
