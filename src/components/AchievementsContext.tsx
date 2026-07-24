import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  evaluate,
  initialStats,
  startRound as startRoundFn,
  type AchievementEvent,
  type Stats,
} from '../core/stats/stats'
import { clearStats, loadLifetime, saveLifetime } from './statsStore'
import { Toast } from './Toast'
import './Toast.css'

interface AchievementsApi {
  stats: Stats
  startRound: (at: number) => void
  record: (event: AchievementEvent) => void
  reset: () => void
}

const Ctx = createContext<AchievementsApi | null>(null)

export function useAchievements(): AchievementsApi {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAchievements must be used within AchievementsProvider')
  return c
}

const TOAST_MS = 2600

/**
 * Holds the stats (lifetime restored from localStorage), applies achievement
 * events, and shows unlock toasts one at a time via a queue.
 */
export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(() => ({ ...initialStats(), lifetime: loadLifetime() }))
  const statsRef = useRef(stats)
  const [queue, setQueue] = useState<string[]>([])

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
      if (result.unlocked.length > 0) setQueue((q) => [...q, ...result.unlocked])
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

  // Show queued toasts one at a time (never stacked).
  useEffect(() => {
    if (queue.length === 0) return
    const id = setTimeout(() => setQueue((q) => q.slice(1)), TOAST_MS)
    return () => clearTimeout(id)
  }, [queue])

  return (
    <Ctx.Provider value={{ stats, startRound, record, reset }}>
      {children}
      {queue.length > 0 && <Toast id={queue[0]} />}
    </Ctx.Provider>
  )
}
