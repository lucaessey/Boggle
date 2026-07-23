import { describe, it, expect } from 'vitest'
import { generateBoard } from '../board/generate'
import { solveBoard } from './solver'
import { findWordsOfMinLength } from './findWords'

describe('findWordsOfMinLength', () => {
  it('early-exits after finding `count` words, without enumerating them all', () => {
    const board = generateBoard(6, 'find') // word-rich 6x6
    const allThreePlus = [...solveBoard(board).keys()].filter((w) => w.length >= 3)
    // Sanity: there are far more than 2 qualifying words to find.
    expect(allThreePlus.length).toBeGreaterThan(10)

    const result = findWordsOfMinLength(board, 3, 2)
    expect(result.words).toHaveLength(2)
    expect(result.earlyExit).toBe(true) // stopped early — did NOT enumerate the full set
    for (const w of result.words) expect(w.length).toBeGreaterThanOrEqual(3)
  })

  it('does not early-exit when fewer than `count` qualifying words exist', () => {
    // No 4x4 board has 5 distinct 15+ letter words, so the search exhausts.
    const board = generateBoard(4, 'find2')
    const result = findWordsOfMinLength(board, 15, 5)
    expect(result.earlyExit).toBe(false)
    expect(result.words.length).toBeLessThan(5)
  })

  it('only returns words of at least the requested length', () => {
    const board = generateBoard(7, 'find3')
    const result = findWordsOfMinLength(board, 6, 3)
    for (const w of result.words) expect(w.length).toBeGreaterThanOrEqual(6)
  })
})
