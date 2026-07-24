// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { Board } from '../core/board/types'
import { Results, type SolveState } from './Results'

afterEach(cleanup)

function board4(): Board {
  const faces = 'ABCDEFGHIJKLMNOP'.split('')
  return {
    size: 4,
    seed: 't',
    cells: faces.map((face, index) => ({ index, row: Math.floor(index / 4), col: index % 4, face })),
  }
}

const baseProps = {
  heading: 'Time!',
  board: board4(),
  score: 3,
  found: [{ word: 'CAT', points: 1 }],
  onPlayAgain: () => {},
  onChangeSettings: () => {},
}

const revealButtons = (c: HTMLElement) =>
  [...c.querySelectorAll('button')].filter((b) => /Reveal/.test(b.textContent || ''))

describe('Results reveal buttons', () => {
  it('are disabled while the solve is still running', () => {
    const solve: SolveState = { status: 'solving' }
    const { container } = render(<Results {...baseProps} solve={solve} />)
    const buttons = revealButtons(container)
    expect(buttons.length).toBe(2)
    expect(buttons.every((b) => b.disabled)).toBe(true)
    expect(container.querySelector('.mini-spinner')).not.toBeNull()
  })

  it('are enabled once the solve resolves', () => {
    const solve: SolveState = {
      status: 'ready',
      total: 2,
      paths: new Map([
        ['cat', [0, 1, 2]],
        ['dog', [4, 5, 6]],
      ]),
    }
    const { container } = render(<Results {...baseProps} solve={solve} />)
    const buttons = revealButtons(container)
    expect(buttons.every((b) => !b.disabled)).toBe(true)
  })

  it('hides the reveal options entirely when the solve failed', () => {
    const solve: SolveState = { status: 'failed' }
    const { container } = render(<Results {...baseProps} solve={solve} />)
    expect(revealButtons(container).length).toBe(0)
  })
})
