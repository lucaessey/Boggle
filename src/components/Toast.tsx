import { ACHIEVEMENTS } from '../core/stats/achievements'

/** A queued toast: an achievement unlock or a new personal best. */
export type ToastItem = { kind: 'achievement'; id: string } | { kind: 'best' }

/** A single non-blocking toast (achievement unlock or personal best). */
export function Toast({ item }: { item: ToastItem }) {
  if (item.kind === 'best') {
    return (
      <div className="toast-host" aria-live="polite">
        <div className="toast">
          <span className="toast-icon" aria-hidden="true">
            🏅
          </span>
          <span className="toast-body">
            <span className="toast-kicker">New personal best</span>
            <span className="toast-name">NEW PERSONAL BEST</span>
          </span>
        </div>
      </div>
    )
  }

  const def = ACHIEVEMENTS.find((a) => a.id === item.id)
  if (!def) return null
  return (
    <div className="toast-host" aria-live="polite">
      <div className="toast">
        <span className="toast-icon" aria-hidden="true">
          🏆
        </span>
        <span className="toast-body">
          <span className="toast-kicker">Achievement unlocked</span>
          <span className="toast-name">{def.name}</span>
        </span>
      </div>
    </div>
  )
}
