import { useRef, useState } from 'react'
import balance from '../balance.json'
import type { Board } from '../core/board/types'
import { isValidWord } from '../core/dictionary/dictionary'
import { hasPath } from '../core/dictionary/solver'
import { classifySubmission, type SubmissionOutcome } from '../core/round/round'
import { scoreForWord } from '../core/round/scoring'
import { hapticAccept } from './haptics'

const MIN_WORD_LENGTH = balance.minWordLength

export interface FoundWord {
  word: string
  points: number
}

export interface Feedback {
  outcome: SubmissionOutcome
  message: string
}

const FEEDBACK_MESSAGES: Record<SubmissionOutcome, (word: string, pts: number) => string> = {
  'too-short': () => `Too short (min ${MIN_WORD_LENGTH} letters)`,
  'not-a-word': (word) => `${word} isn't a word`,
  'not-on-board': (word) => `${word} isn't on the board`,
  'already-found': (word) => `Already found ${word}`,
  accepted: (word, pts) => `+${pts}  ${word}`,
}

/**
 * Shared word-submission state (found list, score, feedback), used by both the
 * timed and Peaceful rounds. `submit` classifies a word, scores/records it if
 * accepted, and returns the outcome so the caller can react (e.g. Peaceful mode
 * checking the goal). `foundCount` is a ref so callers can read the count
 * synchronously right after submit without waiting for a re-render.
 */
export function useGamePlay(board: Board) {
  const [found, setFound] = useState<FoundWord[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const foundSet = useRef<Set<string>>(new Set())
  const foundCount = useRef(0)

  function submit(word: string): SubmissionOutcome {
    const outcome = classifySubmission(word, foundSet.current, {
      minWordLength: MIN_WORD_LENGTH,
      isValid: isValidWord,
      isOnBoard: (w) => hasPath(board, w) !== null,
    })
    const points = outcome === 'accepted' ? scoreForWord(word) : 0
    if (outcome === 'accepted') {
      foundSet.current.add(word.toLowerCase())
      foundCount.current += 1
      setFound((prev) => [{ word, points }, ...prev])
      setScore((s) => s + points)
      hapticAccept()
    }
    setFeedback({ outcome, message: FEEDBACK_MESSAGES[outcome](word, points) })
    return outcome
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
