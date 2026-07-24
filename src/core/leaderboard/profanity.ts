/**
 * Basic display-name validation + profanity filter for public leaderboard
 * names. Intentionally simple: trims, caps length, and rejects names containing
 * a small blocklist of slurs/obscenities (letters-only, case-insensitive
 * substring match, so "sh1t"/"s h i t" spacing tricks that survive the strip are
 * still caught). Not exhaustive — a first line of defence, not a guarantee.
 */

export const MAX_NAME_LENGTH = 12

// Letters-only roots; matched as substrings against the stripped, lowercased name.
const BLOCKLIST = [
  'fuck',
  'shit',
  'cunt',
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  'bitch',
  'dick',
  'cock',
  'pussy',
  'asshole',
  'bastard',
  'whore',
  'slut',
  'rape',
  'nazi',
]

export type NameCheck = { ok: true; name: string } | { ok: false; message: string }

export function validateName(raw: string): NameCheck {
  const name = raw.trim()
  if (name.length === 0) return { ok: false, message: 'Please enter a name.' }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, message: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` }
  }
  const stripped = name.toLowerCase().replace(/[^a-z]/g, '')
  if (BLOCKLIST.some((bad) => stripped.includes(bad))) {
    return { ok: false, message: 'Please choose a different name.' }
  }
  return { ok: true, name }
}
