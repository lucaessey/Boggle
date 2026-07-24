import { useEffect, useRef, useState } from 'react'
import {
  createRoom,
  ensureAuth,
  joinRoom,
  leaveRoom,
  subscribeRoom,
  subscribeServerOffset,
} from '../../net/room'
import type { JoinResult, RoomState } from '../../net/roomTypes'
import { loadNickname, saveNickname } from '../prefs'
import { Lobby } from './Lobby'
import { MultiplayerMenu } from './MultiplayerMenu'
import { MultiplayerRound } from './MultiplayerRound'
import './multiplayer.css'

const DEFAULT_SETTINGS = { size: 4, seconds: 120 }

const JOIN_ERROR: Record<Exclude<JoinResult, 'ok'>, string> = {
  'not-found': 'Room not found — check the code.',
  full: 'That room is full (10 players).',
  started: 'That game has already started.',
}

/** Lazy-loaded multiplayer entry point. All Firebase access is via net/room. */
export function MultiplayerApp({ onExit }: { onExit: () => void }) {
  const [uid, setUid] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const [offset, setOffset] = useState(0)
  const [nickname, setNickname] = useState(loadNickname())

  const [code, setCode] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [busy, setBusy] = useState(false)
  const [menuError, setMenuError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const seenRoom = useRef(false)
  const leaving = useRef(false)

  // Sign in (anonymous) and track the server clock offset.
  useEffect(() => {
    ensureAuth().then(setUid).catch(() => setAuthError(true))
    return subscribeServerOffset(setOffset)
  }, [])

  // Subscribe to the current room.
  useEffect(() => {
    if (!code) return
    seenRoom.current = false
    leaving.current = false
    return subscribeRoom(code, (r) => {
      if (r) {
        seenRoom.current = true
        setRoom(r)
      } else if (seenRoom.current && !leaving.current) {
        // The room vanished after we'd seen it (and we didn't leave) → host closed it.
        setNotice('The host closed the room.')
        setCode(null)
        setRoom(null)
        setIsHost(false)
      }
    })
  }, [code])

  function saveName(name: string) {
    setNickname(name)
    saveNickname(name)
  }

  async function handleCreate(name: string) {
    saveName(name)
    setBusy(true)
    setMenuError(null)
    setNotice(null)
    try {
      const c = await createRoom(name, DEFAULT_SETTINGS)
      setIsHost(true)
      setCode(c)
    } catch {
      setMenuError('Could not create a room. Check your connection.')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(name: string, joinCode: string) {
    saveName(name)
    setBusy(true)
    setMenuError(null)
    setNotice(null)
    try {
      const result = await joinRoom(joinCode, name)
      if (result === 'ok') {
        setIsHost(false)
        setCode(joinCode)
      } else {
        setMenuError(JOIN_ERROR[result])
      }
    } catch {
      setMenuError('Could not join. Check your connection.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLeave() {
    leaving.current = true // suppress the "host closed the room" notice for ourselves
    setNotice(null)
    if (code) {
      try {
        await leaveRoom(code, isHost)
      } catch {
        // best effort
      }
    }
    setCode(null)
    setRoom(null)
    setIsHost(false)
  }

  if (authError) {
    return (
      <div className="mp">
        <p className="mp-error">Couldn't connect to the multiplayer service.</p>
        <button type="button" className="back" onClick={onExit}>
          ← Back
        </button>
      </div>
    )
  }

  if (!uid) {
    return (
      <div className="mp">
        <div className="spinner" aria-hidden="true" />
        <p>Connecting…</p>
      </div>
    )
  }

  // In a room: lobby, or the round once it has started.
  if (code && room) {
    if (room.status === 'lobby') {
      return <Lobby code={code} uid={uid} isHost={isHost} room={room} onLeave={handleLeave} />
    }
    return (
      <MultiplayerRound
        code={code}
        uid={uid}
        isHost={isHost}
        room={room}
        offset={offset}
        onLeave={handleLeave}
      />
    )
  }

  if (code && !room) {
    return (
      <div className="mp">
        <div className="spinner" aria-hidden="true" />
        <p>Joining…</p>
      </div>
    )
  }

  return (
    <MultiplayerMenu
      nickname={nickname}
      busy={busy}
      error={menuError}
      notice={notice}
      onCreate={handleCreate}
      onJoin={handleJoin}
      onExit={onExit}
    />
  )
}
