import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Fades content in when it enters the viewport and resets when it leaves.
// With reduced motion the content is simply visible.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.1,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  const shown = reduced || visible
  return (
    <div
      ref={ref}
      className={className}
      style={
        reduced
          ? undefined
          : {
              opacity: shown ? 1 : 0,
              transform: shown ? 'translateY(0)' : 'translateY(32px)',
              transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
            }
      }
    >
      {children}
    </div>
  )
}

Reveal.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number,
  className: PropTypes.string,
}
