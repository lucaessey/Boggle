import { useEffect, useState } from 'react'
import { generateBoard } from '../core/board/generate'
import { goalCount as computeGoal, hasReachedGoal } from '../core/round/peaceful'
import { BoardTrace } from './BoardTrace'
import { Results } from './Results'
import { WinScreen } from './WinScreen'
import { solveBoardAsync } from './solveAsync'
import { useGamePlay } from './useGamePlay'
import './Round.css'
import './Peaceful.css'

type Phase = 'loading' | 'playing' | 'over' | 'won'

interface PeacefulRoundProps {
  size: number
  goalPercentage: number
  onChangeSettings: () => void
}

function ProgressBar({ found, total, goal }: { found: number; total: number; goal: number }) {
  const pct = total > 0 ? Math.floor((found / total) * 100) : 0
  const fill = total > 0 ? (found / total) * 100 : 0
  const goalLeft = total > 0 ? Math.min(100, (goal / total) * 100) : 0
  return (
    <div className="progress" aria-label={`${found} of ${total} words found`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${fill}%` }} />
        <div
          className="progress-goal"
          style={{ left: `${goalLeft}%` }}
          title={`Goal: ${goal} words`}
        />
      </div>
      <div className="progress-text">
        {found} / {total} ({pct}%) · goal {goal}
      </div>
    </div>
  )
}

/**
 * Untimed, goal-based round. The board is fully solved off the main thread to
 * get the exact total word count; the player wins on reaching the goal, or can
 * End Round at any time.
 */
export function PeacefulRound({ size, goalPercentage, onChangeSettings }: PeacefulRoundProps) {
  const [board, setBoard] = useState(() => generateBoard(size))
  const [phase, setPhase] = useState<Phase>('loading')
  const [totalWords, setTotalWords] = useState(0)
  const game = useGamePlay(board)

  // Solve the board (worker, with main-thread fallback) on each new board.
  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    solveBoardAsync(board).then((r) => {
      if (cancelled) return
      setTotalWords(r.total)
      setPhase('playing')
    })
    return () => {
      cancelled = true
    }
  }, [board])

  const goal = computeGoal(totalWords, goalPercentage)

  function handleWord(word: string) {
    if (phase !== 'playing') return
    if (game.submit(word) === 'accepted') {
      if (hasReachedGoal(game.foundCount.current, computeGoal(totalWords, goalPercentage))) {
        setPhase('won') // reaching the goal locks input immediately
      }
    }
  }

  function playAgain() {
    game.reset()
    setBoard(generateBoard(size)) // effect re-solves and returns to 'playing'
  }

  if (phase === 'loading') {
    return (
      <div className="solving">
        <div className="spinner" aria-hidden="true" />
        <p>Finding all the words…</p>
      </div>
    )
  }

  if (phase === 'won') {
    return (
      <WinScreen
        score={game.score}
        found={game.found}
        totalWords={totalWords}
        onDone={onChangeSettings}
      />
    )
  }

  if (phase === 'over') {
    return (
      <Results
        heading="Round over"
        score={game.score}
        found={game.found}
        totalWords={totalWords}
        onPlayAgain={playAgain}
        onChangeSettings={onChangeSettings}
      />
    )
  }

  return (
    <div className="round peaceful">
      <ProgressBar found={game.found.length} total={totalWords} goal={goal} />

      <div className="hud">
        <span className="score">Score: {game.score}</span>
      </div>

      <BoardTrace board={board} onWord={handleWord} active={phase === 'playing'} />

      <div className={`feedback${game.feedback ? ` ${game.feedback.outcome}` : ''}`}>
        {game.feedback ? game.feedback.message : ' '}
      </div>

      <div className="idle-controls">
        <button type="button" className="secondary" onClick={() => setPhase('over')}>
          End Round
        </button>
        <button type="button" className="back" onClick={onChangeSettings}>
          Change settings
        </button>
      </div>

      {game.found.length > 0 && (
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
