/**
 * Early-exit word search used by board-quality checks.
 *
 * Unlike `solveBoard`, this stops as soon as it has found `count` distinct words
 * of at least `minLength` letters — cheap enough to run in a generation reroll
 * loop even on a 49-tile board. DFS with trie prefix pruning and no cell reuse;
 * a "Qu" tile contributes both letters.
 */
import { neighbours } from '../board/board'
import type { Board } from '../board/types'
import { getTrie } from './dictionary'
import type { TrieNode } from './trie'

export interface FindResult {
  /** Up to `count` distinct qualifying words. */
  words: string[]
  /** True if the search stopped early after reaching `count` (did not exhaust). */
  earlyExit: boolean
}

export function findWordsOfMinLength(
  board: Board,
  minLength: number,
  count: number,
): FindResult {
  const trie = getTrie()
  const found = new Set<string>()
  const visited = new Array<boolean>(board.cells.length).fill(false)
  const faces = board.cells.map((c) => c.face.toLowerCase())
  let earlyExit = false

  const visit = (index: number, node: TrieNode, word: string): boolean => {
    let next: TrieNode | undefined = node
    for (const ch of faces[index]) {
      next = next.children.get(ch)
      if (!next) return false
    }
    const nextWord = word + faces[index]
    visited[index] = true

    if (nextWord.length >= minLength && next.isWord && !found.has(nextWord)) {
      found.add(nextWord)
      if (found.size >= count) {
        visited[index] = false
        earlyExit = true
        return true // signal: stop the whole search
      }
    }

    for (const nb of neighbours(index, board.size)) {
      if (!visited[nb] && visit(nb, next, nextWord)) {
        visited[index] = false
        return true
      }
    }

    visited[index] = false
    return false
  }

  for (let i = 0; i < board.cells.length; i++) {
    if (visit(i, trie.root, '')) break
  }

  return { words: [...found], earlyExit }
}
