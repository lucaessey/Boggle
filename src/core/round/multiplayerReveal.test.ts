import { describe, it, expect } from 'vitest'
import { neighbours } from '../board/board'
import { generateBoard } from '../board/generate'
import { solveBoard } from '../dictionary/solver'
import { computeMultiplayerScores } from './multiplayerScoring'
import { byLengthThenAlpha } from './results'
import { longestReveal, othersFound, type RevealPlayer } from './multiplayerReveal'

const P = (id: string, words: string[]): RevealPlayer => ({ id, name: id, words })
const scoreFor = () => 10

// Board words (from the solver). "planets" (7) is the sole longest.
const BOARD = ['planets', 'planet', 'plane', 'net', 'ten', 'pea']

describe('longestReveal — attribution for the board longest', () => {
  it('names the single finder when one player found it', () => {
    const r = longestReveal(BOARD, [P('a', ['planets']), P('b', ['plane'])])
    expect(r.board).toEqual([{ word: 'planets', finders: ['a'] }])
  })

  it('names all finders when several players found it', () => {
    const r = longestReveal(BOARD, [P('a', ['planets']), P('b', ['planets']), P('c', ['net'])])
    expect(r.board[0].finders).toEqual(['a', 'b'])
  })

  it('reports nobody when the board longest was not found', () => {
    const r = longestReveal(BOARD, [P('a', ['plane']), P('b', ['net'])])
    expect(r.board).toEqual([{ word: 'planets', finders: [] }]) // "Nobody found this"
  })
})

describe('longestReveal — collapse rule', () => {
  it('collapses when the board longest and the longest found are the same word', () => {
    const r = longestReveal(BOARD, [P('a', ['planets']), P('b', ['plane'])])
    expect(r.collapsed).toBe(true)
    expect(r.found).toEqual([{ word: 'planets', finders: ['a'] }])
  })

  it('does NOT collapse when nobody found the board longest', () => {
    const r = longestReveal(BOARD, [P('a', ['plane']), P('b', ['plane'])])
    expect(r.collapsed).toBe(false)
    expect(r.board).toEqual([{ word: 'planets', finders: [] }])
    expect(r.found).toEqual([{ word: 'plane', finders: ['a', 'b'] }]) // longest anyone found
  })
})

describe('longestReveal — ties', () => {
  it('handles multiple board words of equal longest length', () => {
    const board = ['ropes', 'stone', 'net'] // ropes & stone both length 5
    const r = longestReveal(board, [P('a', ['ropes']), P('b', ['stone'])])
    expect(r.board.map((e) => e.word)).toEqual(['ropes', 'stone']) // both shown, alpha
    expect(r.board.find((e) => e.word === 'ropes')?.finders).toEqual(['a'])
    expect(r.board.find((e) => e.word === 'stone')?.finders).toEqual(['b'])
  })

  it('handles several different longest words each with its finder in found', () => {
    const board = ['ropes', 'stone', 'net']
    const r = longestReveal(board, [P('a', ['ropes']), P('b', ['stone'])])
    expect(r.found.map((e) => e.word)).toEqual(['ropes', 'stone'])
  })
})

describe('othersFound (missed-word markers)', () => {
  it('is the union of words found by everyone except me', () => {
    const players = [P('me', ['cat']), P('a', ['dog', 'bird']), P('b', ['bird'])]
    const set = othersFound(players, 'me')
    expect([...set].sort()).toEqual(['bird', 'dog'])
    expect(set.has('cat')).toBe(false) // my own word not included
  })
})

describe("another player's word list — sort + 2x markers match scoring", () => {
  it('sorts longest-first alphabetical and flags bonuses from the computed scoring', () => {
    // 'cat' unique to b (2x); 'dog' shared (base); 'apple' unique to b (2x).
    const scores = computeMultiplayerScores(
      [
        { uid: 'a', name: 'A', words: ['dog'] },
        { uid: 'b', name: 'B', words: ['cat', 'dog', 'apple'] },
      ],
      scoreFor,
    )
    const b = scores.find((s) => s.uid === 'b')!
    const sorted = [...b.words].sort((x, y) => byLengthThenAlpha(x.word, y.word))
    expect(sorted.map((w) => w.word)).toEqual(['apple', 'cat', 'dog']) // longest first, ties alpha
    // 2x markers come straight from the computed scoring.
    expect(sorted.find((w) => w.word === 'cat')?.bonus).toBe(true)
    expect(sorted.find((w) => w.word === 'apple')?.bonus).toBe(true)
    expect(sorted.find((w) => w.word === 'dog')?.bonus).toBe(false)
  })
})

describe('tapping a word uses a valid board path', () => {
  it('every word a player could have found has a legal solveBoard path', () => {
    const board = generateBoard(4, 'mp-paths')
    const solved = solveBoard(board)
    // A "player" found some real board words; tapping uses solved.get(word).
    for (const word of [...solved.keys()].slice(0, 20)) {
      const path = solved.get(word)!
      expect(new Set(path).size).toBe(path.length) // no reuse
      for (let i = 1; i < path.length; i++) {
        expect(neighbours(path[i - 1], board.size)).toContain(path[i]) // adjacent
      }
    }
  })
})
