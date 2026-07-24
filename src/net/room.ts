/**
 * The ONLY module that touches Firebase. Everything else in the codebase stays
 * pure and offline-testable. The Firebase SDK is loaded via dynamic import(),
 * so single-player users never download it (it lands in its own chunk, fetched
 * lazily the first time this module talks to the network).
 */
import { allocateRoomCode } from './roomCode'
import { joinability, type JoinResult, type RoomSettings, type RoomState } from './roomTypes'

// Public by design — security is enforced by database rules. No Analytics.
const firebaseConfig = {
  apiKey: 'AIzaSyD-w0dLL4Xyl1x0mh7LgYHfG4ub7VwLH6I',
  authDomain: 'boggle-39fd3.firebaseapp.com',
  databaseURL: 'https://boggle-39fd3-default-rtdb.firebaseio.com',
  projectId: 'boggle-39fd3',
  storageBucket: 'boggle-39fd3.firebasestorage.app',
  messagingSenderId: '1034645884557',
  appId: '1:1034645884557:web:d02473662839d891f69cc4',
}

type Rt = typeof import('firebase/database')

interface Fb {
  db: import('firebase/database').Database
  uid: string
  rt: Rt
}

let fbPromise: Promise<Fb> | null = null
let cachedUid: string | null = null

/** Initialise Firebase (dynamically) and sign in anonymously; the uid is cached. */
async function fb(): Promise<Fb> {
  if (fbPromise) return fbPromise
  fbPromise = (async () => {
    const [appMod, authMod, rt] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/database'),
    ])
    const app = appMod.initializeApp(firebaseConfig)
    const auth = authMod.getAuth(app)
    const db = rt.getDatabase(app)
    const cred = await authMod.signInAnonymously(auth)
    cachedUid = cred.user.uid
    return { db, uid: cred.user.uid, rt }
  })()
  return fbPromise
}

/** Sign in (anonymous) and return the player id (auth uid). */
export async function ensureAuth(): Promise<string> {
  return (await fb()).uid
}

export function currentUid(): string | null {
  return cachedUid
}

/** onDisconnect wiring: mark disconnected; the host additionally closes the room. */
async function setupDisconnect(fbi: Fb, code: string, isHost: boolean) {
  const { db, uid, rt } = fbi
  await rt.onDisconnect(rt.ref(db, `rooms/${code}/players/${uid}/connected`)).set(false)
  if (isHost) {
    await rt.onDisconnect(rt.ref(db, `rooms/${code}`)).remove()
  }
}

/** Create a room, become its host, and return the (collision-free) code. */
export async function createRoom(name: string, settings: RoomSettings): Promise<string> {
  const fbi = await fb()
  const { db, uid, rt } = fbi
  const code = await allocateRoomCode(async (c) => {
    const snap = await rt.get(rt.ref(db, `rooms/${c}`))
    return snap.exists()
  })
  await rt.set(rt.ref(db, `rooms/${code}`), {
    hostId: uid,
    createdAt: rt.serverTimestamp(),
    status: 'lobby',
    settings,
    players: { [uid]: { name, joinedAt: rt.serverTimestamp(), connected: true } },
  })
  await setupDisconnect(fbi, code, true)
  return code
}

/** Join an existing room. Returns 'ok' or a distinct rejection reason. */
export async function joinRoom(code: string, name: string): Promise<JoinResult> {
  const fbi = await fb()
  const { db, uid, rt } = fbi
  const snap = await rt.get(rt.ref(db, `rooms/${code}`))
  const room = snap.val() as RoomState | null
  const verdict = joinability(room, uid)
  if (verdict !== 'ok') return verdict
  await rt.set(rt.ref(db, `rooms/${code}/players/${uid}`), {
    name,
    joinedAt: rt.serverTimestamp(),
    connected: true,
  })
  await setupDisconnect(fbi, code, false)
  return 'ok'
}

/** Live-subscribe to a room. Calls back with null when the room is gone. */
export function subscribeRoom(code: string, cb: (room: RoomState | null) => void): () => void {
  let off: (() => void) | null = null
  let cancelled = false
  fb().then(({ db, rt }) => {
    if (cancelled) return
    off = rt.onValue(rt.ref(db, `rooms/${code}`), (snap) => cb(snap.val()))
  })
  return () => {
    cancelled = true
    off?.()
  }
}

/** Live-subscribe to the estimated server/client clock offset (ms). */
export function subscribeServerOffset(cb: (offsetMs: number) => void): () => void {
  let off: (() => void) | null = null
  let cancelled = false
  fb().then(({ db, rt }) => {
    if (cancelled) return
    off = rt.onValue(rt.ref(db, '.info/serverTimeOffset'), (snap) => cb(Number(snap.val()) || 0))
  })
  return () => {
    cancelled = true
    off?.()
  }
}

/** Host updates the room settings (size/seconds), broadcast live to everyone. */
export async function updateSettings(code: string, settings: RoomSettings): Promise<void> {
  const { db, rt } = await fb()
  await rt.update(rt.ref(db, `rooms/${code}/settings`), settings)
}

/** Host starts a round: fresh seed, server-timestamped startAt, countdown. */
export async function startRound(code: string, seed: string): Promise<void> {
  const { db, rt } = await fb()
  await rt.update(rt.ref(db, `rooms/${code}`), {
    seed,
    startAt: rt.serverTimestamp(),
    status: 'countdown',
    results: null, // clear any previous round's results
  })
}

export async function setStatus(code: string, status: RoomState['status']): Promise<void> {
  const { db, rt } = await fb()
  await rt.set(rt.ref(db, `rooms/${code}/status`), status)
}

/** Each client writes its full word list and raw score at round end. */
export async function submitResults(code: string, words: string[], score: number): Promise<void> {
  const { db, uid, rt } = await fb()
  await rt.set(rt.ref(db, `rooms/${code}/results/${uid}`), {
    words,
    score,
    submittedAt: rt.serverTimestamp(),
  })
}

/** Leave a room. The host removes the whole room; others remove themselves. */
export async function leaveRoom(code: string, isHost: boolean): Promise<void> {
  const { db, uid, rt } = await fb()
  await rt.remove(rt.ref(db, isHost ? `rooms/${code}` : `rooms/${code}/players/${uid}`))
}
