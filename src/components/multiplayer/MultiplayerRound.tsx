import { useEffect, useMemo, useRef, useState } from 'react'
import balance from '../../balance.json'
import { generateBoard, generateOptionsForMode } from '../../core/board/generate'
import { minWordLengthForMode } from '../../core/round/modes'
import { isStraightLine } from '../../core/path/path'
import {
  computeMultiplayerScores,
  type PlayerScore,
} from '../../core/round/multiplayerScoring'
import { scoreForWord } from '../../core/round/scoring'
import { startRound, submitResults } from '../../net/room'
import { connectedPlayerIds, type RoomState } from '../../net/roomTypes'
import { roundTiming } from '../../net/roundTiming'
import { BoardTrace } from '../BoardTrace'
import { useAchievements } from '../AchievementsContext'
import { useGamePlay } from '../useGamePlay'
import { MultiplayerResults } from './MultiplayerResults'

const COUNTDOWN = balance.countdownSeconds
const GRACE_MS = 15000
const REJECT = new Set(['too-short', 'not-a-word', 'not-on-board'])

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m}:${(seconds % 60).toString().padStart(2, '0')}`
}

function newSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

interface MultiplayerRoundProps {
  code: string
  uid: string
  isHost: boolean
  room: RoomState
  offset: number
  onLeave: () => void
}

export function MultiplayerRound({ code, uid, isHost, room, offset, onLeave }: MultiplayerRoundProps) {
  const { size, seconds } = room.settings
  const mode = room.settings.mode ?? 'normal'
  const seed = room.seed ?? ''
  const startAt = room.startAt ?? 0

  const board = useMemo(
    () => generateBoard(size, seed, generateOptionsForMode(mode)),
    [size, seed, mode],
  )
  const game = useGamePlay(board, {
    gameMode: mode,
    minWordLength: minWordLengthForMode(mode, balance.minWordLength),
  })
  const ach = useAchievements()

  const [now, setNow] = useState(Date.now())
  const [graceElapsed, setGraceElapsed] = useState(false)
  const [scores, setScores] = useState<PlayerScore[] | null>(null)

  const achStarted = useRef(false)
  const submitted = useRef(false)

  // Tick the clock.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [])

  // Reset everything when a new round (new seed) begins.
  useEffect(() => {
    game.reset()
    achStarted.current = false
    submitted.current = false
    setGraceElapsed(false)
    setScores(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const serverNow = now + offset
  const timing = startAt ? roundTiming(serverNow, startAt, COUNTDOWN, seconds) : null
  const phase = timing?.phase ?? 'countdown'

  // Achievements start when play begins (not high scores — those are solo only).
  useEffect(() => {
    if (phase === 'playing' && !achStarted.current) {
      achStarted.current = true
      ach.startRound(Date.now())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // On round end: submit our words + raw score once, then start the grace timer.
  useEffect(() => {
    if (phase !== 'ended' || submitted.current) return
    submitted.current = true
    const words = game.found.map((f) => f.word.toLowerCase())
    submitResults(code, words, game.score).catch(() => {})
    ach.record({ type: 'round-ended', size, length: seconds, mode: 'timed', at: Date.now() })
    const t = setTimeout(() => setGraceElapsed(true), GRACE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Compute the leaderboard once every connected player has submitted (or grace).
  useEffect(() => {
    if (phase !== 'ended' || scores) return
    const connected = connectedPlayerIds(room)
    const results = room.results ?? {}
    const allIn = connected.length > 0 && connected.every((id) => results[id])
    if (!allIn && !graceElapsed) return
    const playerResults = Object.entries(room.players ?? {}).map(([pid, p]) => ({
      uid: pid,
      name: p.name,
      words: results[pid]?.words ?? [],
    }))
    setScores(computeMultiplayerScores(playerResults, scoreForWord))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, room, graceElapsed, scores])

  function handleWord(word: string, path: number[] | null) {
    if (phase !== 'playing') return
    const { outcome, points } = game.submit(word, path)
    if (outcome === 'accepted') {
      ach.record({
        type: 'accepted',
        word,
        points,
        straightLine: path !== null && isStraightLine(path, size),
        at: Date.now(),
      })
    } else if (REJECT.has(outcome)) {
      ach.record({ type: 'rejected', at: Date.now() })
    }
  }

  function playAgain() {
    startRound(code, newSeed()).catch(() => {})
  }

  const stillPlaying = connectedPlayerIds(room).length
  const submittedCount = Object.keys(room.results ?? {}).length

  if (!startAt) {
    return (
      <div className="mp">
        <div className="spinner" aria-hidden="true" />
        <p>Starting…</p>
      </div>
    )
  }

  if (scores) {
    return (
      <MultiplayerResults
        board={board}
        scores={scores}
        myUid={uid}
        isHost={isHost}
        onPlayAgain={playAgain}
        onLeave={onLeave}
      />
    )
  }

  if (phase === 'ended') {
    return (
      <div className="mp">
        <div className="spinner" aria-hidden="true" />
        <p>Scoring… {submittedCount}/{stillPlaying} players in</p>
      </div>
    )
  }

  return (
    <div className="round mp-round">
      <div className="hud">
        <span className="score">Score: {game.score}</span>
        <span className="mp-players-left">{stillPlaying} playing</span>
        {phase === 'playing' && <span className="timer">{formatTime(timing?.playRemaining ?? 0)}</span>}
      </div>

      <BoardTrace
        board={board}
        onWord={handleWord}
        active={phase === 'playing'}
        revealed={phase !== 'countdown'}
        overlay={
          phase === 'countdown' ? (
            <div className="countdown">{timing?.countdownRemaining}</div>
          ) : undefined
        }
      />

      <div className={`feedback${game.feedback ? ` ${game.feedback.outcome}` : ''}`}>
        {game.feedback ? game.feedback.message : ' '}
      </div>

      {/* Always rendered so its reserved space keeps the grid fixed as words
          are added; only this list scrolls. */}
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
