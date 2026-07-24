import { useEffect, useRef, useState } from 'react'
import { generateBoard } from '../core/board/generate'
import { isStraightLine } from '../core/path/path'
import { goalCount as computeGoal, hasReachedGoal } from '../core/round/peaceful'
import { useAchievements } from './AchievementsContext'
import { BoardTrace } from './BoardTrace'
import { Countdown } from './Countdown'
import { Results, type SolveState } from './Results'
import { WinScreen } from './WinScreen'
import { solveBoardAsync } from './solveAsync'
import { useGamePlay } from './useGamePlay'
import './Round.css'
import './Peaceful.css'

const REJECT_OUTCOMES = new Set(['too-short', 'not-a-word', 'not-on-board'])

type Phase = 'countdown' | 'loading' | 'playing' | 'over' | 'won'

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
        <div className="progress-goal" style={{ left: `${goalLeft}%` }} title={`Goal: ${goal} words`} />
      </div>
      <div className="progress-text">
        {found} / {total} ({pct}%) · goal {goal}
      </div>
    </div>
  )
}

/**
 * Untimed, goal-based round. The board is solved off the main thread while the
 * countdown runs, hiding most of the solve time; if the solve is still running
 * when the countdown ends, a brief loading state is shown before play begins.
 */
export function PeacefulRound({ size, goalPercentage, onChangeSettings }: PeacefulRoundProps) {
  const [board, setBoard] = useState(() => generateBoard(size))
  const [phase, setPhase] = useState<Phase>('countdown')
  const [totalWords, setTotalWords] = useState(0)
  // The Peaceful solve done up front is reused by the results screen — no re-solve.
  const [solve, setSolve] = useState<SolveState>({ status: 'solving' })
  const game = useGamePlay(board)
  const ach = useAchievements()

  const solveDone = useRef(false)
  const countdownDone = useRef(false)

  // The round's timing starts when play actually begins (board revealed).
  useEffect(() => {
    if (phase === 'playing') ach.startRound(Date.now())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function endRound() {
    ach.record({ type: 'round-ended', size, length: null, mode: 'peaceful', at: Date.now() })
  }

  // Start the solve as soon as the board exists; countdown runs concurrently.
  // The full result is kept for the results screen (reused, not re-solved).
  useEffect(() => {
    solveDone.current = false
    countdownDone.current = false
    setPhase('countdown')
    setSolve({ status: 'solving' })
    let cancelled = false
    solveBoardAsync(board)
      .then((r) => {
        if (cancelled) return
        setTotalWords(r.total)
        setSolve({ status: 'ready', total: r.total, paths: new Map(r.entries) })
        solveDone.current = true
        if (countdownDone.current) setPhase('playing')
      })
      .catch(() => {
        if (cancelled) return
        // Solve failed: let play proceed (goal falls back to 0) with no reveals.
        setSolve({ status: 'failed' })
        solveDone.current = true
        if (countdownDone.current) setPhase('playing')
      })
    return () => {
      cancelled = true
    }
  }, [board])

  function onCountdownDone() {
    countdownDone.current = true
    setPhase(solveDone.current ? 'playing' : 'loading') // hold on loading if solve is slow
  }

  const goal = computeGoal(totalWords, goalPercentage)

  function handleWord(word: string, path: number[] | null) {
    if (phase !== 'playing') return
    const { outcome, points } = game.submit(word)
    if (outcome === 'accepted') {
      ach.record({
        type: 'accepted',
        word,
        points,
        straightLine: path !== null && isStraightLine(path, size),
        at: Date.now(),
      })
      if (hasReachedGoal(game.foundCount.current, computeGoal(totalWords, goalPercentage))) {
        endRound() // a win is a finished round
        setPhase('won')
      }
    } else if (REJECT_OUTCOMES.has(outcome)) {
      ach.record({ type: 'rejected', at: Date.now() })
    }
  }

  function playAgain() {
    game.reset()
    setBoard(generateBoard(size)) // effect restarts countdown + solve
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
      <WinScreen score={game.score} found={game.found} totalWords={totalWords} onDone={onChangeSettings} />
    )
  }

  if (phase === 'over') {
    return (
      <Results
        heading="Round over"
        board={board}
        score={game.score}
        found={game.found}
        solve={solve}
        onPlayAgain={playAgain}
        onChangeSettings={onChangeSettings}
      />
    )
  }

  const counting = phase === 'countdown'

  return (
    <div className="round peaceful">
      {counting ? (
        <div className="progress-placeholder">Peaceful · goal {goalPercentage}%</div>
      ) : (
        <ProgressBar found={game.found.length} total={totalWords} goal={goal} />
      )}

      <div className="hud">
        <span className="score">Score: {game.score}</span>
      </div>

      <BoardTrace
        board={board}
        onWord={handleWord}
        active={phase === 'playing'}
        revealed={!counting}
        overlay={counting ? <Countdown onDone={onCountdownDone} /> : undefined}
      />

      <div className={`feedback${game.feedback ? ` ${game.feedback.outcome}` : ''}`}>
        {game.feedback ? game.feedback.message : ' '}
      </div>

      <div className="idle-controls">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            endRound()
            setPhase('over')
          }}
          disabled={counting}
        >
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
