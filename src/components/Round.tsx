import { useEffect, useState } from 'react'
import { generateBoard } from '../core/board/generate'
import { solveBoard } from '../core/dictionary/solver'
import { isStraightLine } from '../core/path/path'
import { useAchievements } from './AchievementsContext'
import { BoardTrace } from './BoardTrace'
import { Countdown } from './Countdown'
import { Results } from './Results'
import { useGamePlay } from './useGamePlay'
import './Round.css'

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
  const [totalWords, setTotalWords] = useState(0)
  const game = useGamePlay(board)
  const ach = useAchievements()

  // Countdown while running; the timer only ticks once play has begun.
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [status])

  useEffect(() => {
    if (status === 'running' && remaining <= 0) {
      setTotalWords(solveBoard(board).size)
      setStatus('over')
      ach.record({ type: 'round-ended', size, length: roundSeconds, mode: 'timed', at: Date.now() })
    }
  }, [status, remaining, board, ach, size, roundSeconds])

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
    setStatus('countdown') // fresh countdown
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
        score={game.score}
        found={game.found}
        totalWords={totalWords}
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
