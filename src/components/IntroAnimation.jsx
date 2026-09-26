import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { LOGO_MASK } from '../icons'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

// A timed sequence of named phases over a canvas particle backdrop. It plays
// once per browser session, never under reduced motion, and can be skipped
// with the button or Escape at any point.

export const INTRO_KEY = 'rc-intro-played'

export function shouldPlayIntro() {
  if (prefersReducedMotion()) return false
  try {
    return sessionStorage.getItem(INTRO_KEY) !== '1'
  } catch {
    return true
  }
}

export function markIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    // Session storage may be unavailable; the intro then plays on each load.
  }
}

// (phase, time in ms from mount)
const SCHEDULE = [
  ['outline', 200],
  ['fill', 1200],
  ['glitch', 1800],
  ['text', 2100],
  ['hold', 2800],
  ['exit', 3400],
  ['done', 4200],
]

const GRADIENT = 'linear-gradient(135deg, #DC2626 0%, #EA580C 30%, #F59E0B 65%, #1D4ED8 100%)'

function Particles({ active }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c || !active) return undefined
    const ctx = c.getContext('2d')
    c.width = window.innerWidth
    c.height = window.innerHeight
    const W = c.width
    const H = c.height
    const colors = ['#DC2626', '#EA580C', '#F59E0B', '#1D4ED8', '#fff']
    const ps = Array.from({ length: 80 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 500,
      y: H / 2 + (Math.random() - 0.5) * 500,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 2 + 0.3,
      life: 1,
      c: colors[Math.floor(Math.random() * colors.length)],
    }))
    let frame = 0
    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of ps) {
        p.x += p.vx
        p.y += p.vy
        p.life *= 0.997
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c
        ctx.globalAlpha = p.life * 0.35
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(frame)
  }, [active])
  return (
    <canvas
      ref={ref}
      className="absolute inset-0"
      style={{ opacity: active ? 0.8 : 0 }}
      aria-hidden="true"
    />
  )
}
Particles.propTypes = { active: PropTypes.bool.isRequired }

function Layer({ style }) {
  return <div style={{ position: 'absolute', inset: 0, ...LOGO_MASK, ...style }} />
}
Layer.propTypes = { style: PropTypes.object }

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState('dark')
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const skipRef = useRef(null)
  const finishRef = useRef(() => {})
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      markIntroPlayed()
      setPhase('done')
      onCompleteRef.current()
    }
    const timers = SCHEDULE.map(([next, at]) =>
      setTimeout(() => (next === 'done' ? finish() : setPhase(next)), at)
    )
    finishRef.current = finish
    const onKey = (e) => e.key === 'Escape' && finish()
    window.addEventListener('keydown', onKey)
    skipRef.current?.focus()
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  if (phase === 'done') return null

  const exiting = phase === 'exit'
  const isMobile = window.innerWidth < 640
  const size = isMobile ? 130 : 240
  const logoHeight = size * 0.895
  const afterFill = ['fill', 'glitch', 'text', 'hold', 'exit'].includes(phase)
  const showText = ['text', 'hold', 'exit'].includes(phase)
  const isGlitch = phase === 'glitch'
  const isOutline = phase === 'outline'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: '#030303',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.15)' : 'scale(1)',
        transition:
          'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <Particles active={phase !== 'dark'} />

      <button
        ref={skipRef}
        type="button"
        className="intro-skip"
        onClick={() => finishRef.current()}
      >
        Skip intro
      </button>

      {/* Ambient glows */}
      <div
        className="absolute"
        aria-hidden="true"
        style={{
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
          animation: 'introPulse 3s ease infinite',
        }}
      />
      <div
        className="absolute"
        aria-hidden="true"
        style={{
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,78,216,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
          transform: 'translate(100px,-50px)',
          animation: 'introPulse 3s ease 1.5s infinite',
        }}
      />

      <div className="flex items-end relative z-10" style={{ gap: isMobile ? '3px' : '6px' }}>
        <div
          className="relative"
          style={{
            width: size,
            height: logoHeight,
            filter: isGlitch ? 'hue-rotate(15deg) brightness(1.4)' : 'none',
            transform: isGlitch ? 'translateX(2px) skewX(-1.5deg)' : 'none',
            transition: isGlitch ? 'none' : 'filter 0.3s, transform 0.3s',
          }}
        >
          {/* Outline: white silhouette fading in */}
          <Layer
            style={{
              background: 'rgba(255,255,255,0.12)',
              opacity: isOutline ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
          {/* Faint ghost always visible */}
          <Layer style={{ background: 'rgba(255,255,255,0.03)' }} />
          {/* Gradient fill, clipped from bottom to top */}
          <Layer
            style={{
              background: GRADIENT,
              clipPath: afterFill ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
              transition: 'clip-path 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          {/* Glow behind the logo */}
          <Layer
            style={{
              inset: '-20%',
              width: '140%',
              height: '140%',
              background: GRADIENT,
              WebkitMaskSize: '71%',
              maskSize: '71%',
              filter: 'blur(30px)',
              opacity: afterFill ? 0.25 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
          {isGlitch && (
            <>
              <Layer
                style={{
                  transform: 'translateX(-4px)',
                  background: '#DC2626',
                  opacity: 0.5,
                  mixBlendMode: 'screen',
                }}
              />
              <Layer
                style={{
                  transform: 'translateX(4px)',
                  background: '#1D4ED8',
                  opacity: 0.4,
                  mixBlendMode: 'screen',
                }}
              />
            </>
          )}
        </div>

        <div
          style={{
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(10px)',
            transition:
              'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
            paddingBottom: isMobile ? '1px' : '4px',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: isMobile ? '17px' : '32px',
              fontWeight: 300,
              letterSpacing: '0.06em',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>swe</span>
          </span>
        </div>
      </div>

      <div
        className="absolute z-10"
        aria-hidden="true"
        style={{
          bottom: '36%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: showText ? (isMobile ? '200px' : '380px') : '0',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(220,38,38,0.3), rgba(245,158,11,0.15), transparent)',
          transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      {isGlitch && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
          }}
        />
      )}
    </div>
  )
}

IntroAnimation.propTypes = { onComplete: PropTypes.func.isRequired }
