import { describe, it, expect } from 'vitest'
import { createRateLimiter } from './ratelimit.js'

function clock(start = 0) {
  let t = start
  return { now: () => t, advance: (ms) => (t += ms) }
}

describe('createRateLimiter', () => {
  it('allows up to max hits in the window and blocks the next', () => {
    const c = clock()
    const rl = createRateLimiter({ windowMs: 1000, max: 3, now: c.now })
    expect(rl.hit('a')).toBe(false)
    expect(rl.hit('a')).toBe(false)
    expect(rl.hit('a')).toBe(false)
    expect(rl.hit('a')).toBe(true)
    expect(rl.hit('b')).toBe(false)
  })

  it('lets hits expire as the window slides', () => {
    const c = clock()
    const rl = createRateLimiter({ windowMs: 1000, max: 2, now: c.now })
    rl.hit('a')
    c.advance(600)
    rl.hit('a')
    expect(rl.hit('a')).toBe(true)
    c.advance(500) // first hit is now 1100 ms old
    expect(rl.hit('a')).toBe(false)
    expect(rl.hit('a')).toBe(true)
  })

  it('does not count a blocked request against the caller', () => {
    const c = clock()
    const rl = createRateLimiter({ windowMs: 1000, max: 1, now: c.now })
    rl.hit('a')
    expect(rl.hit('a')).toBe(true)
    c.advance(1001)
    expect(rl.hit('a')).toBe(false)
  })

  it('sweeps idle keys once the map grows past maxKeys', () => {
    const c = clock()
    const rl = createRateLimiter({ windowMs: 1000, max: 5, now: c.now, maxKeys: 3 })
    rl.hit('a')
    rl.hit('b')
    rl.hit('c')
    c.advance(2000)
    rl.hit('d')
    expect(rl.size()).toBe(1)
  })
})
