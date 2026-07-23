import { useEffect, useRef, useState } from 'react'
import balance from '../balance.json'

const COUNTDOWN_SECONDS = balance.countdownSeconds
const GO_MS = 550 // how long "GO!" flashes before play begins

/**
 * 3-2-1-GO! countdown shown over the (hidden) board. Calls `onDone` once the
 * "GO!" flash finishes; that is when the round timer should start.
 */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState(COUNTDOWN_SECONDS)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    let v = COUNTDOWN_SECONDS
    setValue(v)
    let goTimer: ReturnType<typeof setTimeout> | undefined
    const id = setInterval(() => {
      v -= 1
      setValue(v)
      if (v <= 0) {
        clearInterval(id)
        goTimer = setTimeout(() => onDoneRef.current(), GO_MS)
      }
    }, 1000)
    return () => {
      clearInterval(id)
      if (goTimer) clearTimeout(goTimer)
    }
  }, [])

  return (
    <div className="countdown" role="status" aria-label={value > 0 ? `Starting in ${value}` : 'Go'}>
      {value > 0 ? value : 'GO!'}
    </div>
  )
}
