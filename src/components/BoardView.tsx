import type { Board } from '../core/board/types'
import './BoardView.css'

/**
 * Static, non-interactive view of a generated board. A thin adapter over the
 * pure board model: it only reads `board.size` and `board.cells`. Interaction
 * (path input) comes in a later change.
 */
export function BoardView({ board }: { board: Board }) {
  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)` }}
      role="grid"
      aria-label={`${board.size} by ${board.size} letter board`}
    >
      {board.cells.map((cell) => (
        <div key={cell.index} className="tile" role="gridcell">
          {cell.face}
        </div>
      ))}
    </div>
  )
}
