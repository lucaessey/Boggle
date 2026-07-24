/**
 * Pure, DOM-free, Firebase-free multiplayer scoring.
 *
 * Computed identically on every client from the complete results set:
 * - Base points per word use the existing linear rule (injected as `basePoints`).
 * - A word found by exactly ONE player is worth DOUBLE its base for that player.
 * - A word found by two or more players scores its normal base for each of them.
 */

export interface PlayerResult {
  uid: string
  name: string
  /** The player's found words (lowercased, unique within the player). */
  words: string[]
}

export interface ScoredWord {
  word: string
  points: number
  /** True when this word was unique to the player (the 2× bonus applied). */
  bonus: boolean
}

export interface PlayerScore {
  uid: string
  name: string
  total: number
  words: ScoredWord[]
}

/**
 * Score every player from the full results set. Returns a leaderboard sorted by
 * final score (descending), each entry carrying the per-word breakdown.
 */
export function computeMultiplayerScores(
  results: PlayerResult[],
  basePoints: (word: string) => number,
): PlayerScore[] {
  // How many players found each word.
  const owners = new Map<string, number>()
  for (const player of results) {
    for (const word of new Set(player.words.map((w) => w.toLowerCase()))) {
      owners.set(word, (owners.get(word) ?? 0) + 1)
    }
  }

  const scores: PlayerScore[] = results.map((player) => {
    const seen = new Set<string>()
    const words: ScoredWord[] = []
    let total = 0
    for (const raw of player.words) {
      const word = raw.toLowerCase()
      if (seen.has(word)) continue // count each word once per player
      seen.add(word)
      const unique = (owners.get(word) ?? 0) === 1
      const points = basePoints(word) * (unique ? 2 : 1)
      words.push({ word, points, bonus: unique })
      total += points
    }
    return { uid: player.uid, name: player.name, total, words }
  })

  return scores.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
}
