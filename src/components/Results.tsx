import { useState } from 'react'
import balance from '../balance.json'
import type { Board } from '../core/board/types'
import { byLengthThenAlpha, longestWords, missedWords } from '../core/round/results'
import { scoreForWord } from '../core/round/scoring'
import type { HighScoreRecord } from '../core/stats/stats'
import { BoardTrace } from './BoardTrace'
import { LeaderboardSubmit } from './leaderboard/LeaderboardSubmit'
import type { SolveState } from './useBoardSolve'
import type { FoundWord } from './useGamePlay'
import './Results.css'

const MISSED_CAP = balance.missedWordsDisplayCap

export type { SolveState }

interface WordRowProps {
  word: string
  points: number
  active: boolean
  onTap: () => void
}

function WordRow({ word, points, active, onTap }: WordRowProps) {
  return (
    <li className={`word-row${active ? ' active' : ''}`}>
      <button type="button" onClick={onTap}>
        <span className="wr-word">{word.toUpperCase()}</span>
        <span className="wr-len">{word.length}</span>
        <span className="wr-pts">{points}</span>
      </button>
    </li>
  )
}

interface ResultsProps {
  heading: string
  board: Board
  score: number
  found: FoundWord[]
  solve: SolveState
  /** Present only when this round set a new personal best (timed mode only). */
  personalBest?: { previous: HighScoreRecord | undefined } | null
  /**
   * Solo TIMED rounds only — enables the global-leaderboard opt-in/submit.
   * Peaceful and multiplayer never pass this, so they never write.
   */
  leaderboard?: { size: number; seconds: number } | null
  onPlayAgain: () => void
  onChangeSettings: () => void
}

export function Results({
  heading,
  board,
  score,
  found,
  solve,
  personalBest,
  leaderboard,
  onPlayAgain,
  onChangeSettings,
}: ResultsProps) {
  const [selected, setSelected] = useState<string | null>(null) // lowercased word
  const [showLongest, setShowLongest] = useState(false)
  const [showMissed, setShowMissed] = useState(false)

  const ready = solve.status === 'ready'
  const paths = solve.status === 'ready' ? solve.paths : null
  const total = solve.status === 'ready' ? solve.total : null

  const foundLower = new Set(found.map((f) => f.word.toLowerCase()))
  const foundSorted = [...found].sort((a, b) =>
    byLengthThenAlpha(a.word.toLowerCase(), b.word.toLowerCase()),
  )

  const allWords = paths ? [...paths.keys()] : []
  const missed = paths ? missedWords(allWords, foundLower) : []
  const missedShown = missed.slice(0, MISSED_CAP)
  const longest = paths ? longestWords(allWords) : []

  const tap = (word: string) => setSelected((prev) => (prev === word ? null : word))
  const selectedPath = selected && paths ? (paths.get(selected) ?? null) : null

  return (
    <div className="results-screen">
      {personalBest && (
        <div className="pb-banner" role="status">
          <span className="pb-title">🏅 NEW PERSONAL BEST</span>
          <span className="pb-prev">
            {personalBest.previous
              ? `Previous best: ${personalBest.previous.score}`
              : 'First score for this board'}
          </span>
        </div>
      )}

      <div className="results-summary">
        <h2>{heading}</h2>
        <p className="final-score">Final score: {score}</p>
        <p className="coverage">
          {total !== null
            ? `You found ${found.length} of ${total.toLocaleString()} words`
            : `You found ${found.length} words`}
        </p>
      </div>

      {leaderboard && (
        <LeaderboardSubmit
          size={leaderboard.size}
          seconds={leaderboard.seconds}
          score={score}
          words={found.length}
        />
      )}

      <BoardTrace
        board={board}
        active={false}
        revealed
        hideChrome
        compact
        externalPath={selectedPath}
      />

      <div className="results-lists">
        <section className="results-found">
          <h3>Found · {found.length}</h3>
          <ul className="word-list">
            {foundSorted.map((f) => {
              const lw = f.word.toLowerCase()
              return (
                <WordRow
                  key={f.word}
                  word={f.word}
                  points={f.points}
                  active={selected === lw}
                  onTap={() => tap(lw)}
                />
              )
            })}
          </ul>
        </section>

        {/* If the solve failed/timed out, hide the reveal buttons and say so. */}
        {solve.status === 'failed' && (
          <p className="solve-failed">Couldn't load the full word list</p>
        )}

        {solve.status !== 'failed' && (
          <div className="reveal">
            <button
              type="button"
              className="reveal-btn"
              disabled={!ready}
              onClick={() => setShowLongest((v) => !v)}
            >
              {!ready && <span className="mini-spinner" aria-hidden="true" />}
              {showLongest ? 'Hide longest word' : 'Reveal longest word'}
            </button>
            {showLongest && ready && (
              <ul className="word-list">
                {longest.map((w) => (
                  <WordRow
                    key={w}
                    word={w}
                    points={scoreForWord(w)}
                    active={selected === w}
                    onTap={() => tap(w)}
                  />
                ))}
              </ul>
            )}

            <button
              type="button"
              className="reveal-btn"
              disabled={!ready}
              onClick={() => setShowMissed((v) => !v)}
            >
              {!ready && <span className="mini-spinner" aria-hidden="true" />}
              {showMissed ? 'Hide missed words' : 'Reveal missed words'}
            </button>
            {showMissed && ready && (
              <>
                {missed.length > MISSED_CAP && (
                  <p className="cap-note">
                    Showing {missedShown.length} of {missed.length.toLocaleString()} missed words
                  </p>
                )}
                <ul className="word-list">
                  {missedShown.map((w) => (
                    <WordRow
                      key={w}
                      word={w}
                      points={scoreForWord(w)}
                      active={selected === w}
                      onTap={() => tap(w)}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="results-actions">
        <button type="button" className="primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button type="button" className="secondary" onClick={onChangeSettings}>
          Change Settings
        </button>
      </div>
    </div>
  )
}
