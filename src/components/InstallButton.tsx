import { useId, useState } from 'react'
import type { usePwaInstall } from './usePwaInstall'
import './InstallButton.css'

export function InstallButton({ installation }: { installation: ReturnType<typeof usePwaInstall> }) {
  const [showInstructions, setShowInstructions] = useState(false)
  const instructionsId = useId()
  if (installation.installed) return null

  return (
    <div className="pwa-install">
      <button
        type="button"
        className="pwa-install-button"
        disabled={installation.busy}
        aria-expanded={installation.canPrompt ? undefined : showInstructions}
        aria-controls={installation.canPrompt ? undefined : instructionsId}
        onClick={() => {
          if (installation.canPrompt) void installation.install()
          else setShowInstructions((shown) => !shown)
        }}
      >
        Install Boggle
      </button>
      {showInstructions && (
        <p id={instructionsId}>
          On iPhone or iPad, open Safari’s Share menu and choose Add to Home Screen.
          On other devices, look for Install app or Add to Home Screen in your browser menu.
        </p>
      )}
      {installation.error && <p role="alert">{installation.error}</p>}
    </div>
  )
}
