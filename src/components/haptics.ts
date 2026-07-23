/**
 * Haptic feedback via the Vibration API, guarded for browsers that lack it and
 * toggleable through the `haptics` config in balance.json.
 */
import balance from '../balance.json'

const cfg = balance.haptics

function vibrate(ms: number): void {
  if (!cfg.enabled) return
  if (typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(ms)
  } catch {
    // ignore: vibration is best-effort
  }
}

/** Short tick when a tile is added to the path. */
export function hapticSelect(): void {
  vibrate(cfg.selectMs)
}

/** Slightly longer buzz when a word is accepted. */
export function hapticAccept(): void {
  vibrate(cfg.acceptMs)
}
