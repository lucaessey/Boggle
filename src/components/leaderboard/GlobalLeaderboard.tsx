import { useEffect, useState } from 'react'
import balance from '../../balance.json'
import {
  boardKey,
  type Metric,
  type RankedEntry,
  rankEntries,
} from '../../core/leaderboard/leaderboard'
import { validateName } from '../../core/leaderboard/profanity'
import { fetchLeaderboard, removeLeaderboardEntries } from '../../net/leaderboard'
import { ensureAuth } from '../../net/room'
import {
  type LeaderboardConsent,
  loadLeaderboardConsent,
  loadNickname,
  saveLeaderboardConsent,
  saveNickname,
} from '../prefs'

const SIZES = Object.keys(balance.sizes)
  .map(Number)
  .sort((a, b) => a - b)
const LENGTHS: number[] = [...balance.roundLengths].sort((a, b) => a - b)
const ALL_KEYS = SIZES.flatMap((s) => LENGTHS.map((l) => boardKey(s, l)))

// Remembered across open/close within the session.
let sessionSize = SIZES[0]
let sessionSeconds = LENGTHS[0]
let sessionMetric: Metric = 'score'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m}:${(seconds % 60).toString().padStart(2, '0')}`
}

function formatDate(ms: number): string {
  if (!ms) return ''
  try {
    return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

type Data =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; entries: RankedEntry[] }

export function GlobalLeaderboard() {
  const [size, setSize] = useState(sessionSize)
  const [seconds, setSeconds] = useState(sessionSeconds)
  const [metric, setMetric] = useState<Metric>(sessionMetric)
  const [data, setData] = useState<Data>({ status: 'loading' })
  const [uid, setUid] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [consent, setConsent] = useState<LeaderboardConsent | null>(() => loadLeaderboardConsent())
  const [joining, setJoining] = useState(false)
  const [joinName, setJoinName] = useState(() => loadNickname())
  const [joinError, setJoinError] = useState('')
  const [busy, setBusy] = useState(false)

  // Resolve our own uid once (also warms auth for reads/removes).
  useEffect(() => {
    let cancelled = false
    ensureAuth()
      .then((id) => !cancelled && setUid(id))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch whenever the selected board / metric changes (or after a mutation).
  useEffect(() => {
    let cancelled = false
    setData({ status: 'loading' })
    fetchLeaderboard(size, seconds, metric)
      .then((rows) => !cancelled && setData({ status: 'ready', entries: rankEntries(rows, metric) }))
      .catch(() => !cancelled && setData({ status: 'error' }))
    return () => {
      cancelled = true
    }
  }, [size, seconds, metric, reloadKey])

  function chooseSize(s: number) {
    sessionSize = s
    setSize(s)
  }
  function chooseSeconds(s: number) {
    sessionSeconds = s
    setSeconds(s)
  }
  function chooseMetric(m: Metric) {
    sessionMetric = m
    setMetric(m)
  }

  function onJoin() {
    const check = validateName(joinName)
    if (!check.ok) {
      setJoinError(check.message)
      return
    }
    saveNickname(check.name)
    saveLeaderboardConsent('yes')
    setConsent('yes')
    setJoining(false)
  }

  async function onRemove() {
    setBusy(true)
    try {
      await removeLeaderboardEntries(ALL_KEYS)
      saveLeaderboardConsent('no')
      setConsent('no')
      setReloadKey((k) => k + 1)
    } catch {
      // A failed removal leaves the board as-is; the error surfaces on next read.
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="global-lb">
      <div className="hs-tabs" role="tablist" aria-label="Board size">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={s === size}
            className={`hs-tab${s === size ? ' active' : ''}`}
            onClick={() => chooseSize(s)}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      <div className="lb-controls">
        <label className="lb-length">
          <span className="lb-length-label">Round</span>
          <select
            value={seconds}
            onChange={(e) => chooseSeconds(Number(e.target.value))}
            aria-label="Round length"
          >
            {LENGTHS.map((l) => (
              <option key={l} value={l}>
                {formatTime(l)}
              </option>
            ))}
          </select>
        </label>

        <div className="lb-metric" role="tablist" aria-label="Ranking">
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'score'}
            className={`lb-metric-btn${metric === 'score' ? ' active' : ''}`}
            onClick={() => chooseMetric('score')}
          >
            Points
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'words'}
            className={`lb-metric-btn${metric === 'words' ? ' active' : ''}`}
            onClick={() => chooseMetric('words')}
          >
            Words
          </button>
        </div>
      </div>

      {data.status === 'loading' && (
        <div className="lb-state">
          <div className="mini-spinner" aria-hidden="true" />
          <span>Loading…</span>
        </div>
      )}
      {data.status === 'error' && (
        <div className="lb-state error" role="status">
          Couldn't reach the leaderboard. Check your connection and try again.
        </div>
      )}
      {data.status === 'ready' && data.entries.length === 0 && (
        <div className="lb-state" role="status">
          No scores submitted for this board yet.
        </div>
      )}
      {data.status === 'ready' && data.entries.length > 0 && (
        <ol className="lb-list">
          {data.entries.map((e) => (
            <li key={e.uid} className={`lb-row${e.uid === uid ? ' me' : ''}`}>
              <span className="lb-rank">{e.rank}</span>
              <span className="lb-name">{e.name}</span>
              <span className="lb-value">{metric === 'score' ? e.score : e.words}</span>
              <span className="lb-date">{formatDate(e.updatedAt)}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="lb-footer">
        {consent !== 'yes' &&
          (joining ? (
            <div className="lb-join">
              <input
                className="lb-name-input"
                type="text"
                maxLength={12}
                value={joinName}
                placeholder="Display name"
                aria-label="Display name (max 12 characters)"
                onChange={(e) => {
                  setJoinName(e.target.value)
                  setJoinError('')
                }}
              />
              {joinError && (
                <p className="lb-error" role="alert">
                  {joinError}
                </p>
              )}
              <div className="lb-join-actions">
                <button type="button" className="primary" onClick={onJoin}>
                  Save
                </button>
                <button type="button" className="secondary" onClick={() => setJoining(false)}>
                  Cancel
                </button>
              </div>
              <p className="lb-hint">You'll appear here after your next solo timed round.</p>
            </div>
          ) : (
            <button type="button" className="lb-link" onClick={() => setJoining(true)}>
              Join the global leaderboard
            </button>
          ))}
        {consent === 'yes' && (
          <button type="button" className="lb-link danger" onClick={onRemove} disabled={busy}>
            {busy ? 'Removing…' : 'Remove me from the leaderboard'}
          </button>
        )}
      </div>
    </div>
  )
}
