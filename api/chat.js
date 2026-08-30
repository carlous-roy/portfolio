// Server-side proxy for the Gemini call.
//
// The key lives in GEMINI_API_KEY / GEMINI_API_KEY_2, which are read here at
// request time and never reach the client. Vite inlines any VITE_-prefixed
// variable into the browser bundle at build time, so a key supplied that way
// would be readable by anyone who opened devtools; routing the call through a
// function is what keeps it out of the bundle.
//
// Runs on Vercel's Node runtime as /api/chat.

const MODEL = 'gemini-3.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// Per-instance sliding window. Serverless instances are not shared, so this is
// a cost guard rather than a security control: it blunts a single caller
// hammering one warm instance. The spend cap on the key is the real limit.
const WINDOW_MS = 5 * 60 * 1000
const MAX_PER_WINDOW = 20
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return true
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k)
  }
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean)
  if (!keys.length) return res.status(503).json({ error: 'Assistant is not configured' })

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many requests' })

  const { systemInstruction, contents } = req.body || {}
  if (typeof systemInstruction !== 'string' || !Array.isArray(contents) || !contents.length) {
    return res.status(400).json({ error: 'Malformed request' })
  }
  // Bound what a caller can push through the key.
  const chars = contents.reduce((n, c) => n + (c?.parts?.[0]?.text?.length || 0), 0)
  if (contents.length > 40 || chars > 20000) {
    return res.status(413).json({ error: 'Conversation too long' })
  }

  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      // Thinking tokens are drawn from maxOutputTokens; too small a budget and
      // the model spends it reasoning and the answer arrives truncated.
      maxOutputTokens: 800,
      thinkingConfig: { thinkingLevel: 'low' },
    },
  }

  // Try each key in turn so one exhausted quota does not take the assistant down.
  let lastStatus = 502
  for (const key of keys) {
    try {
      const upstream = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(payload),
      })
      if (upstream.ok) {
        res.setHeader('Cache-Control', 'no-store')
        return res.status(200).json(await upstream.json())
      }
      lastStatus = upstream.status
      // 4xx other than quota exhaustion will fail the same way on the next key.
      if (upstream.status !== 429 && upstream.status < 500) break
    } catch {
      lastStatus = 502
    }
  }
  // Upstream detail stays server-side; the client gets a status it can act on.
  return res.status(lastStatus === 429 ? 429 : 502).json({ error: 'Assistant is unavailable' })
}
