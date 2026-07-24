import { lazy, Suspense, useState } from 'react'
import { AchievementsProvider } from './components/AchievementsContext'
import { AchievementsScreen } from './components/AchievementsScreen'
import type { GameConfig } from './components/gameConfig'
import { HighScoresScreen } from './components/HighScoresScreen'
import { Menu } from './components/Menu'
import { PeacefulRound } from './components/PeacefulRound'
import { Round } from './components/Round'
import './App.css'

// Code-split: Firebase + all multiplayer code load only when a user opens
// Multiplayer — single-player never downloads it.
const MultiplayerApp = lazy(() =>
  import('./components/multiplayer/MultiplayerApp').then((m) => ({ default: m.MultiplayerApp })),
)

function App() {
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [showMultiplayer, setShowMultiplayer] = useState(false)

  function content() {
    if (showAchievements) return <AchievementsScreen onBack={() => setShowAchievements(false)} />
    if (showHighScores) return <HighScoresScreen onBack={() => setShowHighScores(false)} />
    if (showMultiplayer) {
      return (
        <Suspense
          fallback={
            <div className="mp-loading">
              <div className="spinner" aria-hidden="true" />
              <p>Loading multiplayer…</p>
            </div>
          }
        >
          <MultiplayerApp onExit={() => setShowMultiplayer(false)} />
        </Suspense>
      )
    }

    if (config === null) {
      return (
        <Menu
          onStart={setConfig}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenHighScores={() => setShowHighScores(true)}
          onOpenMultiplayer={() => setShowMultiplayer(true)}
        />
      )
    }

    const key =
      config.mode === 'timed'
        ? `t-${config.size}-${config.length}`
        : `p-${config.size}-${config.goalPercentage}`
    const back = () => setConfig(null)

    if (config.mode === 'timed') {
      return (
        <Round key={key} size={config.size} roundSeconds={config.length} onChangeSettings={back} />
      )
    }
    return (
      <PeacefulRound
        key={key}
        size={config.size}
        goalPercentage={config.goalPercentage}
        onChangeSettings={back}
      />
    )
  }

  // The big title only appears on the main menu; other screens reclaim that
  // vertical space (and have their own headings).
  const showTitle = config === null && !showAchievements && !showHighScores && !showMultiplayer

  return (
    <AchievementsProvider>
      <main className={`app${showTitle ? '' : ' compact'}`}>
        {showTitle && <h1>Boggle</h1>}
        {content()}
      </main>
    </AchievementsProvider>
  )
}

export default App
