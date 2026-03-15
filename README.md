# roycarlous.com

Personal portfolio website for **Roy Carlous Christudass** — Software Engineer.

**Live:** [roycarlous.com](https://roycarlous.com)

---

## Overview

A single-page portfolio built with React 18 and Vite, featuring a cinematic intro animation, AI chatbot powered by Google Gemini 2.0 Flash, dark/light theming, multilingual greetings, and scroll-driven reveal animations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18, Vite 6 |
| Styling | Tailwind CSS 3 |
| AI Chatbot | Google Gemini 2.0 Flash API |
| Deployment | Vercel |
| Contact | Formspree |

## Architecture

```
src/
├── App.jsx                     # Root — sections, navigation, theme
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
4. Deploy — subsequent pushes to `main` auto-deploy

### Custom Domain

**Vercel:** Settings → Domains → `roycarlous.com`

**Namecheap DNS:**

| Type | Host | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

## Security

- `.env` is gitignored and never committed
- API keys stored as Vercel environment variables in production
- Dual-key rotation with automatic failover on API errors
- Client-side rate limiting: 15 requests / 5 minutes
- In-memory response caching for duplicate queries

## License

MIT — Roy Carlous Christudass
