import { describe, it, expect } from 'vitest'
import balance from './balance.json'

// Smoke test: confirms the Vitest runner works and that balance.json — the
// single source of truth for tunable constants — loads and has the expected
// shape. Replaced/expanded by real module tests as features land.
describe('vitest setup', () => {
  it('runs', () => {
    expect(true).toBe(true)
  })

  it('loads balance.json with the core constants', () => {
    expect(balance.minWordLength).toBe(3)
    expect(balance.maxPlayers).toBe(6)
    expect(Object.keys(balance.sizes).sort()).toEqual(['4', '5', '6', '7'])
  })
})
