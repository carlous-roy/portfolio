import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { NAV } from '../content/site'
import { Close, Menu, Moon, RCLogo, Sun } from '../icons'

const MENU_ID = 'mobile-menu'

export default function Nav({ active, dark, onToggleTheme, menuOpen, setMenuOpen }) {
  // Close the mobile menu with Escape and keep the page from scrolling under it.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen, setMenuOpen])

  const themeButton = (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="icon-button text-su"
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  )

  const linkClass = (id) =>
    `px-4 py-1.5 rounded-full text-sm font-medium no-underline transition-colors ${
      active === id ? 'bg-chip text-tx' : 'text-su hover:text-tx'
    }`

  return (
    <header>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-[clamp(16px,4vw,48px)] bg-nav backdrop-blur-2xl border-b border-edge theme-transition"
      >
        <a
          href="#hero"
          aria-label="Back to top"
          className="flex items-center gap-1 no-underline min-h-[44px] pr-2"
        >
          <RCLogo size={30} />
          <span className="font-mono text-xs font-medium text-mu">/swe</span>
        </a>
        <div className="hidden md:flex items-center gap-1">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {NAV.filter((n) => n.id !== 'hero').map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={linkClass(id)}
                  aria-current={active === id ? 'location' : undefined}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="w-px h-5 mx-2 bg-line" aria-hidden="true" />
          {themeButton}
        </div>
        <div className="flex md:hidden items-center gap-1">
          {themeButton}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            className="icon-button text-tx"
          >
            {menuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>
      <div
        id={MENU_ID}
        hidden={!menuOpen}
        className="fixed top-16 inset-x-0 bottom-0 z-[99] backdrop-blur-2xl p-8 bg-menu overflow-y-auto"
      >
        <ul className="flex flex-col gap-2 list-none m-0 p-0">
          {NAV.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setMenuOpen(false)}
                aria-current={active === id ? 'location' : undefined}
                className={`block py-4 text-2xl font-semibold no-underline border-b border-edge ${
                  active === id ? 'text-tx' : 'text-su'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

Nav.propTypes = {
  active: PropTypes.string.isRequired,
  dark: PropTypes.bool.isRequired,
  onToggleTheme: PropTypes.func.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  setMenuOpen: PropTypes.func.isRequired,
}
