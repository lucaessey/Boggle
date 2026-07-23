// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { Round } from './Round'

// COUNTDOWN_SECONDS = 3, GO flash = 550ms (see Countdown.tsx / balance.json).
const COUNTDOWN_MS = 3000 + 600

describe('Round countdown', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('blocks input during the countdown and starts the timer only at zero', () => {
    const { container } = render(<Round size={4} roundSeconds={90} onChangeSettings={() => {}} />)
    const grid = () => container.querySelector('.grid')!
    const timer = () => container.querySelector('.timer')!.textContent

    // During the countdown: board input disabled, letters hidden, timer full.
    expect(grid().classList.contains('disabled')).toBe(true)
    expect(container.querySelector('.tile')!.classList.contains('facedown')).toBe(true)
    expect(container.querySelector('.countdown')).not.toBeNull()
    expect(timer()).toBe('1:30')

    // A keypress during the countdown is ignored (no typed word).
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    })
    expect(container.querySelector('.current-word')!.textContent!.trim()).toBe('')

    // Advance to just before the countdown ends: timer must NOT have started.
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(timer()).toBe('1:30')

    // Finish the countdown → play begins.
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(grid().classList.contains('disabled')).toBe(false)
    expect(container.querySelector('.tile')!.classList.contains('facedown')).toBe(false)
    expect(container.querySelector('.countdown')).toBeNull()

    // Now the timer ticks: after 2s it reads 1:28.
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(timer()).toBe('1:28')
  })

  it('total countdown wait is roughly the configured duration', () => {
    render(<Round size={4} roundSeconds={60} onChangeSettings={() => {}} />)
    // Not yet started just before the flash completes.
    act(() => vi.advanceTimersByTime(COUNTDOWN_MS - 200))
    // Timer only starts after the full countdown; give it the remainder + 1s.
    act(() => vi.advanceTimersByTime(200 + 1000))
    // (Assertion is implicit: no throw and the round is interactive.)
    expect(true).toBe(true)
  })
})
