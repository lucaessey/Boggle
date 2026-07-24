import { useRef, useState } from 'react'
import balance from '../balance.json'
import type { Board } from '../core/board/types'
import { isValidWord } from '../core/dictionary/dictionary'
import { hasPath } from '../core/dictionary/solver'
import { scoreTracedWord } from '../core/round/bonusScoring'
import type { GameModeId } from '../core/round/modes'
import { classifySubmission, type SubmissionOutcome } from '../core/round/round'
import { hapticAccept } from './haptics'

const BASE_MIN_WORD_LENGTH = balance.minWordLength

export interface FoundWord {
  word: string
  points: number
  /** Bonus Tiles mode: this word's path crossed the double-letter tile. */
  doubleUsed?: boolean
  /** Bonus Tiles mode: this word's path crossed the triple-word tile. */
  tripleUsed?: boolean
}

export interface Feedback {
  outcome: SubmissionOutcome
  message: string
}

export interface GamePlayOptions {
  /** Minimum accepted word length (Long Words Only raises this to 5). */
  minWordLength?: number
  /** Active game mode — drives the too-short message and bonus scoring. */
  gameMode?: GameModeId
}

/**
 * Shared word-submission state (found list, score, feedback), used by the timed,
 * Peaceful and multiplayer rounds. `submit` classifies a word, scores/records it
 * if accepted, and returns the outcome. The traced `path` is passed through so
 * Bonus Tiles mode can score double-letter / triple-word crossings; typed words
 * (no traced path) fall back to any valid board path. `foundCount` is a ref so
 * callers can read the count synchronously right after submit.
 */
export function useGamePlay(board: Board, options: GamePlayOptions = {}) {
  const minWordLength = options.minWordLength ?? BASE_MIN_WORD_LENGTH
  const gameMode = options.gameMode ?? 'normal'
  const faces = board.cells.map((c) => c.face)

  const [found, setFound] = useState<FoundWord[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const foundSet = useRef<Set<string>>(new Set())
  const foundCount = useRef(0)

  function messageFor(outcome: SubmissionOutcome, word: string, pts: number): string {
    switch (outcome) {
      case 'too-short':
        return gameMode === 'long'
          ? `Long Words Only — ${minWordLength}+ letters`
          : `Too short (min ${minWordLength} letters)`
      case 'not-a-word':
        return `${word} isn't a word`
      case 'not-on-board':
        return `${word} isn't on the board`
      case 'already-found':
        return `Already found ${word}`
      case 'accepted':
        return `+${pts}  ${word}`
    }
  }

  function submit(
    word: string,
    providedPath?: number[] | null,
  ): { outcome: SubmissionOutcome; points: number } {
    // The path the player actually traced (drag), or any valid path (typed).
    const path = providedPath ?? hasPath(board, word.toLowerCase())
    const outcome = classifySubmission(word, foundSet.current, {
      minWordLength,
      isValid: isValidWord,
      isOnBoard: () => path !== null,
    })

    let points = 0
    if (outcome === 'accepted') {
      const scored = scoreTracedWord(word, path ?? [], board.bonus, faces)
      points = scored.points
      foundSet.current.add(word.toLowerCase())
      foundCount.current += 1
      setFound((prev) => [
        { word, points, doubleUsed: scored.doubleUsed, tripleUsed: scored.tripleUsed },
        ...prev,
      ])
      setScore((s) => s + points)
      hapticAccept()
    }
    setFeedback({ outcome, message: messageFor(outcome, word, points) })
    return { outcome, points }
  }

  function reset() {
    foundSet.current = new Set()
    foundCount.current = 0
    setFound([])
    setScore(0)
    setFeedback(null)
  }

  return { found, score, feedback, foundCount, submit, reset }
}
