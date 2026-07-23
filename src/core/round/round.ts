/**
 * Pure, DOM-free round logic: classify a word submission.
 *
 * The dictionary and board-presence checks are injected via `deps` so this
 * module stays pure and unit-testable without loading the full word list or a
 * real board. All comparisons are case-insensitive; the found set is expected to
 * hold lowercase words.
 */

export type SubmissionOutcome =
  | 'too-short'
  | 'not-a-word'
  | 'not-on-board'
  | 'already-found'
  | 'accepted'

export interface SubmissionDeps {
  /** Minimum accepted word length (from balance.json). */
  minWordLength: number
  /** Dictionary validity check. */
  isValid: (word: string) => boolean
  /** Whether the word can be traced on the current board. */
  isOnBoard: (word: string) => boolean
}

/**
 * Determine the outcome of submitting `word`, checked in priority order:
 * too short -> not a real word -> not present on this board -> already found ->
 * accepted.
 */
export function classifySubmission(
  word: string,
  found: ReadonlySet<string>,
  deps: SubmissionDeps,
): SubmissionOutcome {
  const normalized = word.toLowerCase()
  if (normalized.length < deps.minWordLength) return 'too-short'
  if (!deps.isValid(normalized)) return 'not-a-word'
  if (!deps.isOnBoard(normalized)) return 'not-on-board'
  if (found.has(normalized)) return 'already-found'
  return 'accepted'
}
