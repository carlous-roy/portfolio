import { useState, useEffect, useRef, useCallback } from 'react'
import { RCLogoCompact } from './IntroAnimation'

// Gemini API — dual key rotation with rate limiting
const GEMINI_KEYS = [import.meta.env.VITE_GEMINI_KEY_1, import.meta.env.VITE_GEMINI_KEY_2].filter(Boolean)
const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`
let requestTimestamps = [], currentKeyIndex = 0, responseCache = new Map()

function isRateLimited() {
  const now = Date.now()
  requestTimestamps = requestTimestamps.filter(t => now - t < 300000) // 5 min window
  return requestTimestamps.length >= 15
}

// Chatbot persona — this is the knowledge base, keep it dense
const SYSTEM_PROMPT = `You are the AI assistant on Roy Carlous Christudass's portfolio website (roycarlous.com). Speak in THIRD PERSON about Roy. You are NOT Roy. Be warm, professional, and conversational. No emojis. No filler like "Great question!" Keep answers 2-5 sentences. If unsure, suggest contacting Roy directly.

Roy, from Chennai, India. MS CS at Wright State University (graduating May 2026). Coursework: Algorithm Design, Distributed Computing, Foundations of AI, Advanced Computer Networks. BE ECE from Sathyabama, Chennai.

Work: HCLTech contractor to Teradyne, Jan 2022-Aug 2024. Progressed Intern to SE to Senior SWE. Built C++/C# instrument drivers for IGXL semiconductor test platform (Flex, UltraFlex, UltraFlex+). Resolved 150+ defects. Introduced new language nodes for analog instruments. Managed code via VersionVault. JIRA workflows.

Projects: TaskForge (LIVE at taskforge.roycarlous.com) - distributed report generation engine. REST API, SQS queuing, S3 storage with presigned URLs, fault tolerance (exponential backoff, DLQ, idempotency), correlation ID tracing, React dashboard, rate limiting. Java/Spring Boot/AWS/Docker/React/H2. GitHub: github.com/carlous-roy/TaskForge-Engine.
DiffLens (LIVE at difflens.roycarlous.com) - ML code review engine. Tree-sitter AST parsing, gradient boosting risk scoring, GitHub webhook PR comments. Python/FastAPI/scikit-learn/PostgreSQL/React/Docker/Ollama. 14-file test suite. GitHub: github.com/carlous-roy/DiffLens-Engine.
Portfolio (roycarlous.com) - React/Vite/Tailwind/Gemini chatbot.
GestureControl (LIVE at gesture.roycarlous.com) - AI gesture-based home automation. Real-time hand gesture recognition at 30 FPS using OpenCV + MediaPipe, controls Arduino relay module via PyFirmata. Bachelor's degree project at Sathyabama (2022). Python/OpenCV/MediaPipe/PyFirmata/Arduino. GitHub: github.com/carlous-roy/GestureControl-Engine.

Skills: Java, Python, C#, C++, JS. Spring Boot, FastAPI, React, SQLAlchemy, scikit-learn, Tree-sitter. AWS (SQS, S3, DynamoDB), Docker. PostgreSQL, DynamoDB, H2. Git, Maven, pytest, JUnit, JIRA, VersionVault, Swagger/OpenAPI, Ollama. OpenCV, MediaPipe.

Interests: Photography (Sony A7V), Cricket (Sachin Tendulkar), Football (Ronaldo), UFC, F1, Cinema (Nolan, Villeneuve, Tamil cinema/Vijay), Music (AR Rahman, Weeknd, Linkin Park, Hans Zimmer).

Contact: roycarlous@gmail.com | linkedin.com/in/roycarlous | github.com/carlous-roy | +1 (326) 467-1939

Edge cases: Religion/politics/personal = "That's personal to Roy, happy to talk about his professional side." Salary = "Best discussed directly with Roy." Work authorization = "Best discussed with Roy directly." Unknown = be honest, suggest contacting Roy.`

// Extra context injected based on what the user asks about
const CTX = {
  work: 'HCLTech contractor to Teradyne, Jan 2022-Aug 2024. Intern->SE->Senior SWE. C++/C# drivers for IGXL. 150+ defects. Flex/UltraFlex/UltraFlex+. VersionVault, JIRA.',
  education: 'MS CS at Wright State (2024-2026). Coursework: Algorithm Design, Distributed Computing, AI, Computer Networks. BE ECE from Sathyabama, Chennai (2018-2022).',
  projects: 'TaskForge (LIVE): distributed report generation. REST->SQS->Workers->S3. Java/Spring Boot/AWS/Docker/H2. DiffLens (LIVE): ML code review. Tree-sitter+scikit-learn+GitHub webhooks. Python/FastAPI/PostgreSQL/React/Docker. GestureControl (LIVE): OpenCV+MediaPipe hand tracking, Arduino relay control.',
  skills: 'Java, Python, C#, C++, JS. Spring Boot, FastAPI, React, scikit-learn, Tree-sitter. AWS (SQS, S3, DynamoDB), Docker. PostgreSQL, DynamoDB, H2. Git, Maven, Ollama.',
  hobbies: 'Photography (Sony A7V), cricket, F1, UFC, cinema, music.',
  contact: 'roycarlous@gmail.com, linkedin.com/in/roycarlous, github.com/carlous-roy, +1 (326) 467-1939. Based in US, open to relocation.',
}

function getCtx(q) {
  const l = q.toLowerCase(), matched = []
  if (/work|job|hcl|teradyne|experience|career/.test(l)) matched.push(CTX.work)
  if (/educat|school|university|wright|degree/.test(l)) matched.push(CTX.education)
  if (/project|taskforge|difflens|gesture|arduino|opencv|built|github/.test(l)) matched.push(CTX.projects)
  if (/skill|tech|stack|language|java|python/.test(l)) matched.push(CTX.skills)
  if (/hobb|interest|cricket|music|photo|movie|sport/.test(l)) matched.push(CTX.hobbies)
  if (/contact|email|reach|connect|linkedin|hire/.test(l)) matched.push(CTX.contact)
  return matched.length ? '\n\nContext:\n' + matched.join('\n') : ''
}

const SUGGESTIONS = [
  { label: 'Experience', q: "Tell me about Roy's work experience" },
  { label: 'Projects', q: "What projects has Roy built?" },
  { label: 'Skills', q: "What's Roy's tech stack?" },
  { label: 'About Roy', q: "Who is Roy and what does he do?" },
]

const FOLLOWUPS = {
  experience: ["What was Roy's role?", "What technologies did he use at work?", "How long did he work there?"],
  projects: ["How does TaskForge work?", "How does DiffLens work?", "Where can I see his code?"],
  skills: ["What languages does Roy know?", "What frameworks does he use?", "Does he know cloud technologies?"],
  hobbies: ["What camera does Roy use?", "What sports does he follow?", "What movies does he like?"],
  education: ["What courses is he taking?", "When does he graduate?", "What was his undergrad?"],
  contact: ["What's his LinkedIn?", "What's his GitHub?", "Where is he based?"],
  default: ["Tell me about his experience", "What are his hobbies?", "How to contact Roy?"],
}

function getFollowups(msg) {
  const l = msg.toLowerCase()
  if (/hcl|teradyne|work|experience|role|senior/.test(l)) return FOLLOWUPS.experience
  if (/taskforge|difflens|project|built|github/.test(l)) return FOLLOWUPS.projects
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

  const send = useCallback(async (msg) => {
    if (!msg.trim() || loading) return
    setInput('')
    setMessages(p => [...p, { role: 'user', content: msg.trim() }])
    setLoading(true)

    const fail = (text) => { setMessages(p => [...p, { role: 'assistant', content: text }]); setLoading(false) }

    if (isRateLimited()) return fail("You've been chatting a lot! Reach Roy directly at roycarlous@gmail.com")
    const ck = msg.toLowerCase().trim()
    if (responseCache.has(ck)) return fail(responseCache.get(ck))
    if (!GEMINI_KEYS.length) return fail("API not configured. Reach Roy at roycarlous@gmail.com!")

    const callAPI = async (ki) => {
      const r = await fetch(GEMINI_URL(GEMINI_KEYS[ki % GEMINI_KEYS.length]), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT + getCtx(msg) }] },
          contents: [...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: msg }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 300 }
        })
      })
      if (!r.ok) throw new Error(r.status)
      return r.json()
    }

    try {
      requestTimestamps.push(Date.now())
      const d = await callAPI(currentKeyIndex)
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length
      const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't process that."
      responseCache.set(ck, reply)
      setMessages(p => [...p, { role: 'assistant', content: reply }])
    } catch {
      try {
        currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length
        const d = await callAPI(currentKeyIndex)
        const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || "Having trouble."
        responseCache.set(ck, reply)
        setMessages(p => [...p, { role: 'assistant', content: reply }])
      } catch { fail("Connection issue. Reach Roy at roycarlous@gmail.com!") }
    }
    setLoading(false)
  }, [input, loading, messages, setMessages])

  const handleSend = () => send(input)
  const lastAi = [...messages].reverse().find(m => m.role === 'assistant')
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
                  style={{ background: m.role === 'user' ? t.msgUser : t.msgAi, color: t.text }}>{m.content}</div>
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
