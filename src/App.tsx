import { useState } from 'react'
import { generateBoard } from './core/board/board'
import { BoardView } from './components/BoardView'
import './App.css'

function App() {
  // Generate one board on first render. A fixed seed keeps it stable across
  // reloads and StrictMode's double-invoke; interaction and re-rolling come in
  // later changes.
  const [board] = useState(() => generateBoard('demo'))

  return (
    <main className="app">
      <h1>Boggle</h1>
      <BoardView board={board} />
      <p className="seed">seed: {String(board.seed)}</p>
    </main>
  )
}

export default App
