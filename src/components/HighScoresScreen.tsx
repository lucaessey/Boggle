import { useState } from 'react'
import balance from '../balance.json'
import { getHighScore } from '../core/stats/highScores'
import { useAchievements } from './AchievementsContext'
import './HighScoresScreen.css'

const SIZES = Object.keys(balance.sizes).map(Number).sort((a, b) => a - b)
const LENGTHS: number[] = [...balance.roundLengths].sort((a, b) => a - b)

// Remembered within the session (module-level, survives closing/reopening).
let sessionSize = SIZES[0]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m}:${(seconds % 60).toString().padStart(2, '0')}`
}

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

export function HighScoresScreen({ onBack }: { onBack: () => void }) {
  const { stats, resetHighScores } = useAchievements()
  const scores = stats.lifetime.highScores
  const [size, setSize] = useState(sessionSize)
  const [confirming, setConfirming] = useState(false)

  function chooseSize(s: number) {
    sessionSize = s
    setSize(s)
  }

  return (
    <div className="highscores">
      <header className="hs-header">
        <button type="button" className="back" onClick={onBack}>
          ← Back
        </button>
        <h2>High Scores</h2>
      </header>

      <div className="hs-tabs" role="tablist" aria-label="Board size">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={s === size}
            className={`hs-tab${s === size ? ' active' : ''}`}
            onClick={() => chooseSize(s)}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      <ul className="hs-rows">
        {LENGTHS.map((len) => {
          const rec = getHighScore(scores, size, len)
          return (
            <li key={len} className="hs-row">
              <span className="hs-len">{formatTime(len)}</span>
              {rec ? (
                <div className="hs-detail">
                  <span className="hs-score">{rec.score}</span>
                  <span className="hs-sub">
                    {rec.wordsFound} words · {rec.longestWord.toUpperCase()} · {formatDate(rec.date)}
                  </span>
                </div>
              ) : (
                <div className="hs-detail">
                  <span className="hs-score dash">—</span>
                  <span className="hs-sub">Not played yet</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="hs-reset">
        {confirming ? (
          <div className="hs-confirm" role="alertdialog" aria-label="Reset high scores?">
            <span>Reset all high scores?</span>
            <div className="hs-confirm-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  resetHighScores()
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
            Reset high scores
          </button>
        )}
      </div>
    </div>
  )
}
