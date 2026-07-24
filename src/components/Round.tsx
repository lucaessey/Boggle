import { useEffect, useState } from 'react'
import { generateBoard } from '../core/board/generate'
import { isStraightLine } from '../core/path/path'
import type { HighScoreRecord } from '../core/stats/stats'
import { useAchievements } from './AchievementsContext'
import { BoardTrace } from './BoardTrace'
import { Countdown } from './Countdown'
import { Results } from './Results'
import { useBoardSolve } from './useBoardSolve'
import { type FoundWord, useGamePlay } from './useGamePlay'
import './Round.css'

/** Longest found word (alphabetical tie-break), or '' if none. */
function longestFound(found: FoundWord[]): string {
  return (
    [...found]
      .map((f) => f.word)
      .sort((a, b) => b.length - a.length || a.localeCompare(b))[0] ?? ''
  )
}

const REJECT_OUTCOMES = new Set(['too-short', 'not-a-word', 'not-on-board'])

type Status = 'countdown' | 'running' | 'over'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface RoundProps {
  size: number
  roundSeconds: number
  onChangeSettings: () => void
}

/** Timed round: countdown → play → results. The timer starts at countdown end. */
export function Round({ size, roundSeconds, onChangeSettings }: RoundProps) {
  const [board, setBoard] = useState(() => generateBoard(size))
  const [status, setStatus] = useState<Status>('countdown')
  const [remaining, setRemaining] = useState(roundSeconds)
  const game = useGamePlay(board)
  const ach = useAchievements()
  // Solve the board off the main thread once the round is over (for reveals).
  const solve = useBoardSolve(board, status === 'over')
  // Set when this round beat the record for this size+length (banner on results).
  const [personalBest, setPersonalBest] = useState<{ previous: HighScoreRecord | undefined } | null>(
    null,
  )

  // Countdown while running; the timer only ticks once play has begun.
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [status])

  useEffect(() => {
    if (status === 'running' && remaining <= 0) {
      setStatus('over')
      ach.record({ type: 'round-ended', size, length: roundSeconds, mode: 'timed', at: Date.now() })
      // High score: read the previous best, then write if strictly higher, and
      // capture the previous value for the banner — all before results render.
      const hs = ach.recordHighScore(size, roundSeconds, {
        score: game.score,
        wordsFound: game.found.length,
        longestWord: longestFound(game.found),
        date: new Date(Date.now()).toISOString(),
      })
      setPersonalBest(hs.isNewBest ? { previous: hs.previous } : null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, remaining, size, roundSeconds])

  function beginPlay() {
    game.reset()
    setRemaining(roundSeconds)
    ach.startRound(Date.now()) // round timing starts at countdown end
    setStatus('running') // timer starts now, not when the board was generated
  }

  function playAgain() {
    game.reset()
    setBoard(generateBoard(size))
    setRemaining(roundSeconds)
    setPersonalBest(null)
    setStatus('countdown') // fresh countdown; the solve resets via useBoardSolve
  }

  function handleWord(word: string, path: number[] | null) {
    if (status !== 'running') return
    const { outcome, points } = game.submit(word)
    if (outcome === 'accepted') {
      ach.record({
        type: 'accepted',
        word,
        points,
        straightLine: path !== null && isStraightLine(path, size),
        at: Date.now(),
      })
    } else if (REJECT_OUTCOMES.has(outcome)) {
      ach.record({ type: 'rejected', at: Date.now() })
    }
  }

  if (status === 'over') {
    return (
      <Results
        heading="Time!"
        board={board}
        score={game.score}
        found={game.found}
        solve={solve}
        personalBest={personalBest}
        leaderboard={{ size, seconds: roundSeconds }}
        onPlayAgain={playAgain}
        onChangeSettings={onChangeSettings}
      />
    )
  }

  return (
    <div className="round">
      <div className="hud">
        <span className="score">Score: {game.score}</span>
        <span className={`timer${remaining <= 10 && status === 'running' ? ' low' : ''}`}>
          {formatTime(remaining)}
        </span>
      </div>

      <BoardTrace
        board={board}
        onWord={handleWord}
        active={status === 'running'}
        revealed={status !== 'countdown'}
        overlay={status === 'countdown' ? <Countdown onDone={beginPlay} /> : undefined}
      />

      <div className={`feedback${game.feedback ? ` ${game.feedback.outcome}` : ''}`}>
        {game.feedback ? game.feedback.message : ' '}
      </div>

      <button type="button" className="back" onClick={onChangeSettings}>
        Change settings
      </button>

      {status === 'running' && game.found.length > 0 && (
        <section className="found">
          <h2>Found · {game.found.length}</h2>
          <ul>
            {game.found.map((f) => (
              <li key={f.word}>
                <span>{f.word}</span>
                <span className="pts">{f.points}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
