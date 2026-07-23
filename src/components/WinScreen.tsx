import { useEffect } from 'react'
import balance from '../balance.json'
import { Confetti } from './Confetti'
import type { FoundWord } from './useGamePlay'

const WIN_SECONDS = balance.peaceful.winScreenSeconds

interface WinScreenProps {
  score: number
  found: FoundWord[]
  totalWords: number
  /** Return to the menu (auto after the duration, or on tap/keypress). */
  onDone: () => void
}

/**
 * Full-screen "You win!" celebration. Auto-dismisses to the menu after
 * `winScreenSeconds`; a tap or any key skips ahead early.
 */
export function WinScreen({ score, found, totalWords, onDone }: WinScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, WIN_SECONDS * 1000)
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [onDone])

  return (
    <div className="win-screen" role="dialog" aria-label="You win">
      <Confetti />
      <div className="win-content">
        <h2 className="win-title">You win!</h2>
        <p className="win-stats">
          {found.length} of {totalWords} words · {score} points
        </p>
        <p className="win-hint">tap to continue</p>
      </div>
    </div>
  )
}
