import { describe, expect, it } from 'vitest'
import {
  isGameModeId,
  LONG_MODE_MIN_LENGTH,
  MODE_ORDER,
  minWordLengthForMode,
  requiresClock,
} from './modes'
import { classifySubmission } from './round'

describe('mode registry', () => {
  it('lists the four modes in order', () => {
    expect(MODE_ORDER).toEqual(['normal', 'blitz', 'long', 'bonus'])
  })

  it('validates mode ids', () => {
    expect(isGameModeId('blitz')).toBe(true)
    expect(isGameModeId('nope')).toBe(false)
    expect(isGameModeId(undefined)).toBe(false)
  })

  it('only Blitz requires a clock', () => {
    expect(requiresClock('blitz')).toBe(true)
    for (const id of ['normal', 'long', 'bonus'] as const) {
      expect(requiresClock(id)).toBe(false)
    }
  })

  it('raises the minimum word length only for Long Words Only', () => {
    expect(minWordLengthForMode('long', 3)).toBe(LONG_MODE_MIN_LENGTH)
    expect(minWordLengthForMode('normal', 3)).toBe(3)
    expect(minWordLengthForMode('blitz', 3)).toBe(3)
    expect(minWordLengthForMode('bonus', 3)).toBe(3)
  })
})

describe('Long Words Only length rule', () => {
  const deps = {
    minWordLength: minWordLengthForMode('long', 3), // 5
    isValid: () => true, // pretend every word is a dictionary word
    isOnBoard: () => true, // and traceable
  }

  it('rejects a 4-letter word as too short', () => {
    expect(classifySubmission('word', new Set(), deps)).toBe('too-short')
  })

  it('accepts a 5-letter word', () => {
    expect(classifySubmission('words', new Set(), deps)).toBe('accepted')
  })
})
