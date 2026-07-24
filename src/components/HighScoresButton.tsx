import './HighScoresButton.css'

/** High-scores button for the main menu's top-right (mirrors the trophy). */
export function HighScoresButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      className="highscores-button"
      onClick={onOpen}
      aria-label="High scores"
    >
      <span aria-hidden="true">🏅</span>
    </button>
  )
}
