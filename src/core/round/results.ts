/**
 * Pure, DOM-free helpers for the results screen word lists.
 * Sort order everywhere: longest first, ties broken alphabetically.
 */

export function byLengthThenAlpha(a: string, b: string): number {
  return b.length - a.length || a.localeCompare(b)
}

export function sortWords(words: readonly string[]): string[] {
  return [...words].sort(byLengthThenAlpha)
}

/** All words tied for the greatest length (alphabetical), or [] if none. */
export function longestWords(words: readonly string[]): string[] {
  let max = 0
  for (const w of words) if (w.length > max) max = w.length
  if (max === 0) return []
  return words.filter((w) => w.length === max).sort((a, b) => a.localeCompare(b))
}

/** Every word in `all` not in `found`, sorted longest-first / alphabetical. */
export function missedWords(all: readonly string[], found: ReadonlySet<string>): string[] {
  return sortWords(all.filter((w) => !found.has(w)))
}
