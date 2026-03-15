import { useState, useEffect, useRef } from 'react'

/*
  Uses the actual rC logo PNG (/rc-logo-white.png) as a CSS mask.
  The gradient is applied via background, and mask-image reveals only the logo shape.
  This ensures pixel-perfect matching of the original design.
*/

/* ═══ Logo component using PNG mask ═══ */
export function RCLogo({ size = 48, className = '', showGradient = true, style = {} }) {
  const h = size * 0.895 // aspect ratio from 591x529
  return (
    <div className={className} style={{
      width: size, height: h, display: 'inline-block',
      background: showGradient
        ? 'linear-gradient(135deg, #DC2626 0%, #EA580C 30%, #F59E0B 65%, #1D4ED8 100%)'
        : 'currentColor',
      WebkitMaskImage: 'url(/rc-logo-white.png)',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskImage: 'url(/rc-logo-white.png)',
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      ...style,
    }} />
  )
}

export function RCLogoCompact({ size = 28 }) {
  const h = size * 0.895
  return (
    <div style={{
      width: size, height: h, display: 'inline-block',
      background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 40%, #F59E0B 100%)',
      WebkitMaskImage: 'url(/rc-logo-white.png)',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskImage: 'url(/rc-logo-white.png)',
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    }} />
  )
}

/* ═══ Particles ═══ */
function Particles({ active }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c || !active) return
    const ctx = c.getContext('2d')
    c.width = window.innerWidth; c.height = window.innerHeight
    const W = c.width, H = c.height
    const ps = Array.from({ length: 80 }, () => ({
      x: W/2 + (Math.random()-0.5)*500, y: H/2 + (Math.random()-0.5)*500,
      vx: (Math.random()-0.5)*1.2, vy: (Math.random()-0.5)*1.2,
      r: Math.random()*2+0.3, life: 1,
      c: ['#DC2626','#EA580C','#F59E0B','#1D4ED8','#fff'][Math.floor(Math.random()*5)]
    }))
    let af
    const loop = () => {
      ctx.clearRect(0,0,W,H)
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life *= 0.997
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle = p.c; ctx.globalAlpha = p.life * 0.35; ctx.fill()
      })
      ctx.globalAlpha = 1; af = requestAnimationFrame(loop)
    }
    loop(); return () => cancelAnimationFrame(af)
  }, [active])
  return <canvas ref={ref} className="absolute inset-0" style={{ opacity: active ? 0.8 : 0 }} />
}

/* ═══ INTRO ANIMATION ═══ */
export default function IntroAnimation({ onComplete }) {
  // Phases: dark → outline → fill → glitch → text → hold → exit
  const [phase, setPhase] = useState('dark')

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase('outline'), 200),
      setTimeout(() => setPhase('fill'), 1200),
      setTimeout(() => setPhase('glitch'), 1800),
      setTimeout(() => setPhase('text'), 2100),
      setTimeout(() => setPhase('hold'), 2800),
      setTimeout(() => setPhase('exit'), 3400),
      setTimeout(() => { setPhase('done'); onComplete() }, 4200),
    ]
    return () => t.forEach(clearTimeout)
  }, [onComplete])

  if (phase === 'done') return null

  const ex = phase === 'exit'
  const isMob = typeof window !== 'undefined' && window.innerWidth < 640
  const sz = isMob ? 130 : 240
  const logoH = sz * 0.895
  const afterFill = ['fill','glitch','text','hold','exit'].includes(phase)
  const showText = ['text','hold','exit'].includes(phase)
  const isGlitch = phase === 'glitch'
  const isOutline = phase === 'outline'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none" style={{
      background: '#030303',
      opacity: ex ? 0 : 1,
      transform: ex ? 'scale(1.15)' : 'scale(1)',
      transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <Particles active={phase !== 'done' && phase !== 'dark'} />

      {/* Ambient glows */}
      <div className="absolute" style={{ width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'introPulse 3s ease infinite' }} />
      <div className="absolute" style={{ width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.06) 0%, transparent 70%)', filter: 'blur(50px)', transform: 'translate(100px,-50px)', animation: 'introPulse 3s ease 1.5s infinite' }} />

      {/* Main content — tight flex layout */}
      <div className="flex items-end relative z-10" style={{ gap: isMob ? '3px' : '6px' }}>

        {/* Logo container */}
        <div className="relative" style={{
          width: sz, height: logoH,
          filter: isGlitch ? 'hue-rotate(15deg) brightness(1.4)' : 'none',
          transform: isGlitch ? 'translateX(2px) skewX(-1.5deg)' : 'none',
          transition: isGlitch ? 'none' : 'filter 0.3s, transform 0.3s',
        }}>

          {/* Phase: Outline (white silhouette fading in) */}
          <div style={{
            position: 'absolute', inset: 0,
            width: sz, height: logoH,
            background: 'rgba(255,255,255,0.12)',
            WebkitMaskImage: 'url(/rc-logo-white.png)',
            WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            maskImage: 'url(/rc-logo-white.png)',
            maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            opacity: isOutline ? 1 : (afterFill ? 0 : 0),
            transition: 'opacity 0.6s ease',
          }} />

          {/* Faint ghost always visible */}
          <div style={{
            position: 'absolute', inset: 0,
            width: sz, height: logoH,
            background: 'rgba(255,255,255,0.03)',
            WebkitMaskImage: 'url(/rc-logo-white.png)',
            WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            maskImage: 'url(/rc-logo-white.png)',
            maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
          }} />

          {/* Phase: Gradient fill (clip from bottom to top) */}
          <div style={{
            position: 'absolute', inset: 0,
            width: sz, height: logoH,
            background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 30%, #F59E0B 65%, #1D4ED8 100%)',
            WebkitMaskImage: 'url(/rc-logo-white.png)',
            WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            maskImage: 'url(/rc-logo-white.png)',
            maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            clipPath: afterFill ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
            transition: 'clip-path 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />

          {/* Glow behind logo */}
          <div style={{
            position: 'absolute', inset: '-20%',
            width: '140%', height: '140%',
            background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 30%, #F59E0B 65%, #1D4ED8 100%)',
            WebkitMaskImage: 'url(/rc-logo-white.png)',
            WebkitMaskSize: '71%', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            maskImage: 'url(/rc-logo-white.png)',
            maskSize: '71%', maskRepeat: 'no-repeat', maskPosition: 'center',
            filter: 'blur(30px)',
            opacity: afterFill ? 0.25 : 0,
            transition: 'opacity 0.6s ease',
          }} />

          {/* Glitch chromatic layers */}
          {isGlitch && <>
            <div style={{
              position: 'absolute', inset: 0, transform: 'translateX(-4px)',
              width: sz, height: logoH,
              background: '#DC2626', opacity: 0.5, mixBlendMode: 'screen',
              WebkitMaskImage: 'url(/rc-logo-white.png)',
              WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              maskImage: 'url(/rc-logo-white.png)',
              maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            }} />
            <div style={{
              position: 'absolute', inset: 0, transform: 'translateX(4px)',
              width: sz, height: logoH,
              background: '#1D4ED8', opacity: 0.4, mixBlendMode: 'screen',
              WebkitMaskImage: 'url(/rc-logo-white.png)',
              WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              maskImage: 'url(/rc-logo-white.png)',
              maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            }} />
          </>}
        </div>

        {/* /swe text — tight spacing, baseline-aligned */}
        <div style={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          paddingBottom: isMob ? '1px' : '4px',
        }}>
          <span style={{
            fontFamily: "'SF Mono','Fira Code','JetBrains Mono',monospace",
            fontSize: isMob ? '17px' : '32px',
            fontWeight: 300,
            letterSpacing: '0.06em',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>swe</span>
          </span>
        </div>
      </div>

      {/* Horizontal accent line */}
      <div className="absolute z-10" style={{
        bottom: '36%', left: '50%', transform: 'translateX(-50%)',
        width: showText ? (isMob ? '200px' : '380px') : '0',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.3), rgba(245,158,11,0.15), transparent)',
        transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
      }} />

      {/* Scanlines during glitch */}
      {isGlitch && <div className="absolute inset-0 z-20 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
      }} />}
    </div>
  )
}
