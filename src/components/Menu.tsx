import { useState } from 'react'
import balance from '../balance.json'
import type { GameConfig } from './gameConfig'
import { loadPrefs, saveLength, savePeacefulGoal, saveSize } from './prefs'
import './Menu.css'

const SIZES = Object.keys(balance.sizes).map(Number).sort((a, b) => a - b)
const ROUND_LENGTHS: number[] = balance.roundLengths
const GOAL_PERCENTAGES: number[] = balance.peaceful.goalPercentages

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface MenuProps {
  onStart: (config: GameConfig) => void
}

/**
 * Menu flow: board size → round length (six timed options + Peaceful) →
 * (Peaceful only) goal percentage → start. Back returns to the previous step;
 * last-used choices are remembered and preselected.
 */
export function Menu({ onStart }: MenuProps) {
  const prefs = loadPrefs()
  const [step, setStep] = useState<'size' | 'length' | 'goal'>('size')
  const [size, setSize] = useState<number>(
    prefs.size && SIZES.includes(prefs.size) ? prefs.size : SIZES[0],
  )

  function chooseSize(s: number) {
    setSize(s)
    saveSize(s)
    setStep('length')
  }

  function chooseLength(length: number) {
    saveLength(length)
    onStart({ size, mode: 'timed', length })
  }

  function chooseGoal(goalPercentage: number) {
    savePeacefulGoal(goalPercentage)
    onStart({ size, mode: 'peaceful', goalPercentage })
  }

  if (step === 'size') {
    return (
      <div className="menu">
        <h2>Board size</h2>
        <div className="menu-options sizes">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`menu-button${s === size ? ' preselected' : ''}`}
              onClick={() => chooseSize(s)}
            >
              {s} × {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'length') {
    return (
      <div className="menu">
        <h2>Round length</h2>
        <div className="menu-options lengths">
          {ROUND_LENGTHS.map((len) => (
            <button
              key={len}
              type="button"
              className={`menu-button${len === prefs.length ? ' preselected' : ''}`}
              onClick={() => chooseLength(len)}
            >
              {formatTime(len)}
            </button>
          ))}
        </div>
        <button type="button" className="menu-button peaceful-option" onClick={() => setStep('goal')}>
          🕊 Peaceful · no timer
        </button>
        <button type="button" className="back" onClick={() => setStep('size')}>
          ← Back
        </button>
      </div>
    )
  }

  // step === 'goal'
  return (
    <div className="menu">
      <h2>Peaceful goal</h2>
      <p className="menu-sub">Find this share of the board's words to win.</p>
      <div className="menu-options goals">
        {GOAL_PERCENTAGES.map((pct) => (
          <button
            key={pct}
            type="button"
            className={`menu-button${pct === prefs.peacefulGoal ? ' preselected' : ''}`}
            onClick={() => chooseGoal(pct)}
          >
            {pct}%
          </button>
        ))}
      </div>
      <button type="button" className="back" onClick={() => setStep('length')}>
        ← Back
      </button>
    </div>
  )
}
