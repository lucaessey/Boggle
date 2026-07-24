/**
 * Pure room-code helpers (no Firebase). Codes are 5 uppercase letters, excluding
 * I, O and Q to avoid confusion with 1, 0 and each other.
 */

// A–Z without I, O, Q (23 letters).
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPRSTUVWXYZ'
export const ROOM_CODE_LENGTH = 5

/** Generate one candidate room code from a [0,1) random source. */
export function generateRoomCode(rand: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(rand() * ROOM_CODE_ALPHABET.length)]
  }
  return code
}

/**
 * Generate a code that does not collide, checking each candidate with `exists`
 * and retrying on collision.
 */
export async function allocateRoomCode(
  exists: (code: string) => Promise<boolean>,
  rand: () => number = Math.random,
  maxAttempts = 50,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode(rand)
    if (!(await exists(code))) return code
  }
  throw new Error('Could not allocate a free room code')
}
