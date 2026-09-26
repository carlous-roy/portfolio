// Request schema for /api/chat. The client sends
//   { messages: [{ role: 'user' | 'model', text: string }, ...] }
// and nothing else. The server builds the system instruction itself, so the
// only caller-controlled input is this list of turns.

export const LIMITS = Object.freeze({
  MAX_TURNS: 40,
  MAX_USER_CHARS: 1000,
  MAX_MODEL_CHARS: 4000,
  MAX_TOTAL_CHARS: 20000,
})

const ROLES = new Set(['user', 'model'])

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Returns { ok: true, messages } with normalised turns, or
// { ok: false, error } with a short reason the client may show.
export function validateChatBody(body) {
  if (!isPlainObject(body)) return fail('Body must be a JSON object')
  const keys = Object.keys(body)
  if (keys.length !== 1 || keys[0] !== 'messages') {
    return fail('Body must contain only "messages"')
  }
  const { messages } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return fail('"messages" must be a non-empty array')
  }
  if (messages.length > LIMITS.MAX_TURNS) {
    return fail(`At most ${LIMITS.MAX_TURNS} turns are accepted`)
  }

  const out = []
  let total = 0
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]
    if (!isPlainObject(m)) return fail(`Turn ${i} must be an object`)
    const mKeys = Object.keys(m).sort()
    if (mKeys.length !== 2 || mKeys[0] !== 'role' || mKeys[1] !== 'text') {
      return fail(`Turn ${i} must have exactly "role" and "text"`)
    }
    if (!ROLES.has(m.role)) return fail(`Turn ${i} has an unknown role`)
    const expected = i % 2 === 0 ? 'user' : 'model'
    if (m.role !== expected) return fail('Turns must alternate, starting with the user')
    if (typeof m.text !== 'string') return fail(`Turn ${i} text must be a string`)
    const text = m.text.trim()
    if (!text) return fail(`Turn ${i} text is empty`)
    const cap = m.role === 'user' ? LIMITS.MAX_USER_CHARS : LIMITS.MAX_MODEL_CHARS
    if (text.length > cap) return fail(`Turn ${i} is longer than ${cap} characters`)
    total += text.length
    if (total > LIMITS.MAX_TOTAL_CHARS) {
      return fail(`Conversation is longer than ${LIMITS.MAX_TOTAL_CHARS} characters`)
    }
    out.push({ role: m.role, text })
  }
  if (out[out.length - 1].role !== 'user') return fail('The last turn must be from the user')
  return { ok: true, messages: out }
}

function fail(error) {
  return { ok: false, error }
}
