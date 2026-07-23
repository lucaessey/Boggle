/**
 * Minimal prefix trie over lowercase words.
 *
 * Pure and DOM-free. Used by the dictionary for O(word length) validity lookups
 * and by the solver for prefix pruning during DFS.
 */
export class TrieNode {
  readonly children = new Map<string, TrieNode>()
  isWord = false
}

export class Trie {
  readonly root = new TrieNode()

  /** Insert a lowercase word. */
  insert(word: string): void {
    let node = this.root
    for (const ch of word) {
      let next = node.children.get(ch)
      if (!next) {
        next = new TrieNode()
        node.children.set(ch, next)
      }
      node = next
    }
    node.isWord = true
  }

  /** Return the node reached by following `prefix`, or undefined if none. */
  node(prefix: string): TrieNode | undefined {
    let node: TrieNode | undefined = this.root
    for (const ch of prefix) {
      node = node.children.get(ch)
      if (!node) return undefined
    }
    return node
  }

  /** Is `word` a complete word in the trie? */
  has(word: string): boolean {
    return this.node(word)?.isWord ?? false
  }

  /** Is `prefix` a prefix of at least one word in the trie? */
  hasPrefix(prefix: string): boolean {
    return this.node(prefix) !== undefined
  }
}
