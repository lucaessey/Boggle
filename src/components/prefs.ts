/**
 * Last-used menu selections, persisted in localStorage. Guarded so a missing or
 * throwing localStorage (private mode, SSR) degrades to defaults.
 */
const SIZE_KEY = 'boggle.size'
const LENGTH_KEY = 'boggle.length'
const GOAL_KEY = 'boggle.peacefulGoal'
const NICKNAME_KEY = 'boggle.nickname'
const LB_CONSENT_KEY = 'boggle.leaderboardConsent'

/** Public-leaderboard opt-in: 'yes' submits, 'no' never prompts, null = unasked. */
export type LeaderboardConsent = 'yes' | 'no'

export function loadLeaderboardConsent(): LeaderboardConsent | null {
  try {
    const raw = localStorage.getItem(LB_CONSENT_KEY)
    return raw === 'yes' || raw === 'no' ? raw : null
  } catch {
    return null
  }
}

export function saveLeaderboardConsent(value: LeaderboardConsent): void {
  try {
    localStorage.setItem(LB_CONSENT_KEY, value)
  } catch {
    // ignore: persistence is best-effort
  }
}

export function loadNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveNickname(name: string): void {
  try {
    localStorage.setItem(NICKNAME_KEY, name)
  } catch {
    // ignore
  }
}

export interface Prefs {
  size: number | null
  length: number | null
  peacefulGoal: number | null
}

function readNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function writeNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // ignore: persistence is best-effort
  }
}

export function loadPrefs(): Prefs {
  return {
    size: readNumber(SIZE_KEY),
    length: readNumber(LENGTH_KEY),
    peacefulGoal: readNumber(GOAL_KEY),
  }
}

export function saveSize(size: number): void {
  writeNumber(SIZE_KEY, size)
}

export function saveLength(length: number): void {
  writeNumber(LENGTH_KEY, length)
}

export function savePeacefulGoal(goal: number): void {
  writeNumber(GOAL_KEY, goal)
}
