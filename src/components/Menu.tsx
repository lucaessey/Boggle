import { useState } from 'react'
import balance from '../balance.json'
import { BLITZ_START_SECONDS } from '../core/round/blitz'
import { type GameModeId, MODE_ORDER, modeMeta, requiresClock } from '../core/round/modes'
import type { GameConfig } from './gameConfig'
import { useScreenBackground } from './Background'
import { HighScoresButton } from './HighScoresButton'
import { loadGameMode, loadPrefs, saveGameMode, saveLength, savePeacefulGoal, saveSize } from './prefs'
import { TrophyButton } from './TrophyButton'
import './Menu.css'

const SIZES = Object.keys(balance.sizes).map(Number).sort((a, b) => a - b)
const ROUND_LENGTHS: number[] = balance.roundLengths
const GOAL_PERCENTAGES: number[] = balance.peaceful.goalPercentages

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** What the player picked before the mode screen (drives the final config). */
type Pending =
  | { kind: 'timed'; length: number }
  | { kind: 'peaceful'; goalPercentage: number }

interface MenuProps {
  onStart: (config: GameConfig) => void
  onOpenAchievements: () => void
  onOpenHighScores: () => void
  onOpenMultiplayer: () => void
}

/**
 * Menu flow: board size → round length (six timed options + Peaceful) →
 * (Peaceful only) goal percentage → game mode → start. Back returns to the
 * previous step; last-used choices are remembered and preselected.
 */
export function Menu({
  onStart,
  onOpenAchievements,
  onOpenHighScores,
  onOpenMultiplayer,
}: MenuProps) {
  const prefs = loadPrefs()
  const [step, setStep] = useState<'size' | 'length' | 'goal' | 'mode'>('size')
  const [size, setSize] = useState<number>(
    prefs.size && SIZES.includes(prefs.size) ? prefs.size : SIZES[0],
  )
  const [pending, setPending] = useState<Pending | null>(null)
  const lastMode = loadGameMode()
  // The round-length selector uses background_1; other menu steps use background_2.
  useScreenBackground(step === 'length' ? '1' : '2')

  function chooseSize(s: number) {
    setSize(s)
    saveSize(s)
    setStep('length')
  }

  function chooseLength(length: number) {
    saveLength(length)
    setPending({ kind: 'timed', length })
    setStep('mode')
  }

  function chooseGoal(goalPercentage: number) {
    savePeacefulGoal(goalPercentage)
    setPending({ kind: 'peaceful', goalPercentage })
    setStep('mode')
  }

  function chooseMode(gameMode: GameModeId) {
    saveGameMode(gameMode)
    if (!pending) return
    if (pending.kind === 'timed') {
      onStart({ size, mode: 'timed', length: pending.length, gameMode })
    } else {
      onStart({ size, mode: 'peaceful', goalPercentage: pending.goalPercentage, gameMode })
    }
  }

  if (step === 'size') {
    return (
      <div className="menu">
        <TrophyButton onOpen={onOpenAchievements} />
        <HighScoresButton onOpen={onOpenHighScores} />
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
        <button type="button" className="menu-button multiplayer-option" onClick={onOpenMultiplayer}>
          🌐 Multiplayer
        </button>
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

  if (step === 'goal') {
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

  // step === 'mode'
  const isPeaceful = pending?.kind === 'peaceful'
  return (
    <div className="menu">
      <h2>Game mode</h2>
      <div className="menu-options modes">
        {MODE_ORDER.map((id) => {
          const meta = modeMeta(id)
          const clockOnly = requiresClock(id)
          const disabled = isPeaceful && clockOnly
          const label =
            id === 'blitz' ? `${meta.name} — starts at ${formatTime(BLITZ_START_SECONDS)}` : meta.name
          const desc = disabled ? 'Needs a clock — not available in Peaceful.' : meta.desc
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              className={`menu-button mode-button${id === lastMode && !disabled ? ' preselected' : ''}${
                disabled ? ' disabled' : ''
              }`}
              onClick={() => chooseMode(id)}
            >
              <span className="mode-name">{label}</span>
              <span className="mode-desc">{desc}</span>
            </button>
          )
        })}
      </div>
      {!isPeaceful && (
        <p className="menu-sub">Blitz uses its own clock and ignores the round length you picked.</p>
      )}
      <button
        type="button"
        className="back"
        onClick={() => setStep(isPeaceful ? 'goal' : 'length')}
      >
        ← Back
      </button>
    </div>
  )
}
