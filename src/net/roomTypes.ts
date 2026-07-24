/**
 * Room data-model types and pure join rules (no Firebase).
 * Mirrors /rooms/{CODE} in the Realtime Database.
 */
import type { GameModeId } from '../core/round/modes'

export const MAX_PLAYERS = 10

export type RoomStatus = 'lobby' | 'countdown' | 'playing' | 'results'

export interface RoomSettings {
  size: number
  seconds: number
  /** Game mode for the room; absent (older rooms) means Normal. */
  mode?: GameModeId
}

export interface RoomPlayer {
  name: string
  joinedAt: number
  connected: boolean
}

export interface RoomResult {
  words: string[]
  score: number
  submittedAt: number
}

export interface RoomState {
  hostId: string
  createdAt: number
  status: RoomStatus
  settings: RoomSettings
  seed?: string
  startAt?: number
  players?: Record<string, RoomPlayer>
  results?: Record<string, RoomResult>
}

export type JoinResult = 'ok' | 'not-found' | 'full' | 'started'

/** Whether `uid` may join `room`. Pure — used before writing to the room. */
export function joinability(
  room: RoomState | null | undefined,
  uid: string,
  maxPlayers = MAX_PLAYERS,
): JoinResult {
  if (!room) return 'not-found'
  const players = room.players ?? {}
  if (players[uid]) return 'ok' // already a member — allow rejoin
  if (room.status !== 'lobby') return 'started'
  if (Object.keys(players).length >= maxPlayers) return 'full'
  return 'ok'
}

/** Connected players (used for the live list and results grace period). */
export function connectedPlayerIds(room: RoomState | null | undefined): string[] {
  const players = room?.players ?? {}
  return Object.keys(players).filter((uid) => players[uid].connected)
}
