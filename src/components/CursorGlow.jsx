import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

// A soft radial glow that follows the pointer on devices with a fine pointer.
// Position is written straight to the element, so pointer movement never
// re-renders React.
export default function CursorGlow() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer:coarse)').matches) return undefined
    const onMove = (e) => {
      el.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="cursor-glow fixed pointer-events-none z-[1] top-0 left-0"
      style={{
        width: 500,
        height: 500,
        borderRadius: '50%',
        transform: 'translate(-600px, -600px)',
        transition: reduced ? 'none' : 'transform 0.1s ease-out',
      }}
    />
  )
}
