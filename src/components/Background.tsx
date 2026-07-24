import { createContext, useContext, useEffect, useState } from 'react'
import bg1 from '../assets/background_1.jpg'
import bg2 from '../assets/background_2.avif'
import './Background.css'

/** Which background a screen wants: '1' (lobby / round-length select) or '2' (everything else). */
export type BackgroundId = '1' | '2'

const BgCtx = createContext<{ setBackground: (id: BackgroundId) => void } | null>(null)

/**
 * Renders the fixed full-height background image + a tunable scrim behind all
 * content. Both images are preloaded so screen transitions never flash empty.
 * Uses a fixed-position layer (NOT background-attachment: fixed, which janks on
 * iOS Safari).
 */
export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<BackgroundId>('2')

  // Preload both so switching screens doesn't flash.
  useEffect(() => {
    for (const src of [bg1, bg2]) {
      const img = new Image()
      img.src = src
    }
  }, [])

  return (
    <BgCtx.Provider value={{ setBackground: setId }}>
      <div className="screen-bg" style={{ backgroundImage: `url(${id === '1' ? bg1 : bg2})` }} aria-hidden="true" />
      <div className="screen-scrim" aria-hidden="true" />
      {children}
    </BgCtx.Provider>
  )
}

/** Set the background for as long as the calling screen is mounted; resets to '2'. */
export function useScreenBackground(which: BackgroundId): void {
  const ctx = useContext(BgCtx)
  useEffect(() => {
    ctx?.setBackground(which)
    return () => ctx?.setBackground('2')
  }, [ctx, which])
}
