import { useState } from 'react'
import balance from '../../balance.json'
import type { Board } from '../../core/board/types'
import type { PlayerScore, ScoredWord } from '../../core/round/multiplayerScoring'
import { longestReveal, othersFound } from '../../core/round/multiplayerReveal'
import { missedWords } from '../../core/round/results'
import { scoreForWord } from '../../core/round/scoring'
import { BoardTrace } from '../BoardTrace'
import { useBoardSolve } from '../useBoardSolve'
import '../Results.css'

const MISSED_CAP = balance.missedWordsDisplayCap

function findersLabel(finders: string[]): string {
  return finders.length > 0 ? `found by ${finders.join(', ')}` : 'Nobody found this.'
}

interface MultiplayerResultsProps {
  board: Board
  scores: PlayerScore[]
  myUid: string
  isHost: boolean
  onPlayAgain: () => void
  onLeave: () => void
}

/** A player's own word list, longest-first with 2× markers, tappable for paths. */
function WordList({
  words,
  selected,
  onTap,
}: {
  words: ScoredWord[]
  selected: string | null
  onTap: (w: string) => void
}) {
  const sorted = [...words].sort(
    (a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word),
  )
  return (
    <ul className="word-list">
      {sorted.map((w) => (
        <li key={w.word} className={`word-row${selected === w.word ? ' active' : ''}`}>
          <button type="button" onClick={() => onTap(w.word)}>
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
  )
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
  const [viewing, setViewing] = useState<string | null>(null) // uid whose detail is open
  const [showLongest, setShowLongest] = useState(false)
  const [showMissed, setShowMissed] = useState(false)

  const me = scores.find((s) => s.uid === myUid)
  const myWordSet = new Set((me?.words ?? []).map((w) => w.word))

  const revealPlayers = scores.map((s) => ({
    id: s.uid,
    name: s.name,
    words: s.words.map((w) => w.word),
  }))
  const allWords = paths ? [...paths.keys()] : []
  const reveal = paths ? longestReveal(allWords, revealPlayers) : null
  const missed = paths ? missedWords(allWords, myWordSet) : []
  const missedShown = missed.slice(0, MISSED_CAP)
  const beatenTo = othersFound(revealPlayers, myUid)

  const tap = (word: string) => setSelected((prev) => (prev === word ? null : word))
  const selectedPath = selected && paths ? (paths.get(selected) ?? null) : null

  // ---- Player detail (full-screen panel) ----
  if (viewing) {
    const player = scores.find((s) => s.uid === viewing)
    if (player) {
      return (
        <div className="results-screen mp-detail">
          <div className="results-summary">
            <button
              type="button"
              className="back"
              onClick={() => {
                setViewing(null)
                setSelected(null)
              }}
            >
              ← Leaderboard
            </button>
            <h2>
              {player.name}
              {player.uid === myUid && ' (you)'}
            </h2>
            <p className="final-score">{player.total} points</p>
          </div>
          <BoardTrace board={board} active={false} revealed hideChrome compact externalPath={selectedPath} />
          <div className="results-lists">
            <h3 className="mp-detail-heading">Words · {player.words.length}</h3>
            <WordList words={player.words} selected={selected} onTap={tap} />
          </div>
        </div>
      )
    }
  }

  // ---- Leaderboard + reveals ----
  return (
    <div className="results-screen mp-results">
      <div className="results-summary">
        <h2>Results</h2>
        <ol className="leaderboard tappable">
          {scores.map((s, i) => (
            <li key={s.uid} className={s.uid === myUid ? 'me' : ''}>
              <button type="button" onClick={() => setViewing(s.uid)}>
                <span className="lb-rank">{i + 1}</span>
                <span className="lb-name">
                  {s.name}
                  {s.uid === myUid && ' (you)'}
                </span>
                <span className="lb-score">{s.total}</span>
                <span className="lb-chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="lb-hint">Tap a player to see their words</p>
      </div>

      <BoardTrace board={board} active={false} revealed hideChrome compact externalPath={selectedPath} />

      <div className="results-lists">
        <section className="results-found">
          <h3>Your words · {me?.words.length ?? 0}</h3>
          <WordList words={me?.words ?? []} selected={selected} onTap={tap} />
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
            {showLongest && ready && reveal && (
              <div className="longest-reveal">
                {reveal.collapsed ? (
                  <div className="longest-block">
                    <span className="longest-label">Board's longest — and found</span>
                    {reveal.board.map((e) => (
                      <div key={e.word} className="longest-entry">
                        <button type="button" className="longest-word" onClick={() => tap(e.word)}>
                          {e.word.toUpperCase()}
                        </button>
                        <span className="finder">{findersLabel(e.finders)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="longest-block">
                      <span className="longest-label">Longest on the board</span>
                      {reveal.board.map((e) => (
                        <div key={e.word} className="longest-entry">
                          <button type="button" className="longest-word" onClick={() => tap(e.word)}>
                            {e.word.toUpperCase()}
                          </button>
                          <span className="finder">{findersLabel(e.finders)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="longest-block">
                      <span className="longest-label">Longest anyone found</span>
                      {reveal.found.map((e) => (
                        <div key={e.word} className="longest-entry">
                          <button type="button" className="longest-word" onClick={() => tap(e.word)}>
                            {e.word.toUpperCase()}
                          </button>
                          <span className="finder">{findersLabel(e.finders)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
                        <span className="wr-word">
                          {w.toUpperCase()}
                          {beatenTo.has(w) && (
                            <span className="beaten-tag" title="Another player found this">
                              {' '}
                              ·seen
                            </span>
                          )}
                        </span>
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
