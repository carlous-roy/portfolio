# roycarlous.com

<p>
  <a href="https://roycarlous.com"><img src="https://img.shields.io/badge/Live-roycarlous.com-22C55E?style=flat-square&logo=vercel&logoColor=white" alt="Live" /></a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 3" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" alt="Gemini" />
</p>

My portfolio site.

A single-page React app with a canvas intro animation, a particle background, dark and light themes,
role-filtered project views with `?role=` deep links, and an AI assistant built on Gemini that
answers questions about my work.

The assistant is the part with the most going on. Sending a full biography with every message is
slow and expensive, so query keywords select which context blocks get appended to the system prompt:
ask about projects and you get project context, ask about hobbies and you do not. Around that sits
key rotation with failover, client-side rate limiting at 15 requests per 5 minutes, and an in-memory
cache for repeated questions.

Several bugs in this repo were invisible for the same reason, which is worth reading if you write
error handlers. See [Things that broke](#things-that-broke) below.

[Live](https://roycarlous.com) · [Case study: CodeAtlas](https://roycarlous.com/case-studies/codeatlas.html)

---

## Overview

One page, seven sections. A canvas intro animation driven by a phase state machine, a real-time
particle background, rotating greetings in nine languages, cycling profile photography (mine, shot
on a Sony A7 V), a contact form, and the Gemini assistant.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18, Vite 6 |
| Styling | Tailwind CSS 3 |
| AI Chatbot | Google Gemini 3.5 Flash API |
| Deployment | Vercel |
| Contact | Formspree |

## Architecture

```
src/
├── App.jsx                     # Root, sections, navigation, theme
├── main.jsx                    # React DOM entry
├── components/
│   ├── AIChatbot.jsx           # Gemini chatbot with persona + suggestions
│   └── IntroAnimation.jsx      # Multi-phase cinematic splash screen
├── styles/
│   └── index.css               # Tailwind directives, keyframes, globals
public/
├── rc-logo-white.png           # Logo mask source
├── roy-default.jpg             # Default profile photo
├── roy.jpg, roy-casual.jpg     # Cycling profile photos
├── Roy_Resume.pdf              # Downloadable resume
├── case-studies/
│   └── codeatlas.html              # Standalone case study, linked from Projects
└── favicon.png
```

## Getting Started

```bash
git clone https://github.com/carlous-roy/portfolio.git
cd portfolio
npm install
cp .env.example .env            # Add Gemini API keys
npm run dev                     # → http://localhost:5173
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_KEY_1` | Yes | Primary Gemini API key |
| `VITE_GEMINI_KEY_2` | Recommended | Fallback key for rotation |

Free keys: [Google AI Studio](https://aistudio.google.com/app/apikey)

## Deployment

### Vercel

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`
3. Add `VITE_GEMINI_KEY_1` and `VITE_GEMINI_KEY_2` in Settings → Environment Variables
4. Deploy, subsequent pushes to `main` auto-deploy

### Custom Domain

**Vercel:** Settings → Domains → `roycarlous.com`

**Namecheap DNS:**

| Type | Host | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

## Things that broke

Recorded here on purpose. Each of these was invisible because an error was thrown and then
discarded.

**Four stray backticks in `AIChatbot.jsx`.** They should have been double quotes. The first one
closed the `SYSTEM_PROMPT` template literal about 200 characters in, so everything after it, the
whole bio, work history and project descriptions, silently stopped being string content and the
file no longer parsed.

**A model that had been shut down.** The code still called `gemini-2.0-flash`, deprecated in
February 2026 and killed on 1 June. The chatbot had been dead for ten weeks and nobody noticed,
because the handler was `catch { }` with no binding and the user saw a vague "Connection issue".

**Thinking tokens eating the output budget.** Gemini 3.x reasons before answering and draws those
tokens from `maxOutputTokens`. At 300 the model spent the entire budget thinking and replies came
back truncated mid-sentence. Now 800, with `thinkingLevel: 'low'`.

**MediaPipe never loading in production.** `@mediapipe/hands` and `camera_utils` ship UMD bundles
that assign to `window` instead of exporting ES named bindings, so Vite's production build resolved
`const { Hands } = await import(...)` to `undefined` and `new Hands(...)` threw. The gesture demo
had been broken for every visitor since March. The camera error handler named only
`NotAllowedError` and swallowed everything else into "check your camera access", which sent me
hunting hardware for a bundling bug.

Both handlers now log the actual error type and message. That change is what surfaced the last
three.

## Security

**The Gemini key in this build is public, by construction.** Vite inlines any
`VITE_`-prefixed variable into the client bundle at build time, so a key supplied that
way is embedded in the deployed JavaScript and readable by anyone who opens devtools.
Storing it as a Vercel environment variable protects the repository, not the browser.
An earlier pair of keys was exposed exactly this way and has been revoked; a
full-history scan of the repo found no secret in any commit, because the leak lived
only in the build output.

What that means in practice, and what is actually done about it:

- `.env` is gitignored and no key has ever been committed, verified against full history
- The keys in use are **restricted to the Gemini API** and carry a spend cap, so the
  blast radius of exposure is a quota, not an account
- Dual-key rotation with automatic failover on API errors
- Client-side rate limiting (15 requests / 5 minutes) and in-memory response caching , 
  these reduce cost and abuse, but they are client-side and therefore advisory
- **The real fix is a server-side route handler** so the key never reaches the browser.
  That is the first task of the Next.js rebuild, and until it ships this section stays
  as written rather than implying a safety the build does not have.

## License

MIT, Roy Carlous Christudass
