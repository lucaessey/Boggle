import { useEffect, useState } from 'react'
import balance from '../balance.json'
import { generateBoard, generateOptionsForMode } from '../core/board/generate'
import { isLeaderboardEligibleMode } from '../core/leaderboard/leaderboard'
import { isStraightLine } from '../core/path/path'
import { clockAfterSubmit, initialClockSeconds } from '../core/round/blitz'
import { type GameModeId, minWordLengthForMode } from '../core/round/modes'
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
  gameMode: GameModeId
  onChangeSettings: () => void
}

/** Timed round: countdown → play → results. The timer starts at countdown end. */
export function Round({ size, roundSeconds, gameMode, onChangeSettings }: RoundProps) {
  const [board, setBoard] = useState(() =>
    generateBoard(size, undefined, generateOptionsForMode(gameMode)),
  )
  const [status, setStatus] = useState<Status>('countdown')
  // Blitz starts at its own clock and ignores the chosen round length.
  const [remaining, setRemaining] = useState(() => initialClockSeconds(gameMode, roundSeconds))
  const [timeFlash, setTimeFlash] = useState(false) // Blitz: pulse when time is added
  const game = useGamePlay(board, {
    gameMode,
    minWordLength: minWordLengthForMode(gameMode, balance.minWordLength),
  })
  const ach = useAchievements()
  // Solve the board off the main thread once the round is over (for reveals).
  const solve = useBoardSolve(board, status === 'over')
  // Set when this round beat the record for this size+length+mode (banner on results).
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
      const hs = ach.recordHighScore(
        size,
        roundSeconds,
        {
          score: game.score,
          wordsFound: game.found.length,
          longestWord: longestFound(game.found),
          date: new Date(Date.now()).toISOString(),
        },
        gameMode,
      )
      setPersonalBest(hs.isNewBest ? { previous: hs.previous } : null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, remaining, size, roundSeconds])

  // Clear the Blitz time-added pulse shortly after it fires.
  useEffect(() => {
    if (!timeFlash) return
    const id = setTimeout(() => setTimeFlash(false), 450)
    return () => clearTimeout(id)
  }, [timeFlash])

  function beginPlay() {
    game.reset()
    setRemaining(initialClockSeconds(gameMode, roundSeconds))
    ach.startRound(Date.now()) // round timing starts at countdown end
    setStatus('running') // timer starts now, not when the board was generated
  }

  function playAgain() {
    game.reset()
    setBoard(generateBoard(size, undefined, generateOptionsForMode(gameMode)))
    setRemaining(initialClockSeconds(gameMode, roundSeconds))
    setPersonalBest(null)
    setStatus('countdown') // fresh countdown; the solve resets via useBoardSolve
  }

  function handleWord(word: string, path: number[] | null) {
    if (status !== 'running') return
    const { outcome, points } = game.submit(word, path)
    if (outcome === 'accepted') {
      // Blitz: an accepted word adds bonus seconds; pulse the clock.
      setRemaining((r) => {
        const next = clockAfterSubmit(gameMode, r, true)
        if (next !== r) setTimeFlash(true)
        return next
      })
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
        heading={gameMode === 'blitz' ? 'Blitz over!' : 'Time!'}
        board={board}
        score={game.score}
        found={game.found}
        solve={solve}
        gameMode={gameMode}
        personalBest={personalBest}
        leaderboard={isLeaderboardEligibleMode(gameMode) ? { size, seconds: roundSeconds } : null}
        onPlayAgain={playAgain}
        onChangeSettings={onChangeSettings}
      />
    )
  }

  return (
    <div className="round">
      <div className="hud">
        <span className="score">Score: {game.score}</span>
        <span
          className={`timer${remaining <= 10 && status === 'running' ? ' low' : ''}${
            timeFlash ? ' added' : ''
          }`}
        >
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

      {/* Always rendered (even empty) so its space is reserved and an accepted
          word can never shift the grid. Only this list scrolls. */}
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
    </div>
  )
}
