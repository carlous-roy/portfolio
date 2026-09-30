import { useEffect, useRef, useState } from 'react'
import { CONTACT, NAME, PHOTOS } from '../content/site'
import { Github, LinkedIn, Mail } from '../icons'
import { useReducedMotion } from '../hooks/useReducedMotion'

const INTERVAL_MS = 5000

// Profile photo with three contact links around it. The first photo loads
// eagerly with a high fetch priority (it is the largest thing above the fold);
// the other two are lazy and low priority until they are shown. The photo
// cycles every five seconds unless the OS asks for reduced motion; hovering
// on a fine pointer, or activating the photo, advances it by hand.
export default function HeroPhoto() {
  const [idx, setIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const reduced = useReducedMotion()
  const hoverRef = useRef(null)
  const advance = () => setIdx((i) => (i + 1) % PHOTOS.length)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (reduced) return undefined
    const id = setInterval(advance, INTERVAL_MS)
    return () => clearInterval(id)
  }, [reduced])

  useEffect(() => {
    const el = hoverRef.current
    if (!el || window.matchMedia('(pointer:coarse)').matches) return undefined
    el.addEventListener('mouseenter', advance)
    return () => el.removeEventListener('mouseenter', advance)
  }, [])

  const iconSize = isMobile ? 18 : 22
  const socials = [
    {
      href: CONTACT.github,
      label: 'GitHub profile',
      icon: <Github size={iconSize} />,
      external: true,
    },
    {
      href: CONTACT.linkedin,
      label: 'LinkedIn profile',
      icon: <LinkedIn size={iconSize} />,
      external: true,
    },
    {
      href: `mailto:${CONTACT.email}`,
      label: `Email ${CONTACT.email}`,
      icon: <Mail size={iconSize} />,
    },
  ]
  const angles = [214, 238, 262]
  const radius = isMobile ? 62 : 66
  const btnSize = isMobile ? 40 : 48
  const size = isMobile ? '160px' : 'clamp(260px, 26vw, 350px)'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <button
        type="button"
        ref={hoverRef}
        onClick={advance}
        aria-label="Show the next photo"
        className="block rounded-full p-[3px] w-full h-full border-0 cursor-pointer bg-transparent"
        style={{
          background:
            'linear-gradient(135deg, rgba(220,38,38,0.5), rgba(234,88,12,0.3), rgba(245,158,11,0.2), rgba(29,78,216,0.4))',
          boxShadow: '0 0 100px rgba(220,38,38,0.08)',
        }}
      >
        <span className="block w-full h-full rounded-full overflow-hidden relative">
          {PHOTOS.map((photo, i) => {
            const active = idx === i
            return (
              <img
                key={photo.src}
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt={active ? NAME : ''}
                aria-hidden={active ? undefined : 'true'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full rounded-full object-cover"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'scale(1.06)' : 'scale(1.1)',
                  transition: reduced ? 'none' : 'opacity 0.7s ease, transform 0.7s ease',
                }}
              />
            )
          })}
        </span>
      </button>
      {socials.map((item, i) => {
        const r = (angles[i] * Math.PI) / 180
        return (
          <a
            key={item.href}
            href={item.href}
            aria-label={item.label}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className="social-icon absolute rounded-full flex items-center justify-center text-mu hover:text-accent-text transition-[color,transform] hover:scale-110 social-icon-pop"
            style={{
              width: btnSize,
              height: btnSize,
              left: `calc(50% + ${Math.sin(r) * radius}%)`,
              top: `calc(50% + ${-Math.cos(r) * radius}%)`,
              animationDelay: `${0.6 + i * 0.1}s`,
            }}
          >
            {item.icon}
          </a>
        )
      })}
    </div>
  )
}
