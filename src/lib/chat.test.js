import { describe, it, expect, vi } from 'vitest'
import {
  buildRequestMessages,
  conversationKey,
  createCache,
  createThrottle,
  sendChat,
  ChatError,
  messageForError,
} from './chat.js'
import { LIMITS, validateChatBody } from '../../api/validate.js'

const u = (content) => ({ role: 'user', content })
const a = (content, error = false) => ({ role: 'assistant', content, error })

describe('buildRequestMessages', () => {
  it('sends only the current question when there is no history', () => {
    expect(buildRequestMessages([], '  Who is Roy? ')).toEqual([
      { role: 'user', text: 'Who is Roy?' },
    ])
  })

  it('replays completed exchanges as alternating user/model turns', () => {
    const history = [u('Hi'), a('Hello.'), u('Projects?'), a('Four of them.')]
    expect(buildRequestMessages(history, 'Tell me more')).toEqual([
      { role: 'user', text: 'Hi' },
      { role: 'model', text: 'Hello.' },
      { role: 'user', text: 'Projects?' },
      { role: 'model', text: 'Four of them.' },
      { role: 'user', text: 'Tell me more' },
    ])
  })

  it('drops error bubbles and the questions that produced them', () => {
    const history = [
      u('Hi'),
      a('Hello.'),
      u('Broken?'),
      a('The assistant is unavailable right now.', true),
      u('Still there?'),
      a('Yes.'),
    ]
    const out = buildRequestMessages(history, 'Ok')
    expect(out.map((m) => m.text)).toEqual(['Hi', 'Hello.', 'Still there?', 'Yes.', 'Ok'])
    expect(validateChatBody({ messages: out }).ok).toBe(true)
  })

  it('ignores a trailing unanswered question', () => {
    const history = [u('Hi'), a('Hello.'), u('pending')]
    expect(buildRequestMessages(history, 'next').map((m) => m.text)).toEqual([
      'Hi',
      'Hello.',
      'next',
    ])
  })

  it('keeps the request inside the server limits by dropping the oldest exchanges', () => {
    const history = []
    for (let i = 0; i < 40; i++) {
      history.push(u(`q${i} ` + 'x'.repeat(LIMITS.MAX_USER_CHARS)))
      history.push(a(`a${i} ` + 'y'.repeat(LIMITS.MAX_MODEL_CHARS)))
    }
    const out = buildRequestMessages(history, 'last')
    expect(out.length).toBeLessThanOrEqual(LIMITS.MAX_TURNS)
    expect(out[out.length - 1]).toEqual({ role: 'user', text: 'last' })
    expect(out[0].text.startsWith('q3')).toBe(true)
    const result = validateChatBody({ messages: out })
    expect(result.ok).toBe(true)
  })

  it('truncates over-long turns so the server accepts them', () => {
    const history = [u('short'), a('z'.repeat(LIMITS.MAX_MODEL_CHARS + 500))]
    const out = buildRequestMessages(history, 'w'.repeat(LIMITS.MAX_USER_CHARS + 5))
    expect(out[1].text.length).toBe(LIMITS.MAX_MODEL_CHARS)
    expect(out[2].text.length).toBe(LIMITS.MAX_USER_CHARS)
    expect(validateChatBody({ messages: out }).ok).toBe(true)
  })
})

describe('conversationKey and createCache', () => {
  it('differs when the preceding conversation differs', () => {
    const k1 = conversationKey(
      buildRequestMessages([u('How does DiffLens work?'), a('AST.')], 'Tell me more')
    )
    const k2 = conversationKey(
      buildRequestMessages([u('What is CodeAtlas?'), a('Search.')], 'Tell me more')
    )
    expect(k1).not.toBe(k2)
    expect(conversationKey(buildRequestMessages([], 'Hi'))).toBe(
      conversationKey(buildRequestMessages([], 'hi '))
    )
  })

  it('evicts the least recently used entry past the cap', () => {
    const c = createCache(2)
    c.set('a', 1)
    c.set('b', 2)
    c.get('a')
    c.set('c', 3)
    expect(c.get('b')).toBeUndefined()
    expect(c.get('a')).toBe(1)
    expect(c.size()).toBe(2)
  })
})

describe('createThrottle', () => {
  it('allows max sends per window', () => {
    let t = 0
    const th = createThrottle({ windowMs: 100, max: 2, now: () => t })
    expect(th.allow()).toBe(true)
    expect(th.allow()).toBe(true)
    expect(th.allow()).toBe(false)
    t = 101
    expect(th.allow()).toBe(true)
  })
})

describe('sendChat', () => {
  const ok = (payload, status = 200) => ({ ok: status < 300, status, json: async () => payload })

  it('posts { messages } and returns the reply', async () => {
    const fetchFn = vi.fn(async () => ok({ reply: '  Roy builds things. ' }))
    const messages = [{ role: 'user', text: 'Hi' }]
    await expect(sendChat(messages, { fetchFn })).resolves.toBe('Roy builds things.')
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('/api/chat')
    expect(JSON.parse(init.body)).toEqual({ messages })
    expect(Object.keys(JSON.parse(init.body))).toEqual(['messages'])
  })

  it('maps server codes to client error codes', async () => {
    const cases = [
      [ok({ error: 'x', code: 'rate_limited' }, 429), 'rate_limited'],
      [ok({ error: 'x' }, 504), 'timeout'],
      [ok({ error: 'x' }, 502), 'unavailable'],
      [ok({ error: 'x' }, 403), 'unavailable'],
      [ok({}, 200), 'unavailable'],
    ]
    for (const [response, code] of cases) {
      const fetchFn = vi.fn(async () => response)
      await expect(sendChat([{ role: 'user', text: 'Hi' }], { fetchFn })).rejects.toMatchObject({
        name: 'ChatError',
        code,
      })
    }
  })

  it('reports a network failure as unavailable and an abort as timeout', async () => {
    await expect(
      sendChat([], { fetchFn: vi.fn(async () => Promise.reject(new TypeError('offline'))) })
    ).rejects.toMatchObject({ code: 'unavailable' })
    const abort = new Error('aborted')
    abort.name = 'AbortError'
    await expect(
      sendChat([], { fetchFn: vi.fn(async () => Promise.reject(abort)) })
    ).rejects.toMatchObject({ code: 'timeout' })
  })

  it('aborts the request after the timeout', async () => {
    vi.useFakeTimers()
    const fetchFn = vi.fn(
      (url, init) =>
        new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new Error('aborted')
            err.name = 'AbortError'
            reject(err)
          })
        })
    )
    const p = sendChat([], { fetchFn, timeoutMs: 50 })
    const assertion = expect(p).rejects.toBeInstanceOf(ChatError)
    await vi.advanceTimersByTimeAsync(60)
    await assertion
    vi.useRealTimers()
  })
})

describe('messageForError', () => {
  it('names the email in every sentence and never says the assistant is unconfigured', () => {
    for (const code of ['rate_limited', 'timeout', 'anything']) {
      expect(messageForError(code)).toContain('roy4edu@gmail.com')
      expect(messageForError(code)).not.toMatch(/not set up|not configured/)
    }
    expect(messageForError('rate_limited')).toMatch(/lot of questions/)
    expect(messageForError('timeout')).toMatch(/too long/)
  })
})
