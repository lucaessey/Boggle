import { describe, expect, it } from 'vitest'
import { MAX_NAME_LENGTH, validateName } from './profanity'

describe('validateName', () => {
  it('accepts a normal name and trims surrounding whitespace', () => {
    expect(validateName('  Warren  ')).toEqual({ ok: true, name: 'Warren' })
  })

  it('rejects an empty or whitespace-only name', () => {
    expect(validateName('')).toEqual({ ok: false, message: expect.any(String) })
    expect(validateName('   ').ok).toBe(false)
  })

  it(`rejects names longer than ${MAX_NAME_LENGTH} characters`, () => {
    expect(validateName('a'.repeat(MAX_NAME_LENGTH)).ok).toBe(true)
    expect(validateName('a'.repeat(MAX_NAME_LENGTH + 1)).ok).toBe(false)
  })

  it('rejects profanity, including spacing/punctuation tricks that survive stripping', () => {
    expect(validateName('shithead').ok).toBe(false)
    expect(validateName('sh it').ok).toBe(false) // strips to "shit"
    expect(validateName('a.s.s.h.o.l.e').ok).toBe(false)
  })

  it('accepts innocuous names', () => {
    expect(validateName('Wordsmith').ok).toBe(true)
    expect(validateName('Ace 123').ok).toBe(true)
  })
})
