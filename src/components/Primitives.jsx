import PropTypes from 'prop-types'

// Small typographic building blocks shared by the sections.

export function Label({ children }) {
  return (
    <p className="font-mono text-sm font-medium tracking-[0.15em] uppercase mb-4 text-accent-text">
      {children}
    </p>
  )
}
Label.propTypes = { children: PropTypes.node }

export function H2({ children, className = '' }) {
  return (
    <h2
      className={`font-extrabold ${className}`}
      style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}
    >
      {children}
    </h2>
  )
}
H2.propTypes = { children: PropTypes.node, className: PropTypes.string }

export function Body({ children, className = '' }) {
  return (
    <p
      className={className}
      style={{
        fontSize: 'clamp(17px, 1.8vw, 20px)',
        lineHeight: 1.75,
        fontWeight: 400,
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </p>
  )
}
Body.propTypes = { children: PropTypes.node, className: PropTypes.string }

export function BulletList({ items, dot = 0.3 }) {
  return (
    <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-su" role="list">
      {items.map((item) => (
        <li
          key={item}
          className="leading-relaxed pl-5 relative"
          style={{ fontSize: 'clamp(15px, 1.6vw, 17px)' }}
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-[11px] w-1.5 h-1.5 rounded-full bg-accent"
            style={{ opacity: dot }}
          />
          {item}
        </li>
      ))}
    </ul>
  )
}
BulletList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  dot: PropTypes.number,
}

export const TONE_CLASS = { tx: 'text-tx', su: 'text-su', mu: 'text-mu' }
