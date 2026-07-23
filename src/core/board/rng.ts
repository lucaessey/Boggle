/**
 * Deterministic, dependency-free seeded RNG.
 *
 * Pure and DOM-free: given the same seed, `Rng` always produces the same
 * sequence. Used so that board generation is reproducible from a seed.
 *
 * Implementation: a 32-bit string hash (xfnv1a) turns the seed into a numeric
 * state, which drives the `mulberry32` generator. Both are small, well-known,
 * and fast — no external package needed.
 */

/** Hash an arbitrary seed (number or string) into a 32-bit unsigned integer. */
function hashSeed(seed: number | string): number {
  const str = typeof seed === 'number' ? String(seed) : seed
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export class Rng {
  private state: number

  constructor(seed: number | string) {
    // Ensure a non-zero state so the generator never degenerates.
    this.state = hashSeed(seed) || 0x9e3779b9
  }

  /** Next float in the half-open interval [0, 1). */
  next(): number {
    // mulberry32
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = this.state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Integer in the half-open interval [min, max). */
  intBetween(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min))
  }
}
