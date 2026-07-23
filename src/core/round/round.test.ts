import { describe, it, expect } from 'vitest'
import { classifySubmission, type SubmissionDeps } from './round'

// Fake dictionary: only these words are "real".
const REAL = new Set(['cat', 'dog', 'queen', 'zebra'])
// Fake board: every real word is reachable EXCEPT "zebra" (valid but not on board).
const ON_BOARD = new Set(['cat', 'dog', 'queen'])
const deps: SubmissionDeps = {
  minWordLength: 3,
  isValid: (w) => REAL.has(w),
  isOnBoard: (w) => ON_BOARD.has(w),
}

describe('classifySubmission', () => {
  it('rejects too-short words first, even if they would be real', () => {
    expect(classifySubmission('at', new Set(), deps)).toBe('too-short')
    expect(classifySubmission('ca', new Set(), deps)).toBe('too-short')
  })

  it('rejects non-words that are long enough', () => {
    expect(classifySubmission('zzz', new Set(), deps)).toBe('not-a-word')
  })

  it('reports not-on-board for a valid word not reachable on the board', () => {
    // "zebra" is a real word but not traceable on this board.
    expect(classifySubmission('zebra', new Set(), deps)).toBe('not-on-board')
  })

  it('reports already-found for a valid, on-board word in the found set', () => {
    expect(classifySubmission('cat', new Set(['cat']), deps)).toBe('already-found')
  })

  it('accepts a valid, on-board, not-yet-found word', () => {
    expect(classifySubmission('dog', new Set(['cat']), deps)).toBe('accepted')
  })

  it('is case-insensitive and matches the lowercase found set', () => {
    expect(classifySubmission('QUEEN', new Set(), deps)).toBe('accepted')
    expect(classifySubmission('Queen', new Set(['queen']), deps)).toBe('already-found')
  })

  it('respects the full priority order', () => {
    // too-short beats everything
    expect(classifySubmission('ca', new Set(['ca']), deps)).toBe('too-short')
    // not-a-word beats not-on-board (a non-word is also not on the board)
    expect(classifySubmission('zzz', new Set(), deps)).toBe('not-a-word')
    // not-on-board beats already-found (checked before the found set)
    expect(classifySubmission('zebra', new Set(['zebra']), deps)).toBe('not-on-board')
  })
})
