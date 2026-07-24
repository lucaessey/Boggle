import { ACHIEVEMENTS } from '../core/stats/achievements'

/** A single non-blocking achievement-unlock toast. */
export function Toast({ id }: { id: string }) {
  const def = ACHIEVEMENTS.find((a) => a.id === id)
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
