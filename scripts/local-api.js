// Vite plugin that mounts the Vercel function in api/chat.js on the dev and
// preview servers, so `npm run dev` and `npm run preview` serve /api/chat without
// the Vercel CLI. It mimics the small part of Vercel's Node request/response
// surface the handler uses: a parsed `req.body`, `res.status()`, `res.json()` and
// `res.setHeader()`.
import { readFileSync } from 'node:fs'
import { loadEnv } from 'vite'

const ROUTE = '/api/chat'
const MAX_BODY_BYTES = 64 * 1024

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function wrapResponse(res) {
  let statusCode = 200
  return {
    setHeader: (name, value) => res.setHeader(name, value),
    status(code) {
      statusCode = code
      return this
    },
    json(payload) {
      res.statusCode = statusCode
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(payload))
    },
    send(payload) {
      res.statusCode = statusCode
      res.end(payload)
    },
  }
}

async function handle(req, res, next) {
  if (!req.url || req.url.split('?')[0] !== ROUTE) return next()
  let raw = ''
  try {
    raw = await readBody(req)
  } catch (err) {
    res.statusCode = 413
    res.end(JSON.stringify({ error: err.message }))
    return
  }
  // Vercel parses JSON bodies ahead of the handler and throws on access when the
  // JSON is invalid; the handler is written to survive that, so mirror it here.
  let parsed
  let parseError = null
  const contentType = String(req.headers['content-type'] || '')
  if (raw && contentType.includes('application/json')) {
    try {
      parsed = JSON.parse(raw)
    } catch (err) {
      parseError = err
    }
  }
  Object.defineProperty(req, 'body', {
    configurable: true,
    get() {
      if (parseError) throw parseError
      return parsed
    },
  })
  const { default: handler } = await import('../api/chat.js')
  await handler(req, wrapResponse(res))
}

// The preview server also applies the response headers from vercel.json, so
// the Content-Security-Policy can be checked against the built site locally.
// Vercel matches `source` with path-to-regexp; the patterns used here are plain
// enough to be read as regular expressions directly.
function vercelHeaders(root) {
  let rules = []
  try {
    const json = JSON.parse(readFileSync(`${root}/vercel.json`, 'utf8'))
    rules = (json.headers || []).map((h) => ({
      test: new RegExp(`^${h.source.replace(/\(\.\*\)/g, '(.*)')}$`),
      headers: h.headers,
    }))
  } catch {
    rules = []
  }
  return (req, res, next) => {
    const path = (req.url || '/').split('?')[0]
    for (const rule of rules) {
      if (!rule.test.test(path)) continue
      for (const { key, value } of rule.headers) res.setHeader(key, value)
    }
    next()
  }
}

export function localApi() {
  let env = {}
  let root = process.cwd()
  return {
    name: 'local-api',
    configResolved(config) {
      root = config.root
      env = loadEnv(config.mode, config.root, '')
      for (const [key, value] of Object.entries(env)) {
        if (!(key in process.env)) process.env[key] = value
      }
    },
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(vercelHeaders(root))
      server.middlewares.use(handle)
    },
  }
}
