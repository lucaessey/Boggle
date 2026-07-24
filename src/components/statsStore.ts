/**
 * localStorage persistence for the achievements/stats lifetime state. Guarded so
 * a missing or throwing localStorage degrades gracefully. Only `lifetime` is
 * persisted; per-round state is transient.
 */
import { emptyLifetime, type LifetimeStats } from '../core/stats/stats'

const KEY = 'boggle.stats'

export function loadLifetime(): LifetimeStats {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LifetimeStats>
      return {
        ...emptyLifetime(),
        ...parsed,
        sizesPlayed: parsed.sizesPlayed ?? [],
        lengthsPlayed: parsed.lengthsPlayed ?? [],
        unlocked: parsed.unlocked ?? {},
      }
    }
  } catch {
    // ignore: fall back to a fresh lifetime
  }
  return emptyLifetime()
}

export function saveLifetime(lifetime: LifetimeStats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lifetime))
  } catch {
    // ignore: persistence is best-effort
  }
}

export function clearStats(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
