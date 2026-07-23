/**
 * Dev demo: solve 10 boards and print a summary for each.
 * Run with: npm run solve:demo
 */
import balance from '../src/balance.json'
import { generateBoard } from '../src/core/board/board'
import { solveBoard } from '../src/core/dictionary/solver'

const SIZE = balance.gridSize
const BOARD_COUNT = 10

function gridString(faces: string[]): string {
  const rows: string[] = []
  for (let r = 0; r < SIZE; r++) {
    const row = faces.slice(r * SIZE, r * SIZE + SIZE).map((f) => f.padEnd(2))
    rows.push('  ' + row.join(' '))
  }
  return rows.join('\n')
}

for (let seed = 1; seed <= BOARD_COUNT; seed++) {
  const board = generateBoard(seed)
  const faces = board.cells.map((c) => c.face)
  const words = [...solveBoard(board).keys()]

  const longest5 = [...words]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, 5)
  const threeLetterCount = words.filter((w) => w.length === 3).length

  console.log(`\n=== Board ${seed} (seed=${seed}) ===`)
  console.log(gridString(faces))
  console.log(`  total words:      ${words.length}`)
  console.log(`  longest 5:        ${longest5.join(', ')}`)
  console.log(`  3-letter words:   ${threeLetterCount}`)
}
