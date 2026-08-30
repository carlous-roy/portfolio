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
ask about projects and you get project context, ask about hobbies and you do not. The model call
runs through a serverless function rather than from the browser, which is what keeps the API key
off the client; around that sit key failover, request bounds, and an in-memory cache for repeated
questions.

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
api/
└── chat.js                     # Serverless proxy; holds the Gemini key server-side
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
├── skill-icons/                # Tool logos used by the Skills grid
├── case-studies/
│   └── codeatlas.html          # Standalone case study, linked from Projects
└── favicon.png
```

## Getting Started

```bash
git clone https://github.com/carlous-roy/portfolio.git
cd portfolio
npm install
cp .env.example .env            # add GEMINI_API_KEY
vercel dev                      # → http://localhost:3000, serves /api/chat too
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Gemini API key, read server-side by `/api/chat` |
| `GEMINI_API_KEY_2` | Optional | Second key, tried when the first returns a quota error |

Neither is `VITE_`-prefixed, deliberately: Vite inlines `VITE_` variables into the client
bundle, which would publish the key.

Free keys: [Google AI Studio](https://aistudio.google.com/app/apikey)

## Deployment

### Vercel

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`
3. Add `GEMINI_API_KEY` (and optionally `GEMINI_API_KEY_2`) in Settings → Environment Variables
4. Deploy, subsequent pushes to `main` auto-deploy

### Custom Domain

**Vercel:** Settings → Domains → `roycarlous.com`

**Namecheap DNS:**

| Type | Host | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

## Assistant architecture

```
browser ──POST /api/chat──► serverless function ──x-goog-api-key──► Gemini
   │                              │
   │  system prompt +             │  key from process.env, never serialised
   │  conversation turns          │  per-instance rate limit, payload bounds
   └──◄── completion ─────────────┘  falls through to a second key on 429
```

The browser sends the system prompt and the conversation; the function attaches
credentials and forwards. Two consequences worth naming: the key is never present in
anything the client can read, and the request size a caller can push through that key is
bounded server-side rather than by client code they control.

Context selection happens client-side because it is not security-sensitive — it decides
which biography blocks ride along with a question, and sending the wrong ones costs
tokens, not safety.

## Security

**The Gemini key is server-side.** It is read from `process.env` inside `api/chat.js` at
request time and never enters the client bundle. This is the reason the call is proxied at
all: Vite inlines any `VITE_`-prefixed variable into the deployed JavaScript at build time,
so a browser-side key would be readable by anyone who opened devtools.

- `.env` is gitignored and no key has been committed; verified against full history
- Keys are scoped to the Generative Language API and carry a spend cap
- The function bounds conversation length and payload size, so the request a caller can
  push through the key is limited server-side
- A second key is tried on quota errors, so an exhausted quota degrades rather than fails
- Upstream error detail stays on the server; the client receives a status, not a body

## License

MIT, Roy Carlous Christudass
