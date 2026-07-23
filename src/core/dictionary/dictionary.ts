/**
 * Dictionary: the bundled ENABLE word list compiled into a trie.
 *
 * Pure and DOM-free. The word list is imported as raw text (Vite `?raw`) and
 * compiled into a trie lazily on first use, then cached for the process.
 */
import balance from '../../balance.json'
import enableText from './enable.txt?raw'
import { Trie } from './trie'

const MIN_LEN = balance.minWordLength
const MAX_LEN = balance.maxWordLength

let cached: Trie | undefined

/** Build (once) and return the dictionary trie. */
export function getTrie(): Trie {
  if (cached) return cached
  const trie = new Trie()
  for (const raw of enableText.split('\n')) {
    const word = raw.trim()
    if (word.length >= MIN_LEN && word.length <= MAX_LEN) {
      trie.insert(word)
    }
  }
  cached = trie
  return trie
}

/** Fast, case-insensitive lookup: is `word` a valid dictionary word? */
export function isValidWord(word: string): boolean {
  const w = word.toLowerCase()
  if (w.length < MIN_LEN || w.length > MAX_LEN) return false
  return getTrie().has(w)
}
