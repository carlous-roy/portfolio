import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useReducedMotion } from '../hooks/useReducedMotion'

const COUNT = 50
const IDLE_MS = 45000

// Drifting dots behind the page. The loop runs only while the tab is visible
// and the visitor has interacted within the last 45 s, and not at all under
// reduced motion. The canvas is sized for the device pixel ratio (capped at 2).
export default function BackgroundParticles({ dark }) {
  const canvasRef = useRef(null)
  const darkRef = useRef(dark)
  const reduced = useReducedMotion()
  useEffect(() => {
    darkRef.current = dark
  }, [dark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return undefined
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let frame = 0
    let running = false
    let idleTimer = 0
    let idle = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      baseAlpha: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const isDark = darkRef.current
      const t = Date.now() * 0.001
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
        const alpha =
          p.baseAlpha * (0.5 + 0.5 * Math.sin(t * 0.8 + p.phase)) * (isDark ? 0.5 : 0.25)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`
        ctx.fill()
      }
      frame = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running || document.hidden || idle) return
      running = true
      frame = requestAnimationFrame(draw)
    }
    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(frame)
    }
    const armIdle = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        idle = true
        stop()
      }, IDLE_MS)
    }
    const onActivity = () => {
      idle = false
      armIdle()
      start()
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    const activityEvents = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', resize)
    armIdle()
    start()

    return () => {
      stop()
      clearTimeout(idleTimer)
      activityEvents.forEach((ev) => window.removeEventListener(ev, onActivity))
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
  )
}

BackgroundParticles.propTypes = { dark: PropTypes.bool.isRequired }
