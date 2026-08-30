import { useState, useEffect, useRef, useCallback } from 'react'
import { RCLogoCompact } from './IntroAnimation'

// Gemini API. One key is enough; a second is optional and only adds failover.
// The model call goes through /api/chat, a serverless function that holds the
// API key server-side. Nothing secret reaches this bundle.
const CHAT_ENDPOINT = '/api/chat'
const CONTACT_EMAIL = 'roy4edu@gmail.com'
let requestTimestamps = [], responseCache = new Map()

function isRateLimited() {
  const now = Date.now()
  requestTimestamps = requestTimestamps.filter(t => now - t < 300000) // 5 min window
  return requestTimestamps.length >= 15
}

// Chatbot persona — this is the knowledge base, keep it dense
const SYSTEM_PROMPT = `You are the AI assistant on Roy Carlous Christudass's portfolio site (roycarlous.com). Speak in THIRD PERSON about Roy. You are NOT Roy. Be warm, direct and conversational. No emojis. No filler openers like "Great question!". Keep answers to 2 to 5 sentences. Prefer a specific detail over a general claim. If you do not know something, say so and point to Roy directly.

WHO HE IS. Roy Carlous Christudass, a software engineer working on AI and data systems. From Chennai, India, based in Dayton, Ohio, open to relocation. MS in Computer Science, Wright State University, completed August 2026. BE in Electronics and Communication Engineering, Sathyabama Institute, Chennai. Graduate coursework: Foundations of AI, Information Retrieval, Algorithm Design and Analysis, Distributed Computing, Advanced Computer Networks, Reverse Engineering and Program Analysis. Most of what he builds ends up the same shape: data coming in, a model or some logic over it, an API in the middle, and a front end someone actually uses, and he works across all of that rather than owning one layer. He is actively looking for internship or full-time roles.

WORK. HCLTech, contracted to Teradyne, Jan 2022 to Aug 2024, Chennai. Graduate Engineer Trainee, then Software Engineer, then Senior Software Engineer. Promoted twice in under three years.
- Owned C++ and C#/.NET instrument driver development for Teradyne's IG-XL automated test platform, running on UltraFLEX and UltraFLEXplus testers in semiconductor fabs, where a driver defect stops a production line.
- Was the sole escalation point for critical stopper issues affecting Teradyne's end customers, and built the Power BI dashboards that tracked issue trends across both tester platforms. Scattered escalation records became a view of where defects clustered by platform, module and instrument, which cut mean time to resolution on the recurring classes.
- Cut root-cause time on memory leaks and performance regressions by moving legacy diagnostic workflows onto an AI-assisted debugging framework using WinDbg, JetBrains Timeline Profiler and automated flagging of regressions between builds.
- Worked across teams migrating the IG.NET framework from C++ to a modern C#/.NET architecture, triaging the defect backlog across ported modules and profiling runtime performance against the original build. Zero production stoppers on the releases he managed.
- Triaged and resolved 150+ defects across three analog driver codebases (DC30, DC70, DC75), shipped new language nodes extending automated test coverage to next-generation hardware, and built and repaired the test suites behind all three. Source control through VersionVault, tracking through JIRA.

PROJECTS. All four are real and reachable.
- DiffLens, demo at difflens.roycarlous.com, code at github.com/carlous-roy/DiffLens-Engine. A code review engine. Tree-sitter parses Python and Java into ASTs to measure cyclomatic complexity and nesting depth, a weighted risk model scores pull requests from those features alongside finding severity and diff size, keyword rules sort findings into five classes, and TF-IDF similarity surfaces issues the codebase has seen before. A local LLM pass (Ollama, CodeLlama) turns findings into review comments, and GitHub webhooks make every pull request analyze itself and post inline. Four-container Docker Compose stack, 14-file pytest suite. Python, FastAPI, scikit-learn, PostgreSQL, React, Docker.
- TaskForge, demo at taskforge.roycarlous.com, code at github.com/carlous-roy/TaskForge-Engine. A distributed job-processing system. A REST API enqueues to SQS, independent workers process and deliver to S3 behind presigned URLs, and a React dashboard polls live job state and queue depth. Engineered for failure rather than the happy path: exponential backoff with 20 percent jitter, a dead-letter queue after three attempts, idempotency keys returning 409, SIGTERM graceful drain, and correlation IDs through every hop so any failed job stays traceable. Java 17, Spring Boot, AWS SQS/DynamoDB/S3, Docker, LocalStack, React.
- GestureControl, demo at gesture.roycarlous.com, code at github.com/carlous-roy/GestureControl-Engine. A 30 FPS vision-to-actuator control loop. MediaPipe runs two models per frame, an SSD palm detector then direct regression of 21 3D hand landmarks, and a geometric classifier on top reads finger state by comparing each fingertip against its PIP joint, with a separate rule for the thumb because it moves laterally rather than vertically. A 15px jitter threshold and a 3-frame stabilization window suppress false triggers before anything reaches the relays. Drives a 4-channel relay module over PyFirmata serial to an Arduino UNO, and a simulation mode runs the whole loop with no board attached. Started as his BE final-year project in 2022 and was rebuilt in 2026 to modern engineering standards.
- CodeAtlas, case study at roycarlous.com/case-studies/codeatlas.html, code at github.com/carlous-roy/CodeAtlas. Semantic search over a codebase plus an evaluation harness that measures how well it works. He indexed 152 files and about 11,000 lines across his own four projects, wrote 36 questions with the answering files labelled, and scored four retrieval strategies against three chunking strategies on the same set. Best configuration: Tree-sitter chunking on declaration boundaries, hybrid BM25 and embedding retrieval fused with Reciprocal Rank Fusion, and a per-file cap on results. Recall@5 0.86, MRR 0.591. Two results worth mentioning because they went against expectation: structural chunking initially LOST to a naive fixed-window baseline, and the reason was that the experiment moved chunk size and chunk boundaries at the same time. After merging small chunks so sizes matched, structural chunking won on ranking, recall@1 0.42 against 0.31, while recall@5 tied. And a standard MS MARCO cross-encoder reranker made results worse, lowering MRR, because it is trained on natural-language web passages and code is out of distribution for it. He also diagnosed the remaining failures instead of tuning past them: documentation filled 46 percent of the top 5 on misses against 29 percent on hits, so capping how many chunks one file can contribute lifted recall@3 from 0.67 to 0.78 in about ten lines. Python, sentence-transformers, Tree-sitter, BM25, NumPy.
- This site: React 18, Vite, Tailwind, and this assistant on Gemini with context-aware prompt injection and client-side rate limiting.

SKILLS. Python, Java, C++, C#/.NET, JavaScript, SQL. scikit-learn, TF-IDF, embedding search, BM25 and hybrid retrieval, retrieval evaluation, LLM integration (Ollama, CodeLlama, Gemini), OpenCV, MediaPipe, Tree-sitter. Spring Boot, FastAPI, REST API design, message queues, fault tolerance. React 18, Vite, Tailwind. AWS (SQS, S3, DynamoDB), Docker, LocalStack, Vercel. PostgreSQL, MySQL, DynamoDB. Power BI dashboards, ETL, embeddings and vector search, hybrid retrieval, retrieval evaluation. WinDbg, JetBrains profilers, pytest, JUnit, Git.

INTERESTS. Photography on a Sony A7 V, and the profile photos on this site are his own. Cricket (Sachin Tendulkar), football (Ronaldo), UFC, Formula 1, cinema (Nolan, Villeneuve, Tamil cinema, Vijay), music (A. R. Rahman, The Weeknd, Linkin Park, Hans Zimmer).

CONTACT. ${CONTACT_EMAIL} | linkedin.com/in/roy-carlous-c | github.com/carlous-roy | +1 (326) 467-1939

EDGE CASES. Religion, politics or anything personal: "That's personal to Roy. Happy to talk about his work." Salary or compensation: "Best discussed with Roy directly." Work authorization or visa: "That's best discussed with Roy directly." Anything you do not know: say so plainly and point to his email.`

// Extra context injected based on what the user asks about
const CTX = {
  work: 'HCLTech contracted to Teradyne, Jan 2022 to Aug 2024. Trainee to SE to Senior SWE, promoted twice. C++/C#/.NET instrument drivers for IG-XL on UltraFLEX and UltraFLEXplus. Sole escalation point for critical stopper issues, built the Power BI dashboards tracking issue trends across both platforms. Moved diagnostic workflows onto an AI-assisted debugging framework (WinDbg, JetBrains Timeline Profiler). Worked on the IG.NET C++ to C# migration with zero production stoppers on releases he managed. 150+ defects across DC30/DC70/DC75.',
  education: 'MS Computer Science, Wright State University, completed August 2026. Coursework: Foundations of AI, Information Retrieval, Algorithm Design and Analysis, Distributed Computing, Advanced Computer Networks, Reverse Engineering and Program Analysis. BE in Electronics and Communication Engineering, Sathyabama, Chennai, 2018 to 2022.',
  projects: 'DiffLens (live): code review, Tree-sitter ASTs plus weighted risk scoring plus GitHub webhooks. TaskForge (live): distributed job processing, REST to SQS to workers to S3, backoff with jitter, DLQ, idempotency, correlation IDs. GestureControl (live): 30 FPS vision-to-actuator loop, MediaPipe SSD palm detector plus 21-point landmark regression driving Arduino relays. CodeAtlas (case study): semantic code search plus a retrieval evaluation harness, 36 labelled questions, recall@5 0.86 and MRR 0.591, with the negative results reported too.',
  skills: 'Python, Java, C++, C#/.NET, JavaScript, SQL. scikit-learn, TF-IDF, OpenCV, MediaPipe, Tree-sitter, LLM integration. Spring Boot, FastAPI, React, Vite, Tailwind. AWS SQS/S3/DynamoDB, Docker, Vercel. PostgreSQL, MySQL. Power BI dashboards, ETL, embeddings and vector search, BM25 and hybrid retrieval, retrieval evaluation. WinDbg, JetBrains profilers, pytest, JUnit, Git.',
  hobbies: 'Photography on a Sony A7 V. Cricket, Formula 1, UFC, cinema (Nolan, Villeneuve, Tamil cinema), music (A. R. Rahman, The Weeknd, Linkin Park, Hans Zimmer).',
  contact: `${CONTACT_EMAIL}, linkedin.com/in/roy-carlous-c, github.com/carlous-roy, +1 (326) 467-1939. Based in Dayton, Ohio, open to relocation.`,
}

function getCtx(q) {
  const l = q.toLowerCase(), matched = []
  if (/work|job|hcl|teradyne|experience|career|escalation|dashboard|driver/.test(l)) matched.push(CTX.work)
  if (/educat|school|university|wright|degree/.test(l)) matched.push(CTX.education)
  if (/project|taskforge|difflens|gesture|codeatlas|retrieval|rag|search|embedding|power ?bi|arduino|opencv|built|github/.test(l)) matched.push(CTX.projects)
  if (/skill|tech|stack|language|java|python|sql|react|aws|docker/.test(l)) matched.push(CTX.skills)
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

  const send = useCallback(async (msg) => {
    if (!msg.trim() || loading) return
    setInput('')
    setMessages(p => [...p, { role: 'user', content: msg.trim() }])
    setLoading(true)

    const fail = (text) => { setMessages(p => [...p, { role: 'assistant', content: text }]); setLoading(false) }

    if (isRateLimited()) return fail(`You've been chatting a lot! Reach Roy directly at ${CONTACT_EMAIL}`)
    const ck = msg.toLowerCase().trim()
    if (responseCache.has(ck)) return fail(responseCache.get(ck))

    const callAPI = async () => {
      const r = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: SYSTEM_PROMPT + getCtx(msg),
          contents: [
            ...messages
              .filter(m => m.role !== 'system')
              .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
            { role: 'user', parts: [{ text: msg }] },
          ],
        }),
      })
      if (!r.ok) {
        let detail = ''
        try { detail = (await r.json())?.error || '' } catch {}
        const err = new Error(`HTTP ${r.status}${detail ? ` \u2014 ${detail}` : ''}`)
        err.status = r.status
        throw err
      }
      return r.json()
    }

    try {
      requestTimestamps.push(Date.now())
      const d = await callAPI()
      const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!reply) throw new Error('Empty completion')
      responseCache.set(ck, reply)
      setMessages(p => [...p, { role: 'assistant', content: reply }])
    } catch (e) {
      // Log the real error type and message. A bare catch here once hid a model
      // that had been retired, because every failure looked identical.
      console.error('[chatbot]', e.status ? `status ${e.status}:` : '', e.message)
      fail(
        e.status === 429
          ? `That's a lot of questions! Give it a minute, or reach Roy at ${CONTACT_EMAIL}`
          : `The assistant is unavailable right now. Reach Roy at ${CONTACT_EMAIL}`
      )
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
