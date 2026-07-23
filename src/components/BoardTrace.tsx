import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import balance from '../balance.json'
import { neighbours } from '../core/board/board'
import type { Board } from '../core/board/types'
import { hasPath } from '../core/dictionary/solver'
import { extendPath, hitTest, pathWord, type Point } from '../core/path/path'
import { hapticSelect } from './haptics'
import './BoardTrace.css'

/** Hit radius shrinks with the grid; read per-size from balance.json. */
function hitRadiusFor(size: number): number {
  return (balance.sizes as Record<string, { tileHitRadiusPx: number }>)[String(size)]
    .tileHitRadiusPx
}

interface Geom {
  clientCenters: Point[] // viewport space, for pointer hit-testing
  localCenters: Point[] // grid-relative, for the SVG line
  width: number
  height: number
}

/**
 * One current-word state, fed by two coexisting input methods:
 * - drag: a traced path of tiles (mode 'drag')
 * - type: letters typed on a physical keyboard, with the first matching board
 *   path found via hasPath (mode 'type'); path is null when the word isn't on
 *   the board.
 * Switching methods replaces the input — there is never a drag word and a typed
 * word at once.
 */
type Input =
  | { mode: 'idle' }
  | { mode: 'drag'; path: number[] }
  | { mode: 'type'; typed: string; path: number[] | null }

interface BoardTraceProps {
  board: Board
  /** Called with the submitted word (uppercased): drag release or Enter. */
  onWord?: (word: string) => void
  /** When true, both input methods are live; when false, all input is ignored. */
  active?: boolean
}

/** Grid-relative geometry for drawing the connecting line (both input modes). */
interface LineGeom {
  localCenters: Point[]
  width: number
  height: number
}

export function BoardTrace({ board, onWord, active = false }: BoardTraceProps) {
  const [input, setInput] = useState<Input>({ mode: 'idle' })
  const [lineGeom, setLineGeom] = useState<LineGeom | null>(null)

  const gridRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const geomRef = useRef<Geom | null>(null)
  const inputRef = useRef<Input>(input)
  const tracing = useRef(false)
  const onWordRef = useRef(onWord)
  onWordRef.current = onWord

  const faces = board.cells.map((c) => c.face)
  const hitRadius = hitRadiusFor(board.size)

  function apply(next: Input) {
    inputRef.current = next
    setInput(next)
  }

  function submit(word: string) {
    onWordRef.current?.(word)
    apply({ mode: 'idle' })
  }

  // ---- Keyboard input (physical keyboard; no focused <input>) ---------------
  useEffect(() => {
    if (!active) return

    const typeLetter = (ch: string) => {
      tracing.current = false // typing cancels any in-progress drag
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
      if (cur.mode === 'type' && cur.typed.length > 0) submit(cur.typed.toUpperCase())
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return // leave shortcuts alone
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        typeLetter(e.key)
      } else if (e.key === 'Backspace') {
        backspace()
      } else if (e.key === 'Enter') {
        submitTyped()
      } else if (e.key === 'Escape') {
        apply({ mode: 'idle' })
      } else {
        return // ignore all other keys
      }
      e.preventDefault()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, board])

  // Reset the input whenever the board or active state changes.
  useEffect(() => {
    apply({ mode: 'idle' })
    tracing.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, active])

  // Measure grid-relative tile centres for the connecting line, so it draws for
  // typed words too (not only after a drag has measured geometry). Recompute on
  // board change and on resize.
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
  }, [board])

  // ---- Drag input (pointer events; mouse + touch) ---------------------------
  function measure(): Geom | null {
    const grid = gridRef.current
    if (!grid) return null
    const rect = grid.getBoundingClientRect()
    const clientCenters: Point[] = []
    const localCenters: Point[] = []
    for (let i = 0; i < board.cells.length; i++) {
      const el = tileRefs.current[i]
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      clientCenters.push({ x: cx, y: cy })
      localCenters.push({ x: cx - rect.left, y: cy - rect.top })
    }
    return { clientCenters, localCenters, width: rect.width, height: rect.height }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!active) return
    const geom = measure()
    if (!geom) return
    geomRef.current = geom
    const hit = hitTest({ x: e.clientX, y: e.clientY }, geom.clientCenters, hitRadius)
    if (hit === null) return
    tracing.current = true
    apply({ mode: 'drag', path: [hit] }) // starting a drag clears any typed word
    hapticSelect()
    try {
      gridRef.current?.setPointerCapture(e.pointerId)
    } catch {
      // capture may be rejected for non-active pointers; handlers still fire
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracing.current || !geomRef.current) return
    const cur = inputRef.current
    if (cur.mode !== 'drag') return
    const hit = hitTest({ x: e.clientX, y: e.clientY }, geomRef.current.clientCenters, hitRadius)
    if (hit === null) return
    const next = extendPath(cur.path, hit, (i) => neighbours(i, board.size)) as number[]
    if (next !== cur.path) {
      if (next.length > cur.path.length) hapticSelect()
      apply({ mode: 'drag', path: next })
    }
  }

  function releaseCapture(pointerId: number) {
    try {
      gridRef.current?.releasePointerCapture(pointerId)
    } catch {
      // ignore: capture may not have been held
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracing.current) return
    tracing.current = false
    releaseCapture(e.pointerId)
    const cur = inputRef.current
    if (cur.mode === 'drag' && cur.path.length > 0) {
      submit(pathWord(faces, cur.path).toUpperCase())
    } else {
      apply({ mode: 'idle' })
    }
  }

  // A cancelled pointer (incoming call, notification) must clear the path
  // WITHOUT submitting — never leave a trace stuck mid-drag.
  function onPointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracing.current) return
    tracing.current = false
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

  const linePoints =
    lineGeom && highlightPath.length > 0
      ? highlightPath.map((i) => `${lineGeom.localCenters[i].x},${lineGeom.localCenters[i].y}`).join(' ')
      : ''

  return (
    <div className="board-trace">
      <p className={`current-word${noPath ? ' no-path' : ''}`}>{currentWord || ' '}</p>

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
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        role="grid"
        aria-label={`${board.size} by ${board.size} letter board`}
      >
        {board.cells.map((cell) => (
          <div
            key={cell.index}
            ref={(el) => {
              tileRefs.current[cell.index] = el
            }}
            className={`tile${highlightPath.includes(cell.index) ? ' selected' : ''}`}
            role="gridcell"
          >
            {cell.face}
          </div>
        ))}

        {lineGeom && highlightPath.length > 1 && (
          <svg
            className="path-overlay"
            viewBox={`0 0 ${lineGeom.width} ${lineGeom.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points={linePoints} />
          </svg>
        )}
      </div>

      <p className="input-hint">Type or drag to enter words · Enter to submit</p>
    </div>
  )
}
