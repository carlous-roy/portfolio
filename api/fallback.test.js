import { describe, it, expect } from 'vitest'
import { ANSWERS, fallbackReply, pickTopic } from './fallback.js'
import { CONTACT_EMAIL } from './knowledge.js'

// The questions the dialog suggests, and the follow-ups it offers, each with
// the topic a visitor would expect. Keep this list in step with
// src/components/AIChatbot.jsx.
const SUGGESTED = [
  ["Tell me about Roy's work experience", 'work'],
  ['What projects has Roy built?', 'projects'],
  ["What's Roy's tech stack?", 'skills'],
  ['Who is Roy and what does he do?', 'about'],
  ["What was Roy's role?", 'work'],
  ['What technologies did he use at work?', 'skills'],
  ['How long did he work there?', 'work'],
  ['How does DiffLens work?', 'difflens'],
  ['What is CodeAtlas?', 'codeatlas'],
  ['Where can I see his code?', 'projects'],
  ['What languages does Roy know?', 'skills'],
  ['What frameworks does he use?', 'skills'],
  ['Does he know cloud technologies?', 'skills'],
  ['What camera does Roy use?', 'hobbies'],
  ['What sports does he follow?', 'hobbies'],
  ['What movies does he like?', 'hobbies'],
  ['What did he study?', 'education'],
  ['When did he graduate?', 'education'],
  ['What was his undergrad?', 'education'],
  ["What's his LinkedIn?", 'contact'],
  ["What's his GitHub?", 'contact'],
  ['Where is he based?', 'contact'],
  ['Tell me about his experience', 'work'],
  ['What are his hobbies?', 'hobbies'],
  ['How to contact Roy?', 'contact'],
]

describe('pickTopic', () => {
  it('maps every suggested and follow-up question to the topic a visitor expects', () => {
    for (const [question, topic] of SUGGESTED) {
      expect(pickTopic(question), question).toBe(topic)
    }
  })

  it('prefers the specific topic when a project is named', () => {
    expect(pickTopic('Tell me about TaskForge')).toBe('taskforge')
    expect(pickTopic('how does the gesture project avoid flicker')).toBe('gesturecontrol')
    expect(pickTopic('Is DiffLens based on an existing tool?')).toBe('difflens')
  })

  it('keeps personal and compensation questions for Roy himself', () => {
    expect(pickTopic('What salary does he expect?')).toBe('personal')
    expect(pickTopic('Can he work in the US?')).toBe('personal')
    expect(pickTopic('Is he married?')).toBe('personal')
  })

  it('answers availability and greeting questions in kind', () => {
    expect(pickTopic('Is Roy open to relocation?')).toBe('availability')
    expect(pickTopic('What job is he looking for?')).toBe('availability')
    expect(pickTopic('hi')).toBe('greeting')
    expect(pickTopic('Thanks!')).toBe('thanks')
    expect(pickTopic('Are you an AI?')).toBe('site')
  })

  it('falls back to the menu of topics when nothing matches', () => {
    expect(pickTopic('what is the weather today')).toBe('default')
    expect(pickTopic('')).toBe('default')
    expect(pickTopic(undefined)).toBe('default')
  })

  it('ignores case and curly apostrophes', () => {
    expect(pickTopic('WHAT’S HIS LINKEDIN?')).toBe('contact')
  })
})

describe('fallbackReply', () => {
  it('returns the answer for the chosen topic', () => {
    const { topic, reply } = fallbackReply('What projects has Roy built?')
    expect(topic).toBe('projects')
    expect(reply).toBe(ANSWERS.projects)
  })

  it('writes every answer as plain text with no phone number and no Markdown', () => {
    for (const [topic, text] of Object.entries(ANSWERS)) {
      expect(text, topic).not.toMatch(/\*\*|`|^#|__|^\s*[-*] /m)
      expect(text, topic).not.toMatch(/\d{3}[ .-]\d{3}[ .-]\d{4}/)
      expect(text, topic).not.toMatch(/—/)
      expect(text.length, topic).toBeLessThan(1200)
    }
    expect(ANSWERS.default).toContain(CONTACT_EMAIL)
    expect(ANSWERS.contact).toContain(CONTACT_EMAIL)
  })
})
