/**
 * Pure, DOM-free stats + achievement evaluation. The single source of truth for
 * achievements. `evaluate(stats, event)` is a pure function so it can be
 * unit-tested without the UI; time-derived values arrive on the event (`at` in
 * ms) rather than being read from the clock here.
 *
 * Persistence (localStorage) lives in the statsStore adapter — only `lifetime`
 * is persisted; `round` is transient.
 */
import balance from '../../balance.json'

const A = balance.achievements
const ALL_SIZES = Object.keys(balance.sizes).map(Number)
const ALL_LENGTHS: number[] = balance.roundLengths

/** One timed-mode high-score record (Peaceful is never recorded). */
export interface HighScoreRecord {
  score: number
  wordsFound: number
  longestWord: string
  date: string // ISO
}

export interface LifetimeStats {
  totalAcceptedWords: number
  sizesPlayed: number[]
  lengthsPlayed: number[]
  /** achievement id -> ISO unlock date */
  unlocked: Record<string, string>
  /** "size x length" -> best record (timed rounds only). */
  highScores: Record<string, HighScoreRecord>
}

export interface RoundStats {
  startedAt: number | null
  accepted: number
  rejected: number
  score: number
  acceptTimes: number[]
  acceptedWords: string[]
}

export interface Stats {
  lifetime: LifetimeStats
  round: RoundStats
}

export function emptyLifetime(): LifetimeStats {
  return {
    totalAcceptedWords: 0,
    sizesPlayed: [],
    lengthsPlayed: [],
    unlocked: {},
    highScores: {},
  }
}

function emptyRound(startedAt: number | null = null): RoundStats {
  return { startedAt, accepted: 0, rejected: 0, score: 0, acceptTimes: [], acceptedWords: [] }
}

export function initialStats(): Stats {
  return { lifetime: emptyLifetime(), round: emptyRound() }
}

/** Begin a round: reset the per-round counters, stamping the start time. */
export function startRound(stats: Stats, at: number): Stats {
  return { ...stats, round: emptyRound(at) }
}

export type AchievementEvent =
  | { type: 'accepted'; word: string; points: number; straightLine: boolean; at: number }
  | { type: 'rejected'; at: number }
  | { type: 'round-ended'; size: number; length: number | null; mode: 'timed' | 'peaceful'; at: number }

export interface EvalResult {
  stats: Stats
  /** Achievement ids unlocked by THIS event (for toasts). */
  unlocked: string[]
}

const reverse = (s: string) => [...s].reverse().join('')
const isPalindrome = (w: string) => w.length >= A.palindromeMinLength && w === reverse(w)
const hasNoVowels = (w: string) => !/[aeiou]/.test(w)
const usesQu = (w: string) => w.includes('qu')

/**
 * Evaluate one event against the stats, returning updated stats and any newly
 * unlocked achievement ids. Idempotent per achievement (already-unlocked ones
 * are never re-reported).
 */
export function evaluate(stats: Stats, event: AchievementEvent): EvalResult {
  const lifetime: LifetimeStats = {
    ...stats.lifetime,
    sizesPlayed: [...stats.lifetime.sizesPlayed],
    lengthsPlayed: [...stats.lifetime.lengthsPlayed],
    unlocked: { ...stats.lifetime.unlocked },
  }
  const round: RoundStats = {
    ...stats.round,
    acceptTimes: [...stats.round.acceptTimes],
    acceptedWords: [...stats.round.acceptedWords],
  }
  const newly: string[] = []
  const unlock = (id: string) => {
    if (!lifetime.unlocked[id]) {
      lifetime.unlocked[id] = new Date(event.at).toISOString()
      newly.push(id)
    }
  }

  if (event.type === 'accepted') {
    const w = event.word.toLowerCase()
    round.accepted += 1
    round.score += event.points
    lifetime.totalAcceptedWords += 1

    if (
      round.accepted === 1 &&
      round.startedAt !== null &&
      event.at - round.startedAt <= A.firstBloodSeconds * 1000
    ) {
      unlock('first-blood')
    }
    if (round.score >= A.centuryScore) unlock('century')
    if (usesQu(w)) unlock('qu-riosity')
    if (w.length >= A.longHaulLength) unlock('long-haul')
    if (hasNoVowels(w)) unlock('no-vowels')
    if (isPalindrome(w)) unlock('palindrome')

    const rev = reverse(w)
    if (rev !== w && round.acceptedWords.includes(rev)) unlock('mirror-match')

    if (event.straightLine && w.length >= A.straightShooterMinLength) unlock('straight-shooter')

    round.acceptTimes.push(event.at)
    if (round.acceptTimes.length >= A.rapidFireCount) {
      const kth = round.acceptTimes[round.acceptTimes.length - A.rapidFireCount]
      if (event.at - kth <= A.rapidFireWindowSeconds * 1000) unlock('rapid-fire')
    }

    A.wordCollectorThresholds.forEach((threshold, i) => {
      if (lifetime.totalAcceptedWords >= threshold) unlock(`collector-${i + 1}`)
    })

    round.acceptedWords.push(w)
  } else if (event.type === 'rejected') {
    round.rejected += 1
    if (round.rejected >= A.scattershotInvalid) unlock('scattershot')
  } else if (event.type === 'round-ended') {
    if (round.rejected === 0 && round.accepted >= A.perfectionistMinWords) unlock('perfectionist')
    if (!lifetime.sizesPlayed.includes(event.size)) lifetime.sizesPlayed.push(event.size)
    if (event.mode === 'timed' && event.length !== null && !lifetime.lengthsPlayed.includes(event.length)) {
      lifetime.lengthsPlayed.push(event.length)
    }
    if (ALL_SIZES.every((s) => lifetime.sizesPlayed.includes(s))) unlock('grand-tour')
    if (ALL_LENGTHS.every((l) => lifetime.lengthsPlayed.includes(l))) unlock('clock-watcher')
  }

  return { stats: { lifetime, round }, unlocked: newly }
}
