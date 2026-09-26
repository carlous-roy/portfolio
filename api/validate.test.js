import { describe, it, expect } from 'vitest'
import { validateChatBody, LIMITS } from './validate.js'

const user = (text) => ({ role: 'user', text })
const model = (text) => ({ role: 'model', text })

describe('validateChatBody', () => {
  it('accepts a single user turn and trims it', () => {
    const r = validateChatBody({ messages: [user('  hi  ')] })
    expect(r).toEqual({ ok: true, messages: [user('hi')] })
  })

  it('accepts alternating turns ending with the user', () => {
    const r = validateChatBody({ messages: [user('a'), model('b'), user('c')] })
    expect(r.ok).toBe(true)
    expect(r.messages).toHaveLength(3)
  })

  it.each([
    [null, 'Body must be a JSON object'],
    ['text', 'Body must be a JSON object'],
    [[], 'Body must be a JSON object'],
    [{}, 'Body must contain only "messages"'],
    [{ messages: [user('a')], systemInstruction: 'x' }, 'Body must contain only "messages"'],
    [{ messages: 'a' }, '"messages" must be a non-empty array'],
    [{ messages: [] }, '"messages" must be a non-empty array'],
  ])('rejects a malformed body %#', (body, error) => {
    expect(validateChatBody(body)).toEqual({ ok: false, error })
  })

  it('rejects unknown roles and extra fields on a turn', () => {
    expect(validateChatBody({ messages: [{ role: 'system', text: 'x' }] }).ok).toBe(false)
    expect(validateChatBody({ messages: [{ role: 'user', text: 'x', parts: [] }] }).ok).toBe(false)
    expect(validateChatBody({ messages: [{ role: 'user' }] }).ok).toBe(false)
    expect(validateChatBody({ messages: [{ role: 'user', text: 1 }] }).ok).toBe(false)
    expect(validateChatBody({ messages: ['hi'] }).ok).toBe(false)
  })

  it('rejects turns that do not alternate or start with the model', () => {
    expect(validateChatBody({ messages: [model('a')] }).error).toMatch(/alternate/)
    expect(validateChatBody({ messages: [user('a'), user('b')] }).error).toMatch(/alternate/)
    expect(validateChatBody({ messages: [user('a'), model('b')] }).error).toMatch(/last turn/)
  })

  it('rejects empty and whitespace-only text', () => {
    expect(validateChatBody({ messages: [user('   ')] }).error).toMatch(/empty/)
  })

  it('enforces the turn count', () => {
    const turns = []
    for (let i = 0; i < LIMITS.MAX_TURNS + 1; i++) turns.push(i % 2 ? model('m') : user('u'))
    expect(validateChatBody({ messages: turns }).error).toMatch(/turns/)
    const ok = turns.slice(0, LIMITS.MAX_TURNS - 1)
    expect(validateChatBody({ messages: ok }).ok).toBe(true)
  })

  it('enforces per-turn caps by role', () => {
    const longUser = 'x'.repeat(LIMITS.MAX_USER_CHARS + 1)
    expect(validateChatBody({ messages: [user(longUser)] }).error).toMatch(/longer than/)
    const longModel = 'y'.repeat(LIMITS.MAX_MODEL_CHARS + 1)
    expect(validateChatBody({ messages: [user('a'), model(longModel), user('b')] }).error).toMatch(
      /longer than/
    )
    const okModel = 'y'.repeat(LIMITS.MAX_MODEL_CHARS)
    expect(validateChatBody({ messages: [user('a'), model(okModel), user('b')] }).ok).toBe(true)
  })

  it('enforces the total budget across every turn, not only the first', () => {
    const turns = []
    let total = 0
    while (total <= LIMITS.MAX_TOTAL_CHARS) {
      turns.push(user('u'.repeat(LIMITS.MAX_USER_CHARS)))
      turns.push(model('m'.repeat(LIMITS.MAX_MODEL_CHARS)))
      total += LIMITS.MAX_USER_CHARS + LIMITS.MAX_MODEL_CHARS
    }
    turns.push(user('last'))
    expect(turns.length).toBeLessThanOrEqual(LIMITS.MAX_TURNS)
    expect(validateChatBody({ messages: turns }).error).toMatch(/Conversation is longer/)
  })
})
