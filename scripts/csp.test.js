// The Content-Security-Policy in vercel.json allows the two inline blocks in
// index.html (the theme bootstrap script and the first-paint style) by hash.
// Vite copies both into the build untouched, so hashing the source is enough.
// If either block changes, this test fails until the hash is updated.
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const html = readFileSync(join(root, 'index.html'), 'utf8')
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))

const sha = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`

function inlineBlocks(tag) {
  const re = new RegExp(`<${tag}(?![^>]*\\bsrc=)([^>]*)>([\\s\\S]*?)</${tag}>`, 'g')
  const out = []
  for (const m of html.matchAll(re)) {
    if (m[1].includes('ld+json')) continue // a data block, never executed
    out.push(m[2])
  }
  return out
}

const csp = vercel.headers
  .find((h) => h.source === '/((?!case-studies/).*)')
  .headers.find((h) => h.key === 'Content-Security-Policy').value

describe('Content-Security-Policy', () => {
  it('lists the hash of every inline script in index.html', () => {
    const scripts = inlineBlocks('script')
    expect(scripts.length).toBeGreaterThan(0)
    const directive = csp.split(';').find((d) => d.trim().startsWith('script-src'))
    for (const s of scripts) expect(directive).toContain(sha(s))
    expect(directive).not.toContain('unsafe-inline')
  })

  it('lists the hash of every inline style in index.html', () => {
    const styles = inlineBlocks('style')
    expect(styles.length).toBeGreaterThan(0)
    const directive = csp.split(';').find((d) => d.trim().startsWith('style-src'))
    for (const s of styles) expect(directive).toContain(sha(s))
    expect(directive).not.toContain('unsafe-inline')
  })

  it('has no inline style attributes outside the React root', () => {
    const outsideRoot = html.replace(/<div id="root"><\/div>/, '')
    expect(outsideRoot).not.toMatch(/<(?!script|style)[a-z]+[^>]*\sstyle=/)
  })

  it('redirects www to the apex with a permanent code', () => {
    const r = vercel.redirects[0]
    expect(r.has[0].value).toBe('www.roycarlous.com')
    expect(r.destination).toBe('https://roycarlous.com/:path*')
    expect(r.permanent).toBe(true)
  })
})
