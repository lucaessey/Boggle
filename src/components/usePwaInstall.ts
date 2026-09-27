import { useEffect, useState } from 'react'

interface InstallPrompt extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Capture the browser prompt once and share it across the menu and achievements. */
export function usePwaInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const captureInstall = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
      setError('')
    }
    const onInstalled = () => {
      setInstalled(true)
      setPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', captureInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!prompt || busy) return
    setBusy(true)
    setError('')
    try {
      await prompt.prompt()
      if ((await prompt.userChoice).outcome === 'accepted') setInstalled(true)
    } catch {
      setError('Could not open the installer. Use your browser menu to install Boggle.')
    } finally {
      // A browser prompt can only be used once, including after dismissal.
      setPrompt(null)
      setBusy(false)
    }
  }

  return { canPrompt: prompt !== null, installed, busy, error, install }
}
