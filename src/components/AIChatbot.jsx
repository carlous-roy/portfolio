import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Close, RCLogo, Send } from '../icons'
import { LIMITS } from '../../api/validate.js'
import { useReducedMotion } from '../hooks/useReducedMotion'
import {
  buildRequestMessages,
  conversationKey,
  createCache,
  createThrottle,
  sendChat,
  messageForError,
} from '../lib/chat'

// The assistant dialog. The model call goes through /api/chat, a serverless
// function that holds the API key and the system prompt; the browser sends
// only the conversation. The dialog is the native <dialog> element opened
// with showModal(), which gives the focus trap, Escape handling, the backdrop
// and focus return on close without custom code.
//
// The throttle is a courtesy stop before the server's own limit and the cache
// is keyed on the whole conversation; both last for the page.
const throttle = createThrottle({ windowMs: 5 * 60 * 1000, max: 15 })
const cache = createCache(50)
const CLOSE_ANIMATION_MS = 200

const SUGGESTIONS = [
  { label: 'Experience', q: "Tell me about Roy's work experience" },
  { label: 'Projects', q: 'What projects has Roy built?' },
  { label: 'Skills', q: "What's Roy's tech stack?" },
  { label: 'About Roy', q: 'Who is Roy and what does he do?' },
]

const FOLLOWUPS = {
  experience: [
    "What was Roy's role?",
    'What technologies did he use at work?',
    'How long did he work there?',
  ],
  projects: ['How does DiffLens work?', 'What is CodeAtlas?', 'Where can I see his code?'],
  skills: [
    'What languages does Roy know?',
    'What frameworks does he use?',
    'Does he know cloud technologies?',
  ],
  hobbies: [
    'What camera does Roy use?',
    'What sports does he follow?',
    'What movies does he like?',
  ],
  education: ['What did he study?', 'When did he graduate?', 'What was his undergrad?'],
  contact: ["What's his LinkedIn?", "What's his GitHub?", 'Where is he based?'],
  default: ['Tell me about his experience', 'What are his hobbies?', 'How to contact Roy?'],
}

function getFollowups(reply) {
  const l = reply.toLowerCase()
  if (/hcl|teradyne|work|experience|role|senior/.test(l)) return FOLLOWUPS.experience
  if (/taskforge|difflens|gesture|codeatlas|project|built|github/.test(l)) return FOLLOWUPS.projects
  if (/java|python|c\+\+|react|skill|stack/.test(l)) return FOLLOWUPS.skills
  if (/hobby|interest|cricket|photo|music|movie|sport/.test(l)) return FOLLOWUPS.hobbies
  if (/wright|degree|master|sathyabama|educat/.test(l)) return FOLLOWUPS.education
  if (/email|linkedin|contact|reach/.test(l)) return FOLLOWUPS.contact
  return FOLLOWUPS.default
}

const supportsClosedBy =
  typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype

export default function AIChatbot({ open, messages, setMessages, onClose }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [closing, setClosing] = useState(false)
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const endRef = useRef(null)
  const closeTimer = useRef(0)
  const reduced = useReducedMotion()

  // Open and close the native dialog in step with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (open && !dialog.open) {
      dialog.showModal()
      inputRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
    return undefined
  }, [open])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const handleClose = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog?.open || closing) return
    if (reduced) {
      dialog.close()
      return
    }
    setClosing(true)
    closeTimer.current = setTimeout(() => {
      setClosing(false)
      dialog.close()
    }, CLOSE_ANIMATION_MS)
  }, [closing, reduced])

  // Escape arrives as a cancel event; play the same exit as the close button.
  const onCancel = (e) => {
    e.preventDefault()
    handleClose()
  }

  // Light dismiss. Browsers with `closedby` handle backdrop clicks natively
  // (React 18 does not know the attribute, so it is set here). Elsewhere, a
  // click whose target is the dialog itself and whose point lies outside the
  // content box is on the backdrop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (supportsClosedBy) {
      dialog.setAttribute('closedby', 'any')
      return undefined
    }
    const onClick = (e) => {
      if (e.target !== dialog) return
      const rect = dialog.getBoundingClientRect()
      const inside =
        rect.top <= e.clientY &&
        e.clientY <= rect.bottom &&
        rect.left <= e.clientX &&
        e.clientX <= rect.right
      if (!inside) handleClose()
    }
    dialog.addEventListener('click', onClick)
    return () => dialog.removeEventListener('click', onClick)
  }, [handleClose])

  useEffect(() => {
    if (open)
      endRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' })
  }, [messages, loading, open, reduced])

  const send = useCallback(
    async (raw) => {
      const text = raw.trim()
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
        console.error(
          '[chatbot]',
          e.code || e.name,
          e.status ? `status ${e.status}` : '',
          e.message
        )
        finish(messageForError(e.code), true)
      }
    },
    [loading, messages, setMessages]
  )

  const lastReply = [...messages].reverse().find((m) => m.role === 'assistant' && !m.error)
  const followups = lastReply ? getFollowups(lastReply.content) : []
  const canSend = input.trim().length > 0 && !loading

  return (
    <dialog
      ref={dialogRef}
      className={`chat-dialog ${closing ? 'closing' : ''}`}
      aria-labelledby="chat-title"
      onCancel={onCancel}
      onClose={onClose}
    >
      <div className="chat-modal flex flex-col overflow-hidden">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close the assistant"
          className="icon-button absolute top-4 right-4 z-10 rounded-full text-mu bg-chip border border-edge"
        >
          <Close />
        </button>

        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6 shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-chip border border-edge">
              <RCLogo size={36} />
            </div>
            <h2 id="chat-title" className="text-xl font-semibold mb-1 text-tx">
              Hey, I&rsquo;m Roy&rsquo;s AI assistant
            </h2>
            <p className="text-sm text-mu m-0">Ask about Roy</p>
          </div>

          {messages.length === 0 && (
            <ul
              className="grid grid-cols-2 gap-3 mb-4 shrink-0 list-none m-0 p-0"
              aria-label="Suggested questions"
            >
              {SUGGESTIONS.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => send(s.q)}
                    className="suggestion w-full flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-transform hover:-translate-y-0.5 cursor-pointer bg-surface border border-edge text-tx"
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div
            className="flex flex-col gap-3 flex-1"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`chat-bubble max-w-[85%] px-4 py-3 text-[15px] leading-relaxed text-tx ${
                  m.role === 'user'
                    ? 'self-end rounded-2xl rounded-br-sm bg-chat-user'
                    : 'self-start rounded-2xl rounded-bl-sm bg-chat-ai'
                }`}
              >
                <span className="visually-hidden">
                  {m.role === 'user' ? 'You: ' : 'Assistant: '}
                </span>
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                className="self-start px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 bg-chat-ai text-su"
                aria-hidden="true"
              >
                <span className="dot-pulse">●</span>
                <span className="dot-pulse" style={{ animationDelay: '0.2s' }}>
                  ●
                </span>
                <span className="dot-pulse" style={{ animationDelay: '0.4s' }}>
                  ●
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {!loading && followups.length > 0 && (
            <ul
              className="flex flex-wrap gap-2 mt-3 list-none m-0 p-0"
              aria-label="Follow-up questions"
            >
              {followups.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="followup px-3.5 py-2 rounded-full text-[13px] cursor-pointer bg-transparent border border-edge text-su hover:text-accent-text transition-colors"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          className="px-5 pt-4 pb-3 shrink-0 border-t border-edge"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <div className="chat-input-wrap flex items-center gap-2 px-4 py-2 rounded-full border border-edge bg-chat-input">
            <label htmlFor="chat-input" className="visually-hidden">
              Ask about Roy
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Roy..."
              maxLength={LIMITS.MAX_USER_CHARS}
              autoComplete="off"
              className="flex-1 text-[15px] bg-transparent border-0 text-tx py-1.5 min-w-0"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-0 transition-colors ${
                canSend ? 'bg-button text-white cursor-pointer' : 'bg-chip text-mu'
              }`}
            >
              <Send />
            </button>
          </div>
          <p className="text-[12px] text-mu mt-2 mb-0 text-center">
            Messages are sent to Google&rsquo;s Gemini API to generate answers. Please leave out
            personal details.
          </p>
        </form>
      </div>
    </dialog>
  )
}

AIChatbot.propTypes = {
  open: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.oneOf(['user', 'assistant']).isRequired,
      content: PropTypes.string.isRequired,
      error: PropTypes.bool,
    })
  ).isRequired,
  setMessages: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
