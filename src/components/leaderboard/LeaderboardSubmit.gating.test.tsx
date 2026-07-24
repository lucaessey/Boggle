// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { Board } from '../../core/board/types'
import { Results, type SolveState } from '../Results'

afterEach(cleanup)
beforeEach(() => localStorage.clear())

function board4(): Board {
  const faces = 'ABCDEFGHIJKLMNOP'.split('')
  return {
    size: 4,
    seed: 't',
    cells: faces.map((face, index) => ({ index, row: Math.floor(index / 4), col: index % 4, face })),
  }
}

const solve: SolveState = { status: 'ready', total: 1, paths: new Map([['cat', [0, 1, 2]]]) }
const base = {
  heading: 'Time!',
  board: board4(),
  score: 5,
  found: [{ word: 'CAT', points: 1 }],
  solve,
  onPlayAgain: () => {},
  onChangeSettings: () => {},
}

const consentPrompt = (c: HTMLElement) => c.querySelector('.lb-consent')

describe('leaderboard submit gating', () => {
  it('peaceful / multiplayer results (no leaderboard prop) never mount the submit UI', () => {
    const { container } = render(<Results {...base} />)
    expect(consentPrompt(container)).toBeNull() // no opt-in, no write path
  })

  it('a solo timed round with no prior choice shows the opt-in prompt', () => {
    const { container } = render(<Results {...base} leaderboard={{ size: 4, seconds: 60 }} />)
    expect(consentPrompt(container)).not.toBeNull()
    expect(container.querySelector('.lb-name-input')).not.toBeNull()
  })

  it('a player who declined is never prompted again', () => {
    localStorage.setItem('boggle.leaderboardConsent', 'no')
    const { container } = render(<Results {...base} leaderboard={{ size: 4, seconds: 60 }} />)
    expect(consentPrompt(container)).toBeNull()
  })
})
