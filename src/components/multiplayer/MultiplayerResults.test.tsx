// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { generateBoard } from '../../core/board/generate'
import { computeMultiplayerScores } from '../../core/round/multiplayerScoring'
import { MultiplayerResults } from './MultiplayerResults'

afterEach(cleanup)

const scoreFor = () => 5
const board = generateBoard(4, 'mpr-test')

// alice: 'cat' shared, 'apple' unique(2x). bob: 'cat' shared, 'dog' unique(2x).
const scores = computeMultiplayerScores(
  [
    { uid: 'alice', name: 'Alice', words: ['cat', 'apple'] },
    { uid: 'bob', name: 'Bob', words: ['cat', 'dog'] },
  ],
  scoreFor,
)

describe('MultiplayerResults — browse other players', () => {
  it('shows a tappable leaderboard and opens a player detail view, then back', () => {
    const { container } = render(
      <MultiplayerResults
        board={board}
        scores={scores}
        myUid="alice"
        isHost={false}
        onPlayAgain={() => {}}
        onLeave={() => {}}
      />,
    )

    // Leaderboard rows are buttons (tappable).
    const rows = [...container.querySelectorAll('.leaderboard.tappable li button')]
    expect(rows.length).toBe(2)

    // Tap Bob's row → his detail view with his words, longest-first.
    const bobRow = rows.find((b) => /Bob/.test(b.textContent || ''))!
    act(() => fireEvent.click(bobRow))
    expect(container.querySelector('.mp-detail')).not.toBeNull()
    const detailWords = [...container.querySelectorAll('.mp-detail .wr-word')].map((e) =>
      e.textContent!.replace('2×', '').trim(),
    )
    expect(detailWords).toEqual(['CAT', 'DOG']) // both length 3, alpha order
    // Bob's 'dog' was unique → 2× marker present.
    expect(container.querySelector('.mp-detail .bonus-tag')).not.toBeNull()

    // Back returns to the leaderboard.
    act(() => fireEvent.click(container.querySelector('.mp-detail .back')!))
    expect(container.querySelector('.mp-detail')).toBeNull()
    expect(container.querySelector('.leaderboard')).not.toBeNull()
  })

  it('shows my own 2× bonus words in my list', () => {
    const { container } = render(
      <MultiplayerResults
        board={board}
        scores={scores}
        myUid="alice"
        isHost={false}
        onPlayAgain={() => {}}
        onLeave={() => {}}
      />,
    )
    // Alice's 'apple' is unique → shows a 2× marker in her own list.
    const myList = container.querySelector('.results-found')
    expect(myList?.querySelector('.bonus-tag')).not.toBeNull()
  })
})
