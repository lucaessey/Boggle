/**
 * Pure, DOM-free leaderboard logic: board keys, independent personal-best
 * merging, and descending ranking with a hard 50-entry cap. No Firebase here —
 * the net layer feeds raw rows in and writes what these functions decide.
 */

export const MAX_ENTRIES = 50

export type Metric = 'score' | 'words'

/** A player's two independent personal bests for one board. */
export interface StoredBest {
  score: number
  words: number
}

/** One round's raw solo result offered to the leaderboard. */
export interface RoundResult {
  score: number
  words: number
}

/** A stored row plus its owning uid, as read back from the database. */
export interface LeaderboardEntry {
  uid: string
  name: string
  score: number
  words: number
  updatedAt: number
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number
}

/** The 24 leaderboard keys are `{size}x{seconds}` (e.g. `5x180`). */
export function boardKey(size: number, seconds: number): string {
  return `${size}x${seconds}`
}

/**
 * Independent personal bests: score and words each improve on their own. Returns
 * only the field(s) that STRICTLY beat the stored best, or null when neither
 * does — so the caller writes nothing on a round that improves nothing. A first
 * entry (existing null) writes both.
 */
export function personalBestUpdate(
  existing: StoredBest | null,
  round: RoundResult,
): Partial<StoredBest> | null {
  if (!existing) return { score: round.score, words: round.words }
  const update: Partial<StoredBest> = {}
  if (round.score > existing.score) update.score = round.score
  if (round.words > existing.words) update.words = round.words
  return Object.keys(update).length > 0 ? update : null
}

/**
 * Sort entries by the chosen metric descending, cap at 50, and assign 1-based
 * ranks. Ties break toward the earlier `updatedAt` (achieved-first ranks
 * higher), then uid, so the order is deterministic. Never pads: the output has
 * exactly min(entries.length, 50) rows.
 */
export function rankEntries(entries: LeaderboardEntry[], metric: Metric): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => {
    const byMetric = b[metric] - a[metric]
    if (byMetric !== 0) return byMetric
    const byTime = a.updatedAt - b.updatedAt
    if (byTime !== 0) return byTime
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0
  })
  return sorted.slice(0, MAX_ENTRIES).map((entry, i) => ({ ...entry, rank: i + 1 }))
}
