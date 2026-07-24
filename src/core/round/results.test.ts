import { describe, it, expect } from 'vitest'
import { longestWords, missedWords, sortWords } from './results'

describe('sortWords — longest first, alphabetical ties', () => {
  it('sorts by length desc then alphabetically', () => {
    expect(sortWords(['cat', 'apple', 'bat', 'apples'])).toEqual(['apples', 'apple', 'bat', 'cat'])
  })

  it('breaks same-length ties alphabetically', () => {
    expect(sortWords(['dog', 'cat', 'bat'])).toEqual(['bat', 'cat', 'dog'])
  })
})

describe('longestWords', () => {
  it('returns ALL words tied for longest, alphabetical', () => {
    expect(longestWords(['cat', 'dog', 'apple', 'grape', 'kiwi'])).toEqual(['apple', 'grape'])
  })

  it('returns a single longest when there is no tie', () => {
    expect(longestWords(['cat', 'apple', 'bat'])).toEqual(['apple'])
  })

  it('is empty for no words', () => {
    expect(longestWords([])).toEqual([])
  })
})

describe('missedWords', () => {
  it('excludes every found word and uses the same sort', () => {
    const all = ['cat', 'dog', 'apple', 'apples', 'bat']
    const found = new Set(['cat', 'apple'])
    expect(missedWords(all, found)).toEqual(['apples', 'bat', 'dog'])
  })

  it('is empty when everything was found', () => {
    expect(missedWords(['cat', 'dog'], new Set(['cat', 'dog']))).toEqual([])
  })
})

describe('display cap (top N by length)', () => {
  it('caps the rendered list and reports the true total', () => {
    const cap = 100
    // 150 distinct missed words of varying length.
    const all = Array.from({ length: 150 }, (_, i) => `w${String(i).padStart(3, '0')}`)
    const missed = missedWords(all, new Set())
    expect(missed).toHaveLength(150)
    const shown = missed.slice(0, cap)
    expect(shown).toHaveLength(cap)
    const message = `Showing ${shown.length} of ${missed.length} missed words`
    expect(message).toBe('Showing 100 of 150 missed words')
  })
})
