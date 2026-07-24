import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import balance from '../balance.json'
import { neighbours } from '../core/board/board'
import type { Board } from '../core/board/types'
import { hasPath } from '../core/dictionary/solver'
import { extendPathThroughSegment, hitTest, pathWord, type Point } from '../core/path/path'
import { hapticSelect } from './haptics'
import './BoardTrace.css'

function hitRadiusFor(size: number): number {
  return (balance.sizes as Record<string, { tileHitRadiusPx: number }>)[String(size)]
    .tileHitRadiusPx
}

interface Geom {
  clientCenters: Point[] // viewport space, for pointer hit-testing
  tileWidth: number // client px, for the interpolation step
}

interface LineGeom {
  localCenters: Point[]
  width: number
  height: number
}

type Input =
  | { mode: 'idle' }
  | { mode: 'drag'; path: number[] }
  | { mode: 'type'; typed: string; path: number[] | null }

/** A single tile. Memoised so only tiles whose selected/revealed state changes re-render. */
const Tile = memo(function Tile({
  index,
  face,
  selected,
  revealed,
  register,
}: {
  index: number
  face: string
  selected: boolean
  revealed: boolean
  register: (index: number, el: HTMLDivElement | null) => void
}) {
  const setRef = useCallback((el: HTMLDivElement | null) => register(index, el), [index, register])
  return (
    <div
      ref={setRef}
      className={`tile${selected ? ' selected' : ''}${revealed ? '' : ' facedown'}`}
      role="gridcell"
    >
      {revealed ? face : ''}
    </div>
  )
})

interface BoardTraceProps {
  board: Board
  /** Submitted word (uppercased) and the cell path it used (null if typed with no board path). */
  onWord?: (word: string, path: number[] | null) => void
  /** When true, both input methods are live; when false, all input is ignored. */
  active?: boolean
  /** When false, tiles are shown face-down (letters hidden) without relayout. */
  revealed?: boolean
  /** Optional overlay centred over the grid (e.g. the countdown). */
  overlay?: React.ReactNode
}

export function BoardTrace({
  board,
  onWord,
  active = false,
  revealed = true,
  overlay,
}: BoardTraceProps) {
  const [input, setInput] = useState<Input>({ mode: 'idle' })
  const [lineGeom, setLineGeom] = useState<LineGeom | null>(null)

  const gridRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const geomRef = useRef<Geom | null>(null)
  const inputRef = useRef<Input>(input)
  const tracing = useRef(false)
  const onWordRef = useRef(onWord)
  onWordRef.current = onWord

  // Values the native (deps-[]) pointer handlers read, kept fresh via refs.
  const sizeRef = useRef(board.size)
  sizeRef.current = board.size
  const hitRadius = hitRadiusFor(board.size)
  const radiusRef = useRef(hitRadius)
  radiusRef.current = hitRadius

  // Fast-swipe machinery.
  const lastPointRef = useRef<Point>({ x: 0, y: 0 })
  const moveBufferRef = useRef<Point[]>([])
  const rafRef = useRef(0)
  const processRef = useRef<() => void>(() => {})

  const faces = board.cells.map((c) => c.face)

  const apply = useCallback((next: Input) => {
    inputRef.current = next
    setInput(next)
  }, [])

  const register = useCallback((index: number, el: HTMLDivElement | null) => {
    tileRefs.current[index] = el
  }, [])

  function submit(word: string, path: number[] | null) {
    onWordRef.current?.(word, path)
    apply({ mode: 'idle' })
  }

  function measure(): Geom | null {
    const grid = gridRef.current
    if (!grid) return null
    const clientCenters: Point[] = []
    let tileWidth = 0
    for (let i = 0; i < board.cells.length; i++) {
      const el = tileRefs.current[i]
      if (!el) return null
      const r = el.getBoundingClientRect()
      clientCenters.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      tileWidth = r.width
    }
    return { clientCenters, tileWidth }
  }

  // ---- Keyboard input -------------------------------------------------------
  useEffect(() => {
    if (!active) return
    const typeLetter = (ch: string) => {
      tracing.current = false
      const cur = inputRef.current
      const base = cur.mode === 'type' ? cur.typed : ''
      const typed = base + ch.toLowerCase()
      apply({ mode: 'type', typed, path: hasPath(board, typed) })
    }
    const backspace = () => {
      const cur = inputRef.current
      if (cur.mode !== 'type') return
      const typed = cur.typed.slice(0, -1)
      if (typed.length === 0) apply({ mode: 'idle' })
      else apply({ mode: 'type', typed, path: hasPath(board, typed) })
    }
    const submitTyped = () => {
      const cur = inputRef.current
      if (cur.mode === 'type' && cur.typed.length > 0) submit(cur.typed.toUpperCase(), cur.path)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) typeLetter(e.key)
      else if (e.key === 'Backspace') backspace()
      else if (e.key === 'Enter') submitTyped()
      else if (e.key === 'Escape') apply({ mode: 'idle' })
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, board])

  // Reset input whenever the board or active state changes.
  useEffect(() => {
    apply({ mode: 'idle' })
    tracing.current = false
    moveBufferRef.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, active])

  // Grid-relative centres for the connecting line (drag + typed).
  useLayoutEffect(() => {
    function measureLine() {
      const grid = gridRef.current
      if (!grid) return
      const rect = grid.getBoundingClientRect()
      const localCenters: Point[] = []
      for (let i = 0; i < board.cells.length; i++) {
        const el = tileRefs.current[i]
        if (!el) return
        const r = el.getBoundingClientRect()
        localCenters.push({ x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top })
      }
      setLineGeom({ localCenters, width: rect.width, height: rect.height })
    }
    measureLine()
    window.addEventListener('resize', measureLine)
    return () => window.removeEventListener('resize', measureLine)
  }, [board, revealed])

  // ---- Native pointermove: coalesced samples → interpolate → rAF batch ------
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const process = () => {
      rafRef.current = 0
      const geom = geomRef.current
      const cur = inputRef.current
      const buf = moveBufferRef.current
      moveBufferRef.current = []
      if (!geom || cur.mode !== 'drag' || buf.length === 0) return
      const nb = (i: number) => neighbours(i, sizeRef.current)
      const step = geom.tileWidth / 2
      let path = cur.path as number[]
      let grew = false
      for (const p of buf) {
        const before = path.length
        path = extendPathThroughSegment(
          path,
          lastPointRef.current,
          p,
          geom.clientCenters,
          radiusRef.current,
          step,
          nb,
        ) as number[]
        if (path.length > before) grew = true
        lastPointRef.current = p
      }
      if (path !== cur.path) {
        if (grew) hapticSelect()
        apply({ mode: 'drag', path })
      }
    }
    processRef.current = process

    const onMove = (e: PointerEvent) => {
      if (!tracing.current) return
      e.preventDefault() // needs passive:false
      const samples = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
      const buf = moveBufferRef.current
      for (const ev of samples.length ? samples : [e]) {
        buf.push({ x: ev.clientX, y: ev.clientY })
      }
      if (!rafRef.current) rafRef.current = requestAnimationFrame(process)
    }

    grid.addEventListener('pointermove', onMove, { passive: false })
    return () => grid.removeEventListener('pointermove', onMove)
  }, [apply])

  // ---- Drag start / end (discrete; React handlers) --------------------------
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!active) return
    const geom = measure()
    if (!geom) return
    geomRef.current = geom
    const hit = hitTest({ x: e.clientX, y: e.clientY }, geom.clientCenters, hitRadius)
    if (hit === null) return
    tracing.current = true
    lastPointRef.current = { x: e.clientX, y: e.clientY }
    moveBufferRef.current = []
    apply({ mode: 'drag', path: [hit] })
    hapticSelect()
    try {
      gridRef.current?.setPointerCapture(e.pointerId)
    } catch {
      // capture may be rejected for non-active pointers
    }
  }

  function releaseCapture(pointerId: number) {
    try {
      gridRef.current?.releasePointerCapture(pointerId)
    } catch {
      // ignore
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracing.current) return
    tracing.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    processRef.current() // flush any buffered coalesced samples
    releaseCapture(e.pointerId)
    const cur = inputRef.current
    if (cur.mode === 'drag' && cur.path.length > 0) {
      submit(pathWord(faces, cur.path).toUpperCase(), cur.path)
    } else apply({ mode: 'idle' })
  }

  // A cancelled pointer clears the path WITHOUT submitting.
  function onPointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracing.current) return
    tracing.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    moveBufferRef.current = []
    releaseCapture(e.pointerId)
    apply({ mode: 'idle' })
  }

  // ---- Derived view state ---------------------------------------------------
  const highlightPath =
    input.mode === 'drag' ? input.path : input.mode === 'type' ? input.path ?? [] : []
  const currentWord =
    input.mode === 'drag'
      ? pathWord(faces, input.path).toUpperCase()
      : input.mode === 'type'
        ? input.typed.toUpperCase()
        : ''
  const noPath = input.mode === 'type' && input.typed.length > 0 && input.path === null
  const selectedSet = new Set(highlightPath)

  const linePoints =
    lineGeom && revealed && highlightPath.length > 0
      ? highlightPath.map((i) => `${lineGeom.localCenters[i].x},${lineGeom.localCenters[i].y}`).join(' ')
      : ''

  return (
    <div className="board-trace">
      <p className={`current-word${noPath ? ' no-path' : ''}`}>{revealed ? currentWord || ' ' : ' '}</p>

      <div
        ref={gridRef}
        className={`grid${active ? '' : ' disabled'}`}
        data-size={board.size}
        style={
          {
            gridTemplateColumns: `repeat(${board.size}, 1fr)`,
            '--cols': board.size,
          } as React.CSSProperties
        }
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        role="grid"
        aria-label={`${board.size} by ${board.size} letter board`}
      >
        {board.cells.map((cell) => (
          <Tile
            key={cell.index}
            index={cell.index}
            face={cell.face}
            selected={selectedSet.has(cell.index)}
            revealed={revealed}
            register={register}
          />
        ))}

        {lineGeom && revealed && highlightPath.length > 1 && (
          <svg
            className="path-overlay"
            viewBox={`0 0 ${lineGeom.width} ${lineGeom.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points={linePoints} />
          </svg>
        )}

        {overlay && <div className="board-overlay">{overlay}</div>}
      </div>

      {revealed && <p className="input-hint">Type or drag to enter words · Enter to submit</p>}
    </div>
  )
}
