import { TOTAL_ACHIEVEMENTS } from '../core/stats/achievements'
import { useAchievements } from './AchievementsContext'
import './TrophyButton.css'

/** Trophy button with an unlocked-count badge, for the main menu's top-left. */
export function TrophyButton({ onOpen }: { onOpen: () => void }) {
  const { stats } = useAchievements()
  const unlocked = Object.keys(stats.lifetime.unlocked).length
  return (
    <button
      type="button"
      className="trophy-button"
      onClick={onOpen}
      aria-label={`Achievements: ${unlocked} of ${TOTAL_ACHIEVEMENTS} unlocked`}
    >
      <span aria-hidden="true">🏆</span>
      <span className="trophy-badge">
        {unlocked}/{TOTAL_ACHIEVEMENTS}
      </span>
    </button>
  )
}
