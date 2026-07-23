import { describe, it, expect } from 'vitest'
import { isValidWord, getTrie } from './dictionary'

describe('isValidWord', () => {
  it('accepts known words regardless of case', () => {
    expect(isValidWord('cat')).toBe(true)
    expect(isValidWord('CAT')).toBe(true)
    expect(isValidWord('Dog')).toBe(true)
    expect(isValidWord('quiz')).toBe(true)
  })

  it('rejects non-words', () => {
    expect(isValidWord('zzzzz')).toBe(false)
    expect(isValidWord('qwxz')).toBe(false)
  })

  it('rejects words shorter than minWordLength (3)', () => {
    expect(isValidWord('at')).toBe(false)
    expect(isValidWord('a')).toBe(false)
    expect(isValidWord('')).toBe(false)
  })

  it('respects the length filter bounds', () => {
    // 16 letters is the max kept; 18-letter words were filtered out.
    expect(isValidWord('worthwhilenesses')).toBe(true) // 16
    expect(isValidWord('absentmindednesses')).toBe(false) // 18, filtered
  })
})

describe('trie prefix queries', () => {
  it('reports live prefixes', () => {
    const trie = getTrie()
    expect(trie.hasPrefix('ca')).toBe(true)
    expect(trie.hasPrefix('qu')).toBe(true)
  })

  it('reports dead prefixes', () => {
    const trie = getTrie()
    expect(trie.hasPrefix('qz')).toBe(false)
    expect(trie.hasPrefix('zx')).toBe(false)
  })
})
