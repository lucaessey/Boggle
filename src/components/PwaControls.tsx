import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './PwaControls.css'

interface InstallPrompt extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Stays mounted to catch browser events, but offers updates only off the board. */
export function PwaControls({ visible }: { visible: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reloadPending, setReloadPending] = useState(false)
  const menuVisible = useRef(visible)
  useEffect(() => { menuVisible.current = visible }, [visible])
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedReload() {
      // Another window can accept an update while this one is playing.
      // Defer its reload too, so the current round stays intact.
      if (menuVisible.current) window.location.reload()
      else setReloadPending(true)
    },
    onRegisterError(error) {
      console.warn('Offline support could not be registered.', error)
    },
  })

  useEffect(() => {
    const captureInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPrompt)
    }
    const installed = () => setInstallPrompt(null)
    const connectionChanged = () => setOnline(navigator.onLine)
    window.addEventListener('beforeinstallprompt', captureInstall)
    window.addEventListener('appinstalled', installed)
    window.addEventListener('online', connectionChanged)
    window.addEventListener('offline', connectionChanged)
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstall)
      window.removeEventListener('appinstalled', installed)
      window.removeEventListener('online', connectionChanged)
      window.removeEventListener('offline', connectionChanged)
    }
  }, [])

  async function install() {
    if (!installPrompt) return
    setBusy(true)
    setError('')
    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
    } catch {
      setError('Use your browser menu to install Boggle.')
    } finally {
      // A beforeinstallprompt event can only be used once, even if dismissed.
      setInstallPrompt(null)
      setBusy(false)
    }
  }

  async function update() {
    setBusy(true)
    setError('')
    try {
      if (reloadPending) window.location.reload()
      else await updateServiceWorker(true)
    } catch {
      setError('Could not update. Please try again when connected.')
    } finally {
      setBusy(false)
    }
  }

  if (!visible) return null

  return (
    <aside className="pwa-controls" aria-label="App installation and offline status">
      {!online && (
        <p role="status">You’re offline. Solo play is available; multiplayer and global scores need internet.</p>
      )}
      {needRefresh || reloadPending ? (
        <div className="pwa-notice">
          <p role="status">A new version of Boggle is ready.</p>
          <div className="pwa-actions">
            <button type="button" onClick={() => void update()} disabled={busy}>Update &amp; reload</button>
            <button type="button" onClick={() => { setNeedRefresh(false); setReloadPending(false) }} disabled={busy}>Later</button>
          </div>
        </div>
      ) : offlineReady ? (
        <div className="pwa-notice">
          <p role="status">Boggle is ready for offline play.</p>
          <button type="button" onClick={() => setOfflineReady(false)}>Got it</button>
        </div>
      ) : null}
      {installPrompt && (
        <button type="button" onClick={() => void install()} disabled={busy}>Install Boggle</button>
      )}
      {error && <p role="alert">{error}</p>}
    </aside>
  )
}
