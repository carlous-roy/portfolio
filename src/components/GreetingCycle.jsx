import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GREETINGS } from '../content/site'
import { useReducedMotion } from '../hooks/useReducedMotion'

const STATIC = GREETINGS.find((g) => g.lang === 'en') || GREETINGS[0]

// Cycles a greeting through nine languages, animating the width so the
// sentence reflows smoothly. With reduced motion it shows a single greeting.
export default function GreetingCycle() {
  const reduced = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('idle')
  const measureRef = useRef(null)
  const wrapRef = useRef(null)
  const current = reduced ? STATIC : GREETINGS[idx]

  // Size the visible box to the hidden measurement copy of the current text.
  useLayoutEffect(() => {
    if (measureRef.current && wrapRef.current) {
      wrapRef.current.style.width = `${measureRef.current.offsetWidth + 2}px`
    }
  }, [current.text])

  useEffect(() => {
    if (reduced) return undefined
    const timers = []
    const later = (fn, ms) => timers.push(setTimeout(fn, ms))
    later(() => {
      setPhase('exit')
      later(() => {
        setIdx((i) => (i + 1) % GREETINGS.length)
        setPhase('enter')
        later(() => setPhase('idle'), 400)
      }, 300)
    }, GREETINGS[idx].duration)
    return () => timers.forEach(clearTimeout)
  }, [idx, reduced])

  return (
    <>
      <span
        ref={measureRef}
        className="absolute invisible whitespace-nowrap font-extrabold"
        style={{ fontSize: 'inherit' }}
        aria-hidden="true"
      >
        {current.text}
      </span>
      <span
        ref={wrapRef}
        className="inline-block overflow-hidden align-bottom"
        style={{ transition: reduced ? 'none' : 'width 0.4s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <span
          lang={current.lang}
          className={`inline-block gradient-text font-extrabold whitespace-nowrap greet-${reduced ? 'idle' : phase}`}
        >
          {current.text}
        </span>
      </span>
    </>
  )
}
