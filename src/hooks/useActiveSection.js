import { useEffect, useState } from 'react'

// Tracks which section is under the reading line. The observer's root margin
// shrinks the viewport to a band between 40% and 55% of its height, so the
// active section is the one crossing that band regardless of how tall it is.
// A threshold alone fails for sections taller than the viewport, which can
// never reach a large visible fraction.
export function useActiveSection(ids, enabled) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    if (!enabled) return undefined
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, enabled])

  return active
}
