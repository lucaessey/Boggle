import type { FoundWord } from './useGamePlay'

interface ResultsProps {
  heading: string
  score: number
  found: FoundWord[]
  totalWords: number
  onPlayAgain: () => void
  onChangeSettings: () => void
}

/** End-of-round results, shared by timed and Peaceful modes. */
export function Results({
  heading,
  score,
  found,
  totalWords,
  onPlayAgain,
  onChangeSettings,
}: ResultsProps) {
  return (
    <section className="results">
      <h2>{heading}</h2>
      <p className="final-score">Final score: {score}</p>
      <p className="coverage">
        You found {found.length} of {totalWords} words on the board.
      </p>
      {found.length > 0 && (
        <ul className="results-words">
          {found.map((f) => (
            <li key={f.word}>
              <span>{f.word}</span>
              <span className="pts">{f.points}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="results-actions">
        <button type="button" className="primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button type="button" className="secondary" onClick={onChangeSettings}>
          Change Settings
        </button>
      </div>
    </section>
  )
}
