/**
 * Shared Firebase bootstrap — the ONE place the SDK is initialised and the
 * anonymous auth uid is cached. Every net/* module (room, leaderboard) reuses
 * this single app/auth/db so there is only ever one connection and one uid.
 *
 * The SDK is loaded via dynamic import(), so single-player users who never open
 * multiplayer or the global leaderboard never download it (it lands in its own
 * lazily-fetched chunk).
 */

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

export interface Fb {
  db: import('firebase/database').Database
  uid: string
  rt: Rt
}

let fbPromise: Promise<Fb> | null = null
let cachedUid: string | null = null

/** Initialise Firebase (dynamically) and sign in anonymously; the uid is cached. */
export async function fb(): Promise<Fb> {
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
