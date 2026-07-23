import { useEffect, useState } from 'react'
import { generateBoard } from '../core/board/generate'
import { solveBoard } from '../core/dictionary/solver'
import { BoardTrace } from './BoardTrace'
import { Results } from './Results'
import { useGamePlay } from './useGamePlay'
import './Round.css'

type Status = 'idle' | 'running' | 'over'

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

/** Timed single round: countdown, live submission feedback, and results. */
export function Round({ size, roundSeconds, onChangeSettings }: RoundProps) {
  const [board, setBoard] = useState(() => generateBoard(size))
  const [status, setStatus] = useState<Status>('idle')
  const [remaining, setRemaining] = useState(roundSeconds)
  const [totalWords, setTotalWords] = useState(0)
  const game = useGamePlay(board)

  // Countdown while running.
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [status])

  // End the round when the clock runs out.
  useEffect(() => {
    if (status === 'running' && remaining <= 0) {
      setTotalWords(solveBoard(board).size)
      setStatus('over')
    }
  }, [status, remaining, board])

  function startRound() {
    game.reset()
    setRemaining(roundSeconds)
    setStatus('running')
  }

  function playAgain() {
    game.reset()
    setBoard(generateBoard(size))
    setStatus('idle')
    setRemaining(roundSeconds)
  }

  function handleWord(word: string) {
    if (status !== 'running') return
    game.submit(word)
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
        {status !== 'idle' && (
          <span className={`timer${remaining <= 10 && status === 'running' ? ' low' : ''}`}>
            {formatTime(remaining)}
          </span>
        )}
      </div>

      <BoardTrace board={board} onWord={handleWord} active={status === 'running'} />

      <div className={`feedback${game.feedback ? ` ${game.feedback.outcome}` : ''}`}>
        {game.feedback ? game.feedback.message : ' '}
      </div>

      {status === 'idle' && (
        <div className="idle-controls">
          <button type="button" className="primary" onClick={startRound}>
            Start · {size}×{size} · {formatTime(roundSeconds)}
          </button>
          <button type="button" className="back" onClick={onChangeSettings}>
            Change settings
          </button>
        </div>
      )}

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
