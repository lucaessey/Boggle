import { useEffect, useRef } from 'react'

const COLORS = ['#4f8cff', '#35c46a', '#e0a83a', '#ff5a5a', '#c084fc', '#ffffff']

interface Particle {
  x: number
  y: number
  vy: number
  vx: number
  size: number
  color: string
  rot: number
  vrot: number
}

/**
 * Lightweight falling-confetti animation on a canvas — no runtime dependency.
 * Honours prefers-reduced-motion by rendering nothing (the caller still shows
 * the win message).
 */
export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: Particle[] = []

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: Math.random() * -h,
      vy: 1.5 + Math.random() * 3,
      vx: -1 + Math.random() * 2,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vrot: -0.1 + Math.random() * 0.2,
    }))

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.y += p.vy
        p.x += p.vx
        p.rot += p.vrot
        if (p.y > h + 10) p.y = -10 // recycle so it falls "for the duration"
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
}
