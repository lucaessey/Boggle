/**
 * Pure, Firebase-free helpers for the multiplayer results reveals:
 * longest-word attribution (board vs. anyone-found, with collapse) and the
 * "found by others" set for missed-word markers.
 */
import { longestWords } from './results'

export interface RevealPlayer {
  id: string
  name: string
  words: string[]
}

export interface LongestFinder {
  word: string
  /** Player names who found this word (alphabetical); empty if nobody did. */
  finders: string[]
}

export interface LongestReveal {
  /** Longest word(s) on the board (all ties), each with its finders. */
  board: LongestFinder[]
  /** Longest word(s) actually found by any player (all ties), with finders. */
  found: LongestFinder[]
  /** True when board-longest and found-longest are the same word set. */
  collapsed: boolean
}

function lower(words: string[]): Set<string> {
  return new Set(words.map((w) => w.toLowerCase()))
}

export function longestReveal(boardWords: string[], players: RevealPlayer[]): LongestReveal {
  const sets = players.map((p) => ({ name: p.name, words: lower(p.words) }))
  const finders = (w: string) =>
    sets
      .filter((s) => s.words.has(w))
      .map((s) => s.name)
      .sort((a, b) => a.localeCompare(b))

  const boardLongest = longestWords(boardWords.map((w) => w.toLowerCase()))
  const board = boardLongest.map((w) => ({ word: w, finders: finders(w) }))

  const allFound = new Set<string>()
  for (const s of sets) for (const w of s.words) allFound.add(w)
  const foundLongest = longestWords([...allFound])
  const found = foundLongest.map((w) => ({ word: w, finders: finders(w) }))

  const collapsed =
    boardLongest.length > 0 &&
    boardLongest.length === foundLongest.length &&
    boardLongest.every((w, i) => w === foundLongest[i])

  return { board, found, collapsed }
}

/** Words found by any player OTHER than `myId` (lowercased) — for missed markers. */
export function othersFound(players: RevealPlayer[], myId: string): Set<string> {
  const set = new Set<string>()
  for (const p of players) {
    if (p.id === myId) continue
    for (const w of p.words) set.add(w.toLowerCase())
  }
  return set
}
