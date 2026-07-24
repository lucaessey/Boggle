import { useState } from 'react'
import { ACHIEVEMENTS, TOTAL_ACHIEVEMENTS } from '../core/stats/achievements'
import { useAchievements } from './AchievementsContext'
import './AchievementsScreen.css'

const MORE_BY_CREATOR = [
  { emoji: '⚡', name: 'Wordventure', url: 'https://lucaessey.github.io/wordventure/' },
  { emoji: '🐍', name: 'Snake', url: 'https://lucaessey.github.io/phaser-snake/' },
]

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export function AchievementsScreen({ onBack }: { onBack: () => void }) {
  const { stats, reset } = useAchievements()
  const { unlocked, totalAcceptedWords } = stats.lifetime
  const unlockedCount = Object.keys(unlocked).length
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="achievements">
      <header className="ach-header">
        <button type="button" className="back" onClick={onBack}>
          ← Back
        </button>
        <h2>
          Achievements <span className="ach-count">{unlockedCount}/{TOTAL_ACHIEVEMENTS}</span>
        </h2>
      </header>

      <ul className="ach-list">
        {ACHIEVEMENTS.map((a) => {
          const unlockDate = unlocked[a.id]
          const isUnlocked = Boolean(unlockDate)
          return (
            <li key={a.id} className={`ach-item${isUnlocked ? ' unlocked' : ' locked'}`}>
              <span className="ach-icon" aria-hidden="true">
                {isUnlocked ? '🏆' : '🔒'}
              </span>
              <div className="ach-text">
                <span className="ach-name">{a.name}</span>
                {/* Description (how to unlock) is shown whether locked or unlocked. */}
                <span className="ach-desc">{a.description}</span>
                {a.milestone !== undefined && (
                  <span className="ach-progress">
                    {Math.min(totalAcceptedWords, a.milestone)} / {a.milestone}
                  </span>
                )}
                {isUnlocked && <span className="ach-date">Unlocked {formatDate(unlockDate)}</span>}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="ach-reset">
        {confirming ? (
          <div className="ach-confirm" role="alertdialog" aria-label="Reset achievements?">
            <span>Reset all achievements and stats?</span>
            <div className="ach-confirm-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  reset()
                  setConfirming(false)
                }}
              >
                Reset
              </button>
              <button type="button" className="back" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="back" onClick={() => setConfirming(true)}>
            Reset achievements
          </button>
        )}
      </div>

      <section className="more-by">
        <h3>More by this creator</h3>
        {MORE_BY_CREATOR.map((game) => (
          <a
            key={game.url}
            className="more-row"
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="more-emoji" aria-hidden="true">
              {game.emoji}
            </span>
            <span className="more-name">{game.name}</span>
            <span className="more-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </section>
    </div>
  )
}
