import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { GameModeId } from '../core/round/modes'
import {
  considerHighScore,
  type ConsiderResult,
} from '../core/stats/highScores'
import {
  evaluate,
  initialStats,
  startRound as startRoundFn,
  type AchievementEvent,
  type HighScoreRecord,
  type Stats,
} from '../core/stats/stats'
import { clearStats, loadLifetime, saveLifetime } from './statsStore'
import { Toast, type ToastItem } from './Toast'
import './Toast.css'

interface AchievementsApi {
  stats: Stats
  startRound: (at: number) => void
  record: (event: AchievementEvent) => void
  reset: () => void
  /** Record a timed-round score; returns whether it was a new best + the previous. */
  recordHighScore: (
    size: number,
    length: number,
    candidate: HighScoreRecord,
    mode?: GameModeId,
  ) => Pick<ConsiderResult, 'isNewBest' | 'previous'>
  resetHighScores: () => void
}

const Ctx = createContext<AchievementsApi | null>(null)

export function useAchievements(): AchievementsApi {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAchievements must be used within AchievementsProvider')
  return c
}

const TOAST_MS = 2600

/**
 * Holds the stats (lifetime restored from localStorage), applies achievement and
 * high-score events, and shows unlock/personal-best toasts one at a time.
 */
export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(() => ({ ...initialStats(), lifetime: loadLifetime() }))
  const statsRef = useRef(stats)
  const [queue, setQueue] = useState<ToastItem[]>([])

  const apply = useCallback((next: Stats) => {
    statsRef.current = next
    setStats(next)
    saveLifetime(next.lifetime)
  }, [])

  const startRound = useCallback(
    (at: number) => apply(startRoundFn(statsRef.current, at)),
    [apply],
  )

  const record = useCallback(
    (event: AchievementEvent) => {
      const result = evaluate(statsRef.current, event)
      apply(result.stats)
      if (result.unlocked.length > 0) {
        setQueue((q) => [...q, ...result.unlocked.map((id): ToastItem => ({ kind: 'achievement', id }))])
      }
    },
    [apply],
  )

  const recordHighScore = useCallback(
    (size: number, length: number, candidate: HighScoreRecord, mode: GameModeId = 'normal') => {
      const cur = statsRef.current
      const result = considerHighScore(cur.lifetime.highScores, size, length, candidate, mode)
      if (result.isNewBest) {
        apply({ ...cur, lifetime: { ...cur.lifetime, highScores: result.scores } })
        setQueue((q) => [...q, { kind: 'best' }])
      }
      return { isNewBest: result.isNewBest, previous: result.previous }
    },
    [apply],
  )

  const reset = useCallback(() => {
    const fresh = initialStats()
    statsRef.current = fresh
    setStats(fresh)
    setQueue([])
    clearStats()
  }, [])

  const resetHighScores = useCallback(() => {
    const cur = statsRef.current
    // Clear high scores ONLY — leave achievements and lifetime counters intact.
    apply({ ...cur, lifetime: { ...cur.lifetime, highScores: {} } })
  }, [apply])

  // Show queued toasts one at a time (never stacked).
  useEffect(() => {
    if (queue.length === 0) return
    const id = setTimeout(() => setQueue((q) => q.slice(1)), TOAST_MS)
    return () => clearTimeout(id)
  }, [queue])

  return (
    <Ctx.Provider
      value={{ stats, startRound, record, reset, recordHighScore, resetHighScores }}
    >
      {children}
      {queue.length > 0 && <Toast item={queue[0]} />}
    </Ctx.Provider>
  )
}
