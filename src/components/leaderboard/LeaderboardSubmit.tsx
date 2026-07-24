import { useEffect, useRef, useState } from 'react'
import { validateName } from '../../core/leaderboard/profanity'
import {
  loadLeaderboardConsent,
  loadNickname,
  saveLeaderboardConsent,
  saveNickname,
} from '../prefs'
import './leaderboard.css'

type Phase = 'prompt' | 'submitting' | 'done' | 'declined' | 'error'

/**
 * Results-screen hook into the global leaderboard. Rendered ONLY by solo timed
 * rounds (peaceful and multiplayer never mount it). First time: shows an opt-in
 * prompt. If the player already opted in, it auto-submits silently; the actual
 * network module (and Firebase) is dynamically imported only when a submit
 * happens, so declining never loads Firebase.
 */
export function LeaderboardSubmit({
  size,
  seconds,
  score,
  words,
}: {
  size: number
  seconds: number
  score: number
  words: number
}) {
  const consent = loadLeaderboardConsent()
  const [phase, setPhase] = useState<Phase>(
    consent === 'no' ? 'declined' : consent === 'yes' ? 'submitting' : 'prompt',
  )
  const [name, setName] = useState(() => loadNickname())
  const [error, setError] = useState('')
  const submitted = useRef(false)

  async function submit(finalName: string) {
    setPhase('submitting')
    try {
      const { submitLeaderboardScore } = await import('../../net/leaderboard')
      await submitLeaderboardScore(size, seconds, finalName, { score, words })
      setPhase('done')
    } catch {
      setPhase('error')
    }
  }

  // Already opted in → submit once, silently, using the stored name.
  useEffect(() => {
    if (consent !== 'yes' || submitted.current) return
    submitted.current = true
    const check = validateName(loadNickname())
    if (check.ok) submit(check.name)
    else setPhase('prompt') // stored name no longer passes validation → re-ask
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSubmit() {
    const check = validateName(name)
    if (!check.ok) {
      setError(check.message)
      return
    }
    saveNickname(check.name)
    saveLeaderboardConsent('yes')
    submitted.current = true
    submit(check.name)
  }

  function onDecline() {
    saveLeaderboardConsent('no')
    setPhase('declined')
  }

  if (phase === 'declined') return null
  if (phase === 'submitting') {
    return (
      <p className="lb-note" role="status">
        Submitting to the global leaderboard…
      </p>
    )
  }
  if (phase === 'done') {
    return (
      <p className="lb-note" role="status">
        ✓ Submitted to the global leaderboard
      </p>
    )
  }
  if (phase === 'error') {
    return (
      <p className="lb-note error" role="status">
        Couldn't reach the global leaderboard — not submitted.
      </p>
    )
  }

  return (
    <div className="lb-consent" role="group" aria-label="Global leaderboard opt-in">
      <p className="lb-consent-title">Post this to the global leaderboard?</p>
      <p className="lb-consent-body">
        Your display name and score will be <strong>publicly visible</strong> to other players.
      </p>
      <input
        className="lb-name-input"
        type="text"
        inputMode="text"
        maxLength={12}
        value={name}
        placeholder="Display name"
        aria-label="Display name (max 12 characters)"
        onChange={(e) => {
          setName(e.target.value)
          setError('')
        }}
      />
      {error && (
        <p className="lb-error" role="alert">
          {error}
        </p>
      )}
      <div className="lb-consent-actions">
        <button type="button" className="primary" onClick={onSubmit}>
          Submit
        </button>
        <button type="button" className="secondary" onClick={onDecline}>
          No thanks
        </button>
      </div>
    </div>
  )
}
