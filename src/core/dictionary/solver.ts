/**
 * Board solver: enumerate every valid dictionary word findable on a board.
 *
 * Pure and DOM-free. DFS from each cell, pruning branches that are not a live
 * trie prefix, never reusing a cell within one word's path. A "Qu" tile
 * contributes both letters ("qu") to the word and to the prefix walk.
 */
import balance from '../../balance.json'
import { neighbours } from '../board/board'
import type { Board } from '../board/types'
import { getTrie } from './dictionary'
import type { Trie, TrieNode } from './trie'

const MIN_LEN = balance.minWordLength

/** Map of word -> one example path (ordered cell indices spelling it). */
export type SolveResult = Map<string, number[]>

export function solveBoard(board: Board): SolveResult {
  const trie: Trie = getTrie()
  const results: SolveResult = new Map()
  const visited = new Array<boolean>(board.cells.length).fill(false)
  const path: number[] = []

  // Lowercased face string per cell ("qu" for a Qu tile, single char otherwise).
  const faces = board.cells.map((c) => c.face.toLowerCase())

  const visit = (index: number, node: TrieNode, word: string) => {
    // Walk the trie across this cell's letters; prune if any edge is missing.
    let next: TrieNode | undefined = node
    for (const ch of faces[index]) {
      next = next.children.get(ch)
      if (!next) return
    }

    const nextWord = word + faces[index]
    visited[index] = true
    path.push(index)

    if (nextWord.length >= MIN_LEN && next.isWord && !results.has(nextWord)) {
      results.set(nextWord, [...path])
    }

    for (const nb of neighbours(index)) {
      if (!visited[nb]) visit(nb, next, nextWord)
    }

    visited[index] = false
    path.pop()
  }

  for (let i = 0; i < board.cells.length; i++) {
    visit(i, trie.root, '')
  }

  return results
}
