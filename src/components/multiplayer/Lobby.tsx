import { useState } from 'react'
import balance from '../../balance.json'
import { type GameModeId, MODE_ORDER, modeMeta } from '../../core/round/modes'
import { startRound, updateSettings } from '../../net/room'
import type { RoomState } from '../../net/roomTypes'
import { useScreenBackground } from '../Background'

const SIZES = Object.keys(balance.sizes).map(Number).sort((a, b) => a - b)
const LENGTHS: number[] = [...balance.roundLengths].sort((a, b) => a - b)

// Modes playable in multiplayer. Blitz needs a per-player clock and Bonus Tiles
// needs traced-path sync, neither of which fits the shared-timer / word-list
// sync model — so they are single-player only and shown disabled here.
const MP_ENABLED: ReadonlySet<GameModeId> = new Set(['normal', 'long'])

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m}:${(seconds % 60).toString().padStart(2, '0')}`
}

function newSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

interface LobbyProps {
  code: string
  uid: string
  isHost: boolean
  room: RoomState
  onLeave: () => void
}

export function Lobby({ code, uid, isHost, room, onLeave }: LobbyProps) {
  useScreenBackground('1') // lobby uses background_1
  const [copied, setCopied] = useState(false)
  const players = Object.entries(room.players ?? {})
  const playerCount = players.length
  const { size, seconds } = room.settings
  const mode: GameModeId = room.settings.mode ?? 'normal'

  function copyCode() {
    try {
      navigator.clipboard?.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  function start() {
    startRound(code, newSeed()).catch(() => {})
  }

  return (
    <div className="mp lobby">
      <div className="lobby-code">
        <span className="lobby-code-label">Room code</span>
        <div className="lobby-code-row">
          <span className="lobby-code-value">{code}</span>
          <button type="button" className="secondary" onClick={copyCode}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <section className="lobby-players">
        <h3>Players · {playerCount}/10</h3>
        <ul>
          {players.map(([pid, p]) => (
            <li key={pid} className={p.connected ? '' : 'disconnected'}>
              <span>
                {p.name}
                {pid === room.hostId && ' 👑'}
                {pid === uid && ' (you)'}
              </span>
              {!p.connected && <span className="tag">offline</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="lobby-settings">
        {isHost ? (
          <>
            <div className="lobby-setting">
              <span className="lobby-setting-label">Board size</span>
              <div className="seg">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`seg-btn${s === size ? ' active' : ''}`}
                    onClick={() => updateSettings(code, { size: s, seconds, mode }).catch(() => {})}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>
            </div>
            <div className="lobby-setting">
              <span className="lobby-setting-label">Round length</span>
              <div className="seg">
                {LENGTHS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    className={`seg-btn${len === seconds ? ' active' : ''}`}
                    onClick={() => updateSettings(code, { size, seconds: len, mode }).catch(() => {})}
                  >
                    {formatTime(len)}
                  </button>
                ))}
              </div>
            </div>
            <div className="lobby-setting">
              <span className="lobby-setting-label">Mode</span>
              <div className="seg">
                {MODE_ORDER.map((id) => {
                  const enabled = MP_ENABLED.has(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={!enabled}
                      title={enabled ? modeMeta(id).desc : 'Single-player only'}
                      className={`seg-btn${id === mode ? ' active' : ''}${enabled ? '' : ' disabled'}`}
                      onClick={() => updateSettings(code, { size, seconds, mode: id }).catch(() => {})}
                    >
                      {modeMeta(id).name}
                    </button>
                  )
                })}
              </div>
              <span className="lobby-setting-note">Blitz and Bonus Tiles are single-player only.</span>
            </div>
          </>
        ) : (
          <p className="lobby-readonly">
            Host chose <strong>{size}×{size}</strong> · <strong>{formatTime(seconds)}</strong> ·{' '}
            <strong>{modeMeta(mode).name}</strong>
          </p>
        )}
      </section>

      {isHost ? (
        <button type="button" className="primary" disabled={playerCount < 2} onClick={start}>
          {playerCount < 2 ? 'Waiting for players…' : 'Start'}
        </button>
      ) : (
        <p className="lobby-wait">Waiting for the host to start…</p>
      )}

      <button type="button" className="back" onClick={onLeave}>
        ← Leave room
      </button>
    </div>
  )
}
