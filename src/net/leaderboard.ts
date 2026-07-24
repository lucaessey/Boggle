/**
 * Firebase access for the global leaderboards. Data model:
 *   /leaderboards/{size}x{seconds}/{uid} = { name, score, words, updatedAt }
 * score and words are independent personal bests; a write only happens when a
 * value actually improves. Reads use orderByChild(metric).limitToLast(50) —
 * the database rules declare .indexOn for both `score` and `words`.
 */
import {
  boardKey,
  type LeaderboardEntry,
  type Metric,
  personalBestUpdate,
  type StoredBest,
} from '../core/leaderboard/leaderboard'
import { fb } from './firebase'

/**
 * Offer a solo timed round to one board. Reads the player's stored bests, and
 * writes ONLY the fields that improve (plus name + updatedAt). Returns 'written'
 * or 'unchanged' — a round that beats neither best writes nothing.
 */
export async function submitLeaderboardScore(
  size: number,
  seconds: number,
  name: string,
  round: { score: number; words: number },
): Promise<'written' | 'unchanged'> {
  const { db, uid, rt } = await fb()
  const path = `leaderboards/${boardKey(size, seconds)}/${uid}`
  const snap = await rt.get(rt.ref(db, path))
  const raw = snap.val() as Partial<StoredBest> | null
  const existing: StoredBest | null = raw
    ? { score: Number(raw.score ?? 0), words: Number(raw.words ?? 0) }
    : null
  const update = personalBestUpdate(existing, round)
  if (!update) return 'unchanged'
  await rt.update(rt.ref(db, path), { ...update, name, updatedAt: rt.serverTimestamp() })
  return 'written'
}

/** Read up to 50 rows for one board ordered by `metric`, as raw entries. */
export async function fetchLeaderboard(
  size: number,
  seconds: number,
  metric: Metric,
): Promise<LeaderboardEntry[]> {
  const { db, rt } = await fb()
  const q = rt.query(
    rt.ref(db, `leaderboards/${boardKey(size, seconds)}`),
    rt.orderByChild(metric),
    rt.limitToLast(50),
  )
  const snap = await rt.get(q)
  const entries: LeaderboardEntry[] = []
  snap.forEach((child) => {
    const v = child.val() ?? {}
    entries.push({
      uid: child.key as string,
      name: String(v.name ?? '—'),
      score: Number(v.score ?? 0),
      words: Number(v.words ?? 0),
      updatedAt: Number(v.updatedAt ?? 0),
    })
  })
  return entries
}

/** Delete the current player's entry from every given board key (opt-out). */
export async function removeLeaderboardEntries(keys: string[]): Promise<void> {
  const { db, uid, rt } = await fb()
  const updates: Record<string, null> = {}
  for (const key of keys) updates[`leaderboards/${key}/${uid}`] = null
  await rt.update(rt.ref(db, '/'), updates)
}
