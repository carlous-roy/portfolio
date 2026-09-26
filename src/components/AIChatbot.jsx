import { useState, useEffect, useRef, useCallback } from 'react'
import { RCLogoCompact } from './IntroAnimation'
import {
  buildRequestMessages,
  conversationKey,
  createCache,
  createThrottle,
  sendChat,
  messageForError,
} from '../lib/chat'

// The model call goes through /api/chat, a serverless function that holds the
// API key and the system prompt. The browser sends only the conversation.
// Both of these live for the page: the throttle is a courtesy stop before the
// server's own limit, and the cache is keyed on the whole conversation.
const throttle = createThrottle({ windowMs: 5 * 60 * 1000, max: 15 })
const cache = createCache(50)

const SUGGESTIONS = [
  { label: 'Experience', q: "Tell me about Roy's work experience" },
  { label: 'Projects', q: "What projects has Roy built?" },
  { label: 'Skills', q: "What's Roy's tech stack?" },
  { label: 'About Roy', q: "Who is Roy and what does he do?" },
]

const FOLLOWUPS = {
  experience: ["What was Roy's role?", "What technologies did he use at work?", "How long did he work there?"],
  projects: ["How does DiffLens work?", "What is CodeAtlas?", "Where can I see his code?"],
  skills: ["What languages does Roy know?", "What frameworks does he use?", "Does he know cloud technologies?"],
  hobbies: ["What camera does Roy use?", "What sports does he follow?", "What movies does he like?"],
  education: ["What did he study?", "When did he graduate?", "What was his undergrad?"],
  contact: ["What's his LinkedIn?", "What's his GitHub?", "Where is he based?"],
  default: ["Tell me about his experience", "What are his hobbies?", "How to contact Roy?"],
}

function getFollowups(msg) {
  const l = msg.toLowerCase()
  if (/hcl|teradyne|work|experience|role|senior/.test(l)) return FOLLOWUPS.experience
  if (/taskforge|difflens|gesture|codeatlas|project|built|github/.test(l)) return FOLLOWUPS.projects
  if (/java|python|c\+\+|react|skill|stack/.test(l)) return FOLLOWUPS.skills
  if (/hobby|interest|cricket|photo|music|movie|sport/.test(l)) return FOLLOWUPS.hobbies
  if (/wright|degree|master|sathyabama|educat/.test(l)) return FOLLOWUPS.education
  if (/email|linkedin|contact|reach/.test(l)) return FOLLOWUPS.contact
  return FOLLOWUPS.default
}

// Icons
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const SendIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
export const SparkleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/></svg>
export const GeminiLogo = () => <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14-7.732 0-14-6.268-14-14z" fill="white"/></svg>

export default function AIChatbot({ dark, messages, setMessages, onClose }) {
  const [input, setInput] = useState(''), [loading, setLoading] = useState(false), [closing, setClosing] = useState(false)
  const endRef = useRef(null), inputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 400) }, [])

  const handleClose = () => { setClosing(true); setTimeout(() => { setClosing(false); onClose() }, 200) }
  useEffect(() => { const h = e => e.key === 'Escape' && handleClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])

  const send = useCallback(
    async (msg) => {
      const text = msg.trim()
      if (!text || loading) return
      setInput('')
      setMessages((p) => [...p, { role: 'user', content: text }])
      setLoading(true)

      const finish = (content, error = false) => {
        setMessages((p) => [...p, { role: 'assistant', content, error }])
        setLoading(false)
      }

      if (!throttle.allow()) return finish(messageForError('rate_limited'), true)

      const request = buildRequestMessages(messages, text)
      const key = conversationKey(request)
      const cached = cache.get(key)
      if (cached) return finish(cached)

      try {
        const reply = await sendChat(request)
        cache.set(key, reply)
        finish(reply)
      } catch (e) {
        // Log the real error type and message. A bare catch here once hid a model
        // that had been retired, because every failure looked identical.
        console.error('[chatbot]', e.code || e.name, e.status ? `status ${e.status}` : '', e.message)
        finish(messageForError(e.code), true)
      }
    },
    [loading, messages, setMessages]
  )

  const handleSend = () => send(input)
  const lastAi = [...messages].reverse().find(m => m.role === 'assistant' && !m.error)
  const followups = lastAi ? getFollowups(lastAi.content) : []

  const t = dark
    ? { bg: 'rgba(10,10,14,0.97)', card: 'rgba(255,255,255,0.04)', cardBd: 'rgba(255,255,255,0.08)', cardHover: 'rgba(255,255,255,0.08)', msgAi: 'rgba(255,255,255,0.05)', msgUser: 'rgba(220,38,38,0.12)', border: 'rgba(255,255,255,0.07)', inputBg: 'rgba(255,255,255,0.04)', text: '#e4e4e7', sub: '#a1a1aa', muted: '#71717a' }
    : { bg: 'rgba(255,255,255,0.98)', card: 'rgba(0,0,0,0.02)', cardBd: 'rgba(0,0,0,0.08)', cardHover: 'rgba(0,0,0,0.06)', msgAi: 'rgba(0,0,0,0.04)', msgUser: 'rgba(220,38,38,0.07)', border: 'rgba(0,0,0,0.08)', inputBg: 'rgba(0,0,0,0.03)', text: '#18181b', sub: '#52525b', muted: '#a1a1aa' }

  return (
    <div className={`chatbot-overlay ${closing ? 'closing' : ''}`} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`chatbot-modal ${closing ? 'closing' : ''} flex flex-col overflow-hidden`} style={{
        width: 'min(520px, calc(100vw - 24px))', height: 'min(660px, calc(100vh - 48px))',
        borderRadius: '28px', background: t.bg, border: `1px solid ${t.border}`,
        boxShadow: dark ? '0 40px 100px rgba(0,0,0,0.7)' : '0 40px 100px rgba(0,0,0,0.12)',
      }}>
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:opacity-70 transition-opacity z-10 rounded-full" style={{ color: t.muted, background: t.card, border: `1px solid ${t.border}`, cursor: 'pointer' }}><CloseIcon /></button>

        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6 shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${t.border}` }}>
              <RCLogoCompact size={36} />
            </div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: t.text }}>Hey, I'm Roy's AI assistant</h2>
            <p className="text-sm" style={{ color: t.muted }}>Ask about Roy</p>
          </div>

          {messages.length === 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s.q)} className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5 cursor-pointer"
                  style={{ background: t.card, border: `1px solid ${t.cardBd}`, fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.cardHover; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.card; e.currentTarget.style.borderColor = t.cardBd }}>
                  <span className="text-sm font-medium" style={{ color: t.text }}>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex flex-col gap-3 flex-1">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed ${m.role === 'user' ? 'self-end rounded-2xl rounded-br-sm' : 'self-start rounded-2xl rounded-bl-sm'}`}
                  style={{ background: m.role === 'user' ? t.msgUser : t.msgAi, color: t.text, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.content}</div>
              ))}
              {loading && <div className="self-start px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1" style={{ background: t.msgAi, color: t.sub }}><span style={{ animation: 'dotPulse 1.4s infinite 0s' }}>●</span><span style={{ animation: 'dotPulse 1.4s infinite 0.2s' }}>●</span><span style={{ animation: 'dotPulse 1.4s infinite 0.4s' }}>●</span></div>}
              {!loading && followups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {followups.map((q, i) => (
                    <button key={i} onClick={() => send(q)} className="px-3.5 py-2 rounded-full text-[13px] cursor-pointer font-sans transition-all"
                      style={{ border: `1px solid ${t.border}`, background: 'transparent', color: t.sub, fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.target.style.borderColor = '#DC2626'; e.target.style.color = '#DC2626' }}
                      onMouseLeave={e => { e.target.style.borderColor = t.border; e.target.style.color = t.sub }}>{q}</button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${t.border}` }}>
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full" style={{ border: `1px solid ${t.border}`, background: t.inputBg }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about Roy..." className="flex-1 text-[15px] bg-transparent outline-none border-none" style={{ color: t.text, fontFamily: 'inherit' }} />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0"
              style={{ border: 'none', background: input.trim() ? 'linear-gradient(135deg, #DC2626, #EA580C)' : dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: input.trim() ? '#fff' : t.muted, cursor: input.trim() ? 'pointer' : 'default' }}><SendIcon /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
