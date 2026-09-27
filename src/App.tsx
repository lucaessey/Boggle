import { lazy, Suspense, useState } from 'react'
import { AchievementsProvider } from './components/AchievementsContext'
import { BackgroundProvider } from './components/Background'
import { AchievementsScreen } from './components/AchievementsScreen'
import type { GameConfig } from './components/gameConfig'
import { HighScoresScreen } from './components/HighScoresScreen'
import { InstallButton } from './components/InstallButton'
import { Menu } from './components/Menu'
import { PeacefulRound } from './components/PeacefulRound'
import { PwaControls } from './components/PwaControls'
import { Round } from './components/Round'
import { usePwaInstall } from './components/usePwaInstall'
import './App.css'

// Code-split: multiplayer and Firebase initialize only when Multiplayer opens.
// The PWA also precaches these chunks for consistent offline navigation.
const MultiplayerApp = lazy(() =>
  import('./components/multiplayer/MultiplayerApp').then((m) => ({ default: m.MultiplayerApp })),
)

function App() {
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [showMultiplayer, setShowMultiplayer] = useState(false)
  const installation = usePwaInstall()

  function content() {
    if (showAchievements) {
      return (
        <AchievementsScreen
          onBack={() => setShowAchievements(false)}
          installControl={<InstallButton installation={installation} />}
        />
      )
    }
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
        ? `t-${config.size}-${config.length}-${config.gameMode}`
        : `p-${config.size}-${config.goalPercentage}-${config.gameMode}`
    const back = () => setConfig(null)

    if (config.mode === 'timed') {
      return (
        <Round
          key={key}
          size={config.size}
          roundSeconds={config.length}
          gameMode={config.gameMode}
          onChangeSettings={back}
        />
      )
    }
    return (
      <PeacefulRound
        key={key}
        size={config.size}
        goalPercentage={config.goalPercentage}
        gameMode={config.gameMode}
        onChangeSettings={back}
      />
    )
  }

  // The big title only appears on the main menu; other screens reclaim that
  // vertical space (and have their own headings).
  const showTitle = config === null && !showAchievements && !showHighScores && !showMultiplayer

  return (
    <BackgroundProvider>
      <AchievementsProvider>
        <main className={`app${showTitle ? '' : ' compact'}`}>
          {showTitle && <h1>Boggle</h1>}
          {content()}
          <PwaControls
            visible={showTitle}
            installControl={installation.canPrompt ? <InstallButton installation={installation} /> : null}
          />
        </main>
      </AchievementsProvider>
    </BackgroundProvider>
  )
}

export default App
