import { describe, it, expect } from 'vitest'
import { getCtx, buildSystemInstruction, SYSTEM_PROMPT, CTX, FORMAT_RULES } from './knowledge.js'

describe('getCtx', () => {
  it('returns nothing when no keyword matches', () => {
    expect(getCtx('hello there')).toBe('')
    expect(getCtx('')).toBe('')
    expect(getCtx(undefined)).toBe('')
  })

  it('selects blocks by keyword, case-insensitively, in a fixed order', () => {
    const ctx = getCtx('What SKILLS did he use at Teradyne?')
    expect(ctx.startsWith('\n\nContext:\n')).toBe(true)
    const work = ctx.indexOf(CTX.work)
    const skills = ctx.indexOf(CTX.skills)
    expect(work).toBeGreaterThan(-1)
    expect(skills).toBeGreaterThan(work)
    expect(ctx).not.toContain(CTX.hobbies)
  })

  it('matches each block on a representative question', () => {
    expect(getCtx('Where did he go to university?')).toContain(CTX.education)
    expect(getCtx('Tell me about CodeAtlas')).toContain(CTX.projects)
    expect(getCtx('Does he do photography?')).toContain(CTX.hobbies)
    expect(getCtx('How do I reach him?')).toContain(CTX.contact)
  })
})

describe('buildSystemInstruction', () => {
  it('is the biography, the matched context and the format rules', () => {
    const s = buildSystemInstruction('What projects has he built?')
    expect(s.startsWith(SYSTEM_PROMPT)).toBe(true)
    expect(s).toContain(CTX.projects)
    expect(s.endsWith(FORMAT_RULES)).toBe(true)
  })

  it('never describes the site with the phrase "prompt injection"', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).not.toContain('prompt injection')
  })
})
