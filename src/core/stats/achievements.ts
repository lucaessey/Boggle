/**
 * Achievement definitions (data). All numeric thresholds come from balance.json
 * so they can be tuned without code changes.
 */
import balance from '../../balance.json'

const A = balance.achievements

export interface AchievementDef {
  id: string
  name: string
  description: string
  /** For the Word Collector milestones: the lifetime word threshold. */
  milestone?: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: `Find your first word within ${A.firstBloodSeconds} seconds of the round starting.`,
  },
  { id: 'century', name: 'Century', description: `Score ${A.centuryScore} points in a single round.` },
  { id: 'qu-riosity', name: 'Qu-riosity', description: 'Score a word that uses the Qu tile.' },
  {
    id: 'long-haul',
    name: 'Long Haul',
    description: `Find a word of ${A.longHaulLength} or more letters.`,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: `Finish a round with zero rejected submissions and at least ${A.perfectionistMinWords} accepted words.`,
  },
  {
    id: 'scattershot',
    name: 'Scattershot',
    description: `Submit ${A.scattershotInvalid} invalid words in a single round.`,
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    description: `Find ${A.rapidFireCount} words within any ${A.rapidFireWindowSeconds}-second window.`,
  },
  { id: 'grand-tour', name: 'Grand Tour', description: 'Play a round at all four board sizes.' },
  {
    id: 'clock-watcher',
    name: 'Clock Watcher',
    description: 'Play a round at all six timer lengths.',
  },
  {
    id: 'no-vowels',
    name: 'No Vowels Required',
    description: 'Find a word with no A, E, I, O, or U (Y is allowed).',
  },
  {
    id: 'palindrome',
    name: 'Palindrome',
    description: `Find a palindrome of ${A.palindromeMinLength} or more letters.`,
  },
  {
    id: 'mirror-match',
    name: 'Mirror Match',
    description: 'In one round, find a word and its reverse (a different word).',
  },
  {
    id: 'straight-shooter',
    name: 'Straight Shooter',
    description: `Trace a word of ${A.straightShooterMinLength}+ letters in a single straight line.`,
  },
  ...A.wordCollectorThresholds.map((threshold, i) => ({
    id: `collector-${i + 1}`,
    name: `Word Collector ${['I', 'II', 'III', 'IV', 'V'][i]}`,
    description: `Find ${threshold} words (lifetime).`,
    milestone: threshold,
  })),
]

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length
