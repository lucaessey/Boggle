import { useState } from 'react'
import { AchievementsProvider } from './components/AchievementsContext'
import { AchievementsScreen } from './components/AchievementsScreen'
import type { GameConfig } from './components/gameConfig'
import { Menu } from './components/Menu'
import { PeacefulRound } from './components/PeacefulRound'
import { Round } from './components/Round'
import './App.css'

function App() {
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)

  function content() {
    if (showAchievements) return <AchievementsScreen onBack={() => setShowAchievements(false)} />

    if (config === null) {
      return <Menu onStart={setConfig} onOpenAchievements={() => setShowAchievements(true)} />
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

  return (
    <AchievementsProvider>
      <main className="app">
        <h1>Boggle</h1>
        {content()}
      </main>
    </AchievementsProvider>
  )
}

export default App
