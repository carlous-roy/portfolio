// Client side of the assistant: builds requests in the shape /api/chat accepts,
// keeps a per-page cache keyed on the whole conversation, and throttles sends.
// The server owns the system prompt; nothing here decides what the model is told.

import { LIMITS } from '../../api/validate.js'

export const CHAT_ENDPOINT = '/api/chat'
export const CONTACT_EMAIL = 'roy4edu@gmail.com'
export const REQUEST_TIMEOUT_MS = 20000

// Messages as the UI stores them: { role: 'user' | 'assistant', content, error? }.
// The request carries only completed exchanges, so a failed turn (an error
// bubble) is never replayed to the model as something it said.
export function buildRequestMessages(history, text) {
  const current = String(text).trim().slice(0, LIMITS.MAX_USER_CHARS)
  const pairs = []
  for (let i = 0; i + 1 < history.length; i++) {
    const q = history[i]
    const a = history[i + 1]
    if (q.role !== 'user' || a.role !== 'assistant' || a.error) continue
    const question = String(q.content).trim().slice(0, LIMITS.MAX_USER_CHARS)
    const answer = String(a.content).trim().slice(0, LIMITS.MAX_MODEL_CHARS)
    if (question && answer) pairs.push([question, answer])
    i++
  }
  const budget = LIMITS.MAX_TOTAL_CHARS - current.length
  const maxPairs = Math.floor((LIMITS.MAX_TURNS - 1) / 2)
  let total = pairs.reduce((n, [q, a]) => n + q.length + a.length, 0)
  while (pairs.length && (pairs.length > maxPairs || total > budget)) {
    const [q, a] = pairs.shift()
    total -= q.length + a.length
  }
  const messages = []
  for (const [q, a] of pairs) {
    messages.push({ role: 'user', text: q })
    messages.push({ role: 'model', text: a })
  }
  messages.push({ role: 'user', text: current })
  return messages
}

// The cache key is the full request, so the same follow-up after a different
// answer is a different key.
export function conversationKey(messages) {
  return JSON.stringify(messages.map((m) => [m.role, m.text.toLowerCase()]))
}

export function createCache(max = 50) {
  const map = new Map()
  return {
    get(key) {
      if (!map.has(key)) return undefined
      const value = map.get(key)
      map.delete(key)
      map.set(key, value)
      return value
    },
    set(key, value) {
      map.delete(key)
      map.set(key, value)
      if (map.size > max) map.delete(map.keys().next().value)
    },
    size() {
      return map.size
    },
  }
}

// Advisory throttle in the page: a friendlier stop than a 429 from the server.
export function createThrottle({ windowMs, max, now = Date.now }) {
  let stamps = []
  return {
    allow() {
      const t = now()
      stamps = stamps.filter((s) => t - s < windowMs)
      if (stamps.length >= max) return false
      stamps.push(t)
      return true
    },
  }
}

export class ChatError extends Error {
  constructor(code, status) {
    super(code)
    this.name = 'ChatError'
    this.code = code
    this.status = status
  }
}

// Posts the conversation and returns the reply text. Throws ChatError with a
// code the UI maps to a sentence: not_configured, rate_limited, timeout,
// unavailable.
export async function sendChat(messages, { fetchFn = fetch, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let response
  try {
    response = await fetchFn(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    })
  } catch (err) {
    throw new ChatError(err?.name === 'AbortError' ? 'timeout' : 'unavailable', 0)
  } finally {
    clearTimeout(timer)
  }
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) {
    const code = data?.code
    if (code === 'not_configured') throw new ChatError('not_configured', response.status)
    if (response.status === 429) throw new ChatError('rate_limited', response.status)
    if (response.status === 504 || code === 'upstream_timeout') {
      throw new ChatError('timeout', response.status)
    }
    throw new ChatError('unavailable', response.status)
  }
  const reply = typeof data?.reply === 'string' ? data.reply.trim() : ''
  if (!reply) throw new ChatError('unavailable', response.status)
  return reply
}

export function messageForError(code) {
  switch (code) {
    case 'not_configured':
      return `The assistant is not set up right now. Email Roy at ${CONTACT_EMAIL} and he will answer himself.`
    case 'rate_limited':
      return `That's a lot of questions. Give it a minute, or reach Roy at ${CONTACT_EMAIL}`
    case 'timeout':
      return `The assistant took too long to answer. Try again, or reach Roy at ${CONTACT_EMAIL}`
    default:
      return `The assistant is unavailable right now. Reach Roy at ${CONTACT_EMAIL}`
  }
}
