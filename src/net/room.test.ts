import { describe, it, expect } from 'vitest'
import { generateBoard } from '../core/board/generate'
import { allocateRoomCode, generateRoomCode, ROOM_CODE_LENGTH } from './roomCode'
import { joinability, type RoomState } from './roomTypes'

describe('room code generation', () => {
  it('is 5 letters and never contains I, O, or Q', () => {
    // Deterministic sweep of the whole alphabet via a cycling rand source.
    let i = 0
    const rand = () => ((i++ % 23) + 0.001) / 23
    for (let n = 0; n < 200; n++) {
      const code = generateRoomCode(rand)
      expect(code).toHaveLength(ROOM_CODE_LENGTH)
      expect(code).toMatch(/^[A-Z]{5}$/)
      expect(code).not.toMatch(/[IOQ]/)
    }
  })

  it('retries on collision until it finds a free code', async () => {
    const taken = new Set<string>()
    // Force the first two generated codes to be "taken".
    const codes = ['AAAAA', 'BBBBB', 'CCCCC']
    let call = 0
    // rand that produces AAAAA, then BBBBB, then CCCCC (indices 0,1,2 of alphabet).
    const rand = () => {
      const idx = call < 5 ? 0 : call < 10 ? 1 : 2
      call++
      return (idx + 0.001) / 23
    }
    taken.add('AAAAA')
    taken.add('BBBBB')
    const exists = async (c: string) => taken.has(c)
    const code = await allocateRoomCode(exists, rand)
    expect(codes).toContain(code)
    expect(code).toBe('CCCCC') // first two were taken
  })
})

describe('joinability', () => {
  const lobby = (n: number, status: RoomState['status'] = 'lobby'): RoomState => ({
    hostId: 'host',
    createdAt: 0,
    status,
    settings: { size: 4, seconds: 60 },
    players: Object.fromEntries(
      Array.from({ length: n }, (_, i) => [`u${i}`, { name: `p${i}`, joinedAt: i, connected: true }]),
    ),
  })

  it('rejects a missing room', () => {
    expect(joinability(null, 'x')).toBe('not-found')
  })

  it('rejects joins once the room is past lobby', () => {
    expect(joinability(lobby(2, 'countdown'), 'new')).toBe('started')
    expect(joinability(lobby(2, 'playing'), 'new')).toBe('started')
  })

  it('rejects joins beyond 10 players', () => {
    expect(joinability(lobby(10), 'new')).toBe('full')
    expect(joinability(lobby(9), 'new')).toBe('ok')
  })

  it('allows an existing member to rejoin even when full or started', () => {
    expect(joinability(lobby(10), 'u0')).toBe('ok')
    expect(joinability(lobby(3, 'playing'), 'u0')).toBe('ok')
  })
})

describe('seed-only boards are identical across clients', () => {
  it('two separately constructed clients generate the same board from a seed', () => {
    const seed = 'MULTI-SEED-XYZ'
    for (const size of [4, 5, 6, 7]) {
      // Each "client" calls generateBoard independently with only the seed.
      const clientA = generateBoard(size, seed)
      const clientB = generateBoard(size, seed)
      expect(clientA.cells.map((c) => c.face)).toEqual(clientB.cells.map((c) => c.face))
    }
  })
})
