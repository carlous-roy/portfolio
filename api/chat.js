// Server-side route for the assistant. Runs on Vercel's Node runtime as
// POST /api/chat and, through scripts/local-api.js, on the Vite dev server.
//
// What the server owns:
//   - the system instruction (api/knowledge.js); the client cannot supply one
//   - the request schema (api/validate.js): only { messages: [{ role, text }] }
//   - the model, generation settings and output size
//   - the keys, read from the environment at request time so they never
//     reach the bundle (a VITE_-prefixed variable would be inlined by Vite)
//
// Failure handling: each request gets an upstream timeout, keys are tried in
// order on quota and server errors, and every upstream failure is logged as
// one JSON line without the key or the conversation. When no key is set or
// every attempt fails, the route answers from api/fallback.js, written from
// the same facts, so the visitor gets an answer and the failure goes to the
// logs rather than the dialog.

import { buildSystemInstruction } from './knowledge.js'
import { fallbackReply } from './fallback.js'
import { validateChatBody } from './validate.js'
import { createRateLimiter } from './ratelimit.js'

export const MODEL = 'gemini-3.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// Per-instance sliding window; see api/ratelimit.js for what it does and does
// not protect against.
export const WINDOW_MS = 5 * 60 * 1000
export const MAX_PER_WINDOW = 20

// One upstream attempt may take this long; all attempts together stay inside
// the total budget so the function returns before the platform cuts it off.
export const UPSTREAM_TIMEOUT_MS = 12000
export const TOTAL_BUDGET_MS = 25000

const PRODUCTION_ORIGINS = ['https://roycarlous.com', 'https://www.roycarlous.com']

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  // Thinking tokens are drawn from maxOutputTokens; too small a budget and the
  // model spends it reasoning and the answer arrives truncated.
  maxOutputTokens: 800,
  thinkingConfig: { thinkingLevel: 'low' },
}

// Origins that may call the route: the production hosts, this deployment's own
// Vercel URLs (previews), and localhost outside production.
export function allowedOrigins(env) {
  const origins = new Set(PRODUCTION_ORIGINS)
  for (const name of ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL']) {
    if (env[name]) origins.add(`https://${env[name]}`)
  }
  return origins
}

function isLocalOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin)
    return protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')
  } catch {
    return false
  }
}

// Reads the caller's origin from Origin, falling back to Referer. Browsers send
// Origin on every POST made with fetch; a request with neither header did not
// come from the site and is refused. This is a speed bump against casual reuse
// of the route, not authentication: any client can set the header.
export function requestOrigin(headers) {
  const origin = headers['origin']
  if (typeof origin === 'string' && origin) return origin
  const referer = headers['referer']
  if (typeof referer === 'string' && referer) {
    try {
      return new URL(referer).origin
    } catch {
      return null
    }
  }
  return null
}

export function originAllowed(origin, env) {
  if (!origin) return false
  if (allowedOrigins(env).has(origin)) return true
  return env.VERCEL_ENV !== 'production' && isLocalOrigin(origin)
}

// On Vercel x-real-ip is set by the platform and x-forwarded-for is rewritten,
// so neither is caller-controlled there. Elsewhere they are advisory, which is
// consistent with the limiter being a cost guard only.
export function clientKey(req) {
  const real = req.headers['x-real-ip']
  if (typeof real === 'string' && real) return real
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim() || 'unknown'
  return req.socket?.remoteAddress || 'unknown'
}

// Gemini is asked for plain text, but models still slip in Markdown. Strip the
// common markers so the client can render the reply as text with line breaks.
export function toPlainText(text) {
  return String(text)
    .replace(/\r\n?/g, '\n')
    .replace(/^```[^\n]*$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[*•]\s+/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function readBody(req) {
  // Vercel parses JSON bodies before the handler runs and throws on access when
  // the JSON is invalid. Some runtimes leave the raw string instead.
  let body
  try {
    body = req.body
  } catch {
    return { error: 'Malformed JSON' }
  }
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return { error: 'Malformed JSON' }
    }
  }
  return { body }
}

function extractText(completion) {
  const parts = completion?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((p) => typeof p?.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('')
}

function truncate(value, max = 300) {
  const s = String(value)
  return s.length > max ? s.slice(0, max) + '…' : s
}

export function createHandler({
  fetch = globalThis.fetch,
  env = process.env,
  now = Date.now,
  log = console,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
} = {}) {
  const limiter = createRateLimiter({ windowMs: WINDOW_MS, max: MAX_PER_WINDOW, now })

  const logEvent = (level, event, fields) => {
    const line = JSON.stringify({ event, model: MODEL, ...fields })
    if (level === 'error') log.error(line)
    else log.warn(line)
  }

  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const origin = requestOrigin(req.headers || {})
    if (!originAllowed(origin, env)) {
      return res.status(403).json({ error: 'Forbidden origin' })
    }

    if (limiter.hit(clientKey(req))) {
      res.setHeader('Retry-After', String(Math.ceil(WINDOW_MS / 1000)))
      return res.status(429).json({ error: 'Too many requests', code: 'rate_limited' })
    }

    const { body, error: bodyError } = readBody(req)
    if (bodyError) return res.status(400).json({ error: bodyError })
    const validated = validateChatBody(body)
    if (!validated.ok) return res.status(400).json({ error: validated.error })
    const { messages } = validated

    const latest = messages[messages.length - 1].text

    // The local answer for this question, with the reason it was used in the
    // log (never the question itself).
    const answerLocally = (reason) => {
      const { reply, topic } = fallbackReply(latest)
      logEvent('warn', 'fallback', { reason, topic })
      return res.status(200).json({ reply, source: 'fallback' })
    }

    // Keys are read here, per request, never at module load.
    const keys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_2].filter(Boolean)
    if (!keys.length) return answerLocally('not_configured')

    const payload = {
      system_instruction: {
        parts: [{ text: buildSystemInstruction(latest) }],
      },
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: GENERATION_CONFIG,
    }
    const body_ = JSON.stringify(payload)

    const deadline = now() + TOTAL_BUDGET_MS
    let outcome = 'unavailable'
    for (let i = 0; i < keys.length; i++) {
      const remaining = deadline - now()
      if (remaining <= 0) break
      const controller = new AbortController()
      const timer = setTimeoutFn(() => controller.abort(), Math.min(UPSTREAM_TIMEOUT_MS, remaining))
      const started = now()
      try {
        const upstream = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': keys[i] },
          body: body_,
          signal: controller.signal,
        })
        if (upstream.ok) {
          const completion = await upstream.json()
          const text = extractText(completion)
          if (!text) {
            logEvent('error', 'empty_completion', {
              keyIndex: i,
              finishReason: completion?.candidates?.[0]?.finishReason || null,
              blockReason: completion?.promptFeedback?.blockReason || null,
            })
            return answerLocally('empty_completion')
          }
          return res.status(200).json({ reply: toPlainText(text), source: 'model' })
        }
        let detail = ''
        try {
          detail = truncate(await upstream.text())
        } catch {
          detail = ''
        }
        logEvent('error', 'upstream_error', {
          keyIndex: i,
          status: upstream.status,
          elapsedMs: now() - started,
          detail,
        })
        outcome = upstream.status === 429 ? 'quota' : 'unavailable'
        // 4xx other than quota exhaustion will fail the same way on the next key.
        if (upstream.status !== 429 && upstream.status < 500) break
      } catch (err) {
        const aborted = err?.name === 'AbortError'
        logEvent('error', aborted ? 'upstream_timeout' : 'upstream_exception', {
          keyIndex: i,
          elapsedMs: now() - started,
          name: err?.name || null,
          message: truncate(err?.message || '', 200),
        })
        outcome = aborted ? 'timeout' : 'unavailable'
      } finally {
        clearTimeoutFn(timer)
      }
    }

    // Upstream detail is in the logs; the visitor gets an answer either way.
    return answerLocally(outcome)
  }
}

export default createHandler()
