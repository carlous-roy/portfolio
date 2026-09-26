import { useCallback, useEffect, useState } from 'react'
import IntroAnimation, { shouldPlayIntro } from './components/IntroAnimation'
import AIChatbot from './components/AIChatbot'
import Nav from './components/Nav'
import CursorGlow from './components/CursorGlow'
import BackgroundParticles from './components/BackgroundParticles'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Education from './sections/Education'
import Contact from './sections/Contact'
import { ArrowUp, GeminiMark } from './icons'
import { NAME, NAV } from './content/site'
import { roleFromSearch } from './content/projects'
import { useTheme } from './hooks/useTheme'
import { useActiveSection } from './hooks/useActiveSection'

const SECTION_IDS = NAV.map((n) => n.id)

// The section a deep link points at: the URL hash if it names a section, or
// Projects when the page was opened with a ?role= filter.
function deepLinkTarget(role) {
  const hash = window.location.hash.slice(1)
  if (hash && SECTION_IDS.includes(hash)) return hash
  return role !== 'all' ? 'projects' : null
}

export default function App() {
  const { dark, toggle } = useTheme()
  const [introDone, setIntroDone] = useState(() => !shouldPlayIntro())
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [role, setRole] = useState(() => roleFromSearch(window.location.search))
  const [deepLink] = useState(() => deepLinkTarget(role))
  const active = useActiveSection(SECTION_IDS, introDone)

  // Keep ?role= in the address bar in step with the filter.
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (role === 'all') url.searchParams.delete('role')
      else url.searchParams.set('role', role)
      window.history.replaceState({}, '', url)
    } catch {
      // A malformed location is not worth failing over.
    }
  }, [role])

  useEffect(() => {
    if (!introDone) return undefined
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.5)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [introDone])

  // Deep links: scroll once the sections exist.
  useEffect(() => {
    if (introDone && deepLink)
      document.getElementById(deepLink)?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [introDone, deepLink])

  const openChat = useCallback(() => setChatOpen(true), [])
  const closeChat = useCallback(() => setChatOpen(false), [])
  const onIntroDone = useCallback(() => setIntroDone(true), [])

  if (!introDone) return <IntroAnimation onComplete={onIntroDone} />

  return (
    <div className="min-h-screen font-sans theme-transition relative overflow-x-hidden noise-overlay bg-bg text-tx">
      <CursorGlow />
      <BackgroundParticles dark={dark} />

      <Nav
        active={active}
        dark={dark}
        onToggleTheme={toggle}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main id="content" tabIndex={-1} className="relative z-[2] outline-none">
        <Hero onOpenChat={openChat} />
        <About />
        <Skills dark={dark} />
        <Experience />
        <Projects role={role} setRole={setRole} />
        <Education />
        <Contact />
      </main>

      <footer className="relative z-[2] py-12 px-[clamp(24px,6vw,80px)] border-t border-edge flex justify-center items-center">
        <p className="text-sm text-mu m-0">© {NAME}</p>
      </footer>

      <button
        type="button"
        onClick={openChat}
        aria-label="Open the assistant"
        aria-haspopup="dialog"
        className="fixed bottom-7 right-7 w-14 h-14 rounded-full border-0 cursor-pointer flex items-center justify-center z-[999] transition-transform hover:scale-110 bg-button"
        style={{ boxShadow: '0 8px 36px rgba(220,38,38,0.3)' }}
      >
        <GeminiMark />
      </button>
      <AIChatbot
        open={chatOpen}
        messages={chatMessages}
        setMessages={setChatMessages}
        onClose={closeChat}
      />
      {showTop && (
        <a
          href="#hero"
          aria-label="Back to top"
          className="fixed bottom-7 left-7 w-11 h-11 rounded-full border border-edge backdrop-blur-xl text-su flex items-center justify-center z-[998] transition-transform hover:-translate-y-0.5 bg-nav no-underline"
        >
          <ArrowUp />
        </a>
      )}
    </div>
  )
}
