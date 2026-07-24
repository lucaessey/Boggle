import { useState } from 'react'
import { ROOM_CODE_LENGTH } from '../../net/roomCode'

interface MultiplayerMenuProps {
  nickname: string
  busy: boolean
  error: string | null
  notice: string | null
  onCreate: (name: string) => void
  onJoin: (name: string, code: string) => void
  onExit: () => void
}

export function MultiplayerMenu({
  nickname,
  busy,
  error,
  notice,
  onCreate,
  onJoin,
  onExit,
}: MultiplayerMenuProps) {
  const [name, setName] = useState(nickname)
  const [mode, setMode] = useState<'choose' | 'join'>('choose')
  const [code, setCode] = useState('')

  const trimmed = name.trim()
  const nameOk = trimmed.length > 0

  return (
    <div className="mp">
      <h2>Multiplayer</h2>
      {notice && <p className="mp-notice">{notice}</p>}

      <label className="mp-field">
        <span>Nickname</span>
        <input
          type="text"
          value={name}
          maxLength={12}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {mode === 'choose' ? (
        <div className="mp-actions">
          <button
            type="button"
            className="primary"
            disabled={!nameOk || busy}
            onClick={() => onCreate(trimmed)}
          >
            Create room
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!nameOk || busy}
            onClick={() => setMode('join')}
          >
            Join with code
          </button>
        </div>
      ) : (
        <div className="mp-join">
          <input
            type="text"
            className="mp-code-input"
            value={code}
            maxLength={ROOM_CODE_LENGTH}
            placeholder="CODE"
            autoCapitalize="characters"
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
          />
          <div className="mp-actions">
            <button
              type="button"
              className="primary"
              disabled={!nameOk || code.length !== ROOM_CODE_LENGTH || busy}
              onClick={() => onJoin(trimmed, code)}
            >
              Join
            </button>
            <button type="button" className="back" onClick={() => setMode('choose')}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {error && <p className="mp-error">{error}</p>}

      <button type="button" className="back" onClick={onExit}>
        ← Main menu
      </button>
    </div>
  )
}
