import PropTypes from 'prop-types'

// Inline SVG icons. All are decorative: the control or link that contains one
// carries the accessible name, so each SVG is hidden from assistive tech.

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ size = 18, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}
Svg.propTypes = { size: PropTypes.number, children: PropTypes.node }

const sized = { size: PropTypes.number }

export function Sun({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Svg>
  )
}
Sun.propTypes = sized

export function Moon({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  )
}
Moon.propTypes = sized

export function Github({ size = 24 }) {
  return (
    <Svg size={size} fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </Svg>
  )
}
Github.propTypes = sized

export function LinkedIn({ size = 24 }) {
  return (
    <Svg size={size} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </Svg>
  )
}
LinkedIn.propTypes = sized

export function Mail({ size = 24 }) {
  return (
    <Svg size={size} {...stroke}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Svg>
  )
}
Mail.propTypes = sized

export function Download({ size = 16 }) {
  return (
    <Svg size={size} {...stroke}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </Svg>
  )
}
Download.propTypes = sized

export function External({ size = 14 }) {
  return (
    <Svg size={size} {...stroke}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </Svg>
  )
}
External.propTypes = sized

export function ArrowUp({ size = 20 }) {
  return (
    <Svg size={size} {...stroke}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </Svg>
  )
}
ArrowUp.propTypes = sized

export function Menu({ size = 22 }) {
  return (
    <Svg size={size} {...stroke}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Svg>
  )
}
Menu.propTypes = sized

export function Close({ size = 20 }) {
  return (
    <Svg size={size} {...stroke}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  )
}
Close.propTypes = sized

export function ArrowRight({ size = 18 }) {
  return (
    <Svg size={size} {...stroke} strokeWidth={2.5}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  )
}
ArrowRight.propTypes = sized

export function Briefcase({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Svg>
  )
}
Briefcase.propTypes = sized

export function Code({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Svg>
  )
}
Code.propTypes = sized

export function Layers({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </Svg>
  )
}
Layers.propTypes = sized

export function GradCap({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
    </Svg>
  )
}
GradCap.propTypes = sized

export function Chevron({ size = 18 }) {
  return (
    <Svg size={size} {...stroke}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  )
}
Chevron.propTypes = sized

export function Send({ size = 18 }) {
  return (
    <Svg size={size} {...stroke} strokeWidth={2.5}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </Svg>
  )
}
Send.propTypes = sized

export function Sparkle({ size = 14 }) {
  return (
    <Svg size={size} fill="currentColor">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </Svg>
  )
}
Sparkle.propTypes = sized

export function GeminiMark({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14-7.732 0-14-6.268-14-14z"
        fill="white"
      />
    </svg>
  )
}
GeminiMark.propTypes = sized

// One glyph per skill category, inherits currentColor.
const glyph = { ...stroke, strokeWidth: 1.6 }
export const SKILL_GLYPHS = {
  'AI & ML': () => (
    <Svg size={24} {...glyph}>
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="19" cy="6" r="1.8" />
      <circle cx="5" cy="18" r="1.8" />
      <circle cx="19" cy="18" r="1.8" />
      <path d="M6.5 7.2 10 10.4M17.5 7.2 14 10.4M6.5 16.8 10 13.6M17.5 16.8 14 13.6" />
    </Svg>
  ),
  Languages: () => (
    <Svg size={24} {...glyph}>
      <polyline points="8 6 2 12 8 18" />
      <polyline points="16 6 22 12 16 18" />
      <line x1="13.5" y1="4.5" x2="10.5" y2="19.5" />
    </Svg>
  ),
  'Backend & Distributed': () => (
    <Svg size={24} {...glyph}>
      <rect x="2.5" y="3" width="19" height="6" rx="1.6" />
      <rect x="2.5" y="15" width="19" height="6" rx="1.6" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
      <path d="M12 9v6" />
    </Svg>
  ),
  'Frontend & Cloud': () => (
    <Svg size={24} {...glyph}>
      <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 11.2 3.9 3.9 0 0 0 7 19z" />
      <path d="M9.5 14.5 12 12l2.5 2.5" />
    </Svg>
  ),
  'Test & Embedded': () => (
    <Svg size={24} {...glyph}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
    </Svg>
  ),
  'Data & BI': () => (
    <Svg size={24} {...glyph}>
      <line x1="5" y1="20" x2="5" y2="12" />
      <line x1="12" y1="20" x2="12" y2="5" />
      <line x1="19" y1="20" x2="19" y2="15" />
      <line x1="2.5" y1="20" x2="21.5" y2="20" />
    </Svg>
  ),
}

// The rC logo: the PNG in /public is used as a CSS mask so the gradient shows
// through only the logo shape. Decorative; the element that contains it names it.
const MASK = {
  WebkitMaskImage: 'url(/rc-logo-white.png)',
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskImage: 'url(/rc-logo-white.png)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

export function RCLogo({ size = 28, gradient = 'var(--gradient-warm)' }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size * 0.895, // aspect ratio of the 591x529 source
        display: 'inline-block',
        background: gradient,
        ...MASK,
      }}
    />
  )
}
RCLogo.propTypes = { size: PropTypes.number, gradient: PropTypes.string }

export const LOGO_MASK = MASK
