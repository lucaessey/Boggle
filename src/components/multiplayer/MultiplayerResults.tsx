import { useState } from 'react'
import balance from '../../balance.json'
import type { Board } from '../../core/board/types'
import type { PlayerScore } from '../../core/round/multiplayerScoring'
import { longestWords, missedWords } from '../../core/round/results'
import { scoreForWord } from '../../core/round/scoring'
import { BoardTrace } from '../BoardTrace'
import { useBoardSolve } from '../useBoardSolve'
import '../Results.css'

const MISSED_CAP = balance.missedWordsDisplayCap

interface MultiplayerResultsProps {
  board: Board
  scores: PlayerScore[]
  myUid: string
  isHost: boolean
  onPlayAgain: () => void
  onLeave: () => void
}

export function MultiplayerResults({
  board,
  scores,
  myUid,
  isHost,
  onPlayAgain,
  onLeave,
}: MultiplayerResultsProps) {
  const solve = useBoardSolve(board, true)
  const ready = solve.status === 'ready'
  const paths = solve.status === 'ready' ? solve.paths : null

  const [selected, setSelected] = useState<string | null>(null)
  const [showLongest, setShowLongest] = useState(false)
  const [showMissed, setShowMissed] = useState(false)

  const me = scores.find((s) => s.uid === myUid)
  const myWords = [...(me?.words ?? [])].sort(
    (a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word),
  )
  const myWordSet = new Set(myWords.map((w) => w.word))

  const allWords = paths ? [...paths.keys()] : []
  const missed = paths ? missedWords(allWords, myWordSet) : []
  const missedShown = missed.slice(0, MISSED_CAP)
  const longest = paths ? longestWords(allWords) : []

  const tap = (word: string) => setSelected((prev) => (prev === word ? null : word))
  const selectedPath = selected && paths ? (paths.get(selected) ?? null) : null

  return (
    <div className="results-screen mp-results">
      <div className="results-summary">
        <h2>Results</h2>
        <ol className="leaderboard">
          {scores.map((s, i) => (
            <li key={s.uid} className={s.uid === myUid ? 'me' : ''}>
              <span className="lb-rank">{i + 1}</span>
              <span className="lb-name">
                {s.name}
                {s.uid === myUid && ' (you)'}
              </span>
              <span className="lb-score">{s.total}</span>
            </li>
          ))}
        </ol>
      </div>

      <BoardTrace board={board} active={false} revealed hideChrome compact externalPath={selectedPath} />

      <div className="results-lists">
        <section className="results-found">
          <h3>Your words · {myWords.length}</h3>
          <ul className="word-list">
            {myWords.map((w) => (
              <li key={w.word} className={`word-row${selected === w.word ? ' active' : ''}`}>
                <button type="button" onClick={() => tap(w.word)}>
                  <span className="wr-word">
                    {w.word.toUpperCase()}
                    {w.bonus && <span className="bonus-tag"> 2×</span>}
                  </span>
                  <span className="wr-len">{w.word.length}</span>
                  <span className="wr-pts">{w.points}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

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
                  <li key={w} className={`word-row${selected === w ? ' active' : ''}`}>
                    <button type="button" onClick={() => tap(w)}>
                      <span className="wr-word">{w.toUpperCase()}</span>
                      <span className="wr-len">{w.length}</span>
                      <span className="wr-pts">{scoreForWord(w)}</span>
                    </button>
                  </li>
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
                    <li key={w} className={`word-row${selected === w ? ' active' : ''}`}>
                      <button type="button" onClick={() => tap(w)}>
                        <span className="wr-word">{w.toUpperCase()}</span>
                        <span className="wr-len">{w.length}</span>
                        <span className="wr-pts">{scoreForWord(w)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="results-actions">
        {isHost && (
          <button type="button" className="primary" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
        <button type="button" className="secondary" onClick={onLeave}>
          Leave room
        </button>
      </div>
    </div>
  )
}
