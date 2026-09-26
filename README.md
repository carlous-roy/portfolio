# roycarlous.com

My portfolio site: a single-page React app with an assistant that answers questions about my work,
served through a small serverless route that holds the Gemini key.

[Live](https://roycarlous.com) · [Case study: CodeAtlas](https://roycarlous.com/case-studies/codeatlas.html)

## What is on the page

One page, seven sections: hero, about, skills, experience, projects, education and contact. A short
intro sequence plays once per browser session and can be skipped; it does not play at all when the
OS asks for reduced motion. Greetings cycle through nine languages, the profile photos rotate, and a
canvas draws drifting dots behind the page while the tab is visible and the visitor is active. Dark
and light themes follow the OS preference, and a toggle pins a choice. Project cards can be filtered
by role, and `?role=ml` style links open the page at that view.

The assistant sits in a native `<dialog>`. It sends the conversation to `/api/chat`, which builds the
prompt on the server and calls Gemini.

## Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Framework | React 18, Vite 6                                        |
| Styling   | Tailwind CSS 3 over CSS variables (theme tokens)        |
| Assistant | Google Gemini (`gemini-3.5-flash`) behind `/api/chat`   |
| Hosting   | Vercel (static site plus one Node function)             |
| Contact   | Formspree                                               |
| Tooling   | ESLint (react, react-hooks, jsx-a11y), Prettier, Vitest |
| CI        | GitHub Actions: lint, format check, tests, build        |

## Layout

```
api/
├── chat.js          # The route: origin check, rate limit, validation, Gemini call, failover
├── knowledge.js     # System prompt and context blocks (server side only)
├── validate.js      # Request schema and size limits
└── ratelimit.js     # Per-instance sliding window
src/
├── App.jsx          # Root: theme, intro gate, layout, dialog
├── content/         # Site data as plain modules; edit copy here
├── icons/           # Inline SVG icons and the masked logo
├── sections/        # One component per section
├── components/      # Nav, intro, assistant dialog, hero photo, particles, reveal
├── hooks/           # useTheme, useReducedMotion, useActiveSection
├── lib/chat.js      # Request builder, per-conversation cache, throttle, fetch
└── styles/index.css # Theme tokens, focus styles, reduced-motion rules, keyframes
scripts/
├── local-api.js     # Vite plugin that mounts api/chat.js on the dev and preview servers
└── csp.test.js      # Keeps the CSP hashes in vercel.json in step with index.html
public/              # Photos, resume, skill icons, case study, robots.txt, sitemap.xml
vercel.json          # Redirect www to apex, security headers, cache headers
```

## Running it

```bash
npm install
cp .env.example .env      # optional: add GEMINI_API_KEY to try the assistant
npm run dev               # http://localhost:5173, /api/chat included
```

`npm run dev` serves the assistant route through a small Vite plugin, so the Vercel CLI is not
needed. Without a key the route answers `503` and the dialog says the assistant is not set up.
Restart the dev server after editing files under `api/`.

Other scripts: `npm run lint`, `npm run format`, `npm test`, `npm run build`, `npm run preview`.

### Environment variables

| Variable           | Required | Description                                             |
| ------------------ | -------- | ------------------------------------------------------- |
| `GEMINI_API_KEY`   | Yes      | Gemini API key, read by `/api/chat` at request time     |
| `GEMINI_API_KEY_2` | Optional | Second key, tried when the first returns a quota or 5xx |

Neither is `VITE_`-prefixed, deliberately: Vite inlines `VITE_` variables into the client bundle,
which would publish the key. Keys are read from `process.env` inside the function per request and
never appear in the build.

## Deployment

1. Import the repository at [vercel.com/new](https://vercel.com/new). Framework: Vite, build
   `npm run build`, output `dist`.
2. Add `GEMINI_API_KEY` (and optionally `GEMINI_API_KEY_2`) under Settings → Environment Variables
   for Production, then redeploy. Use a key that was never exposed through a `VITE_` variable.
3. Domains: `roycarlous.com` is the canonical host. In Settings → Domains make the apex the
   production domain and let `www.roycarlous.com` redirect to it. `vercel.json` also carries a
   permanent redirect from www to apex; if the dashboard still redirects apex to www the two will
   loop, so change the dashboard setting first.

DNS at Namecheap: `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`.

## The assistant route

```
browser ── POST /api/chat { messages: [{ role, text }] } ──► function ── x-goog-api-key ──► Gemini
   │                                                              │
   │   only the conversation; the prompt is not sent               │  prompt from api/knowledge.js
   └──◄── { reply } or { error, code } ───────────────────────────┘  key from process.env
```

What the function does, in order:

- Refuses anything but `POST`, and any request whose `Origin` (or `Referer`) is not
  `roycarlous.com`, the deployment's own Vercel URL, or localhost outside production. Any client can
  set that header, so this is a speed bump against casual reuse, not authentication.
- Counts requests per client address in a sliding five-minute window kept in the memory of one
  function instance (20 per window). Instances are not shared and a cold start empties the map, so
  this is a cost guard against one client looping, not a security control. The spend limit on the
  key is what bounds cost.
- Validates the body against a fixed schema: only `messages`, each turn `{ role, text }` with role
  `user` or `model`, turns alternating and ending with the user, at most 40 turns, per-turn caps
  (1,000 characters for the user, 4,000 for the model) and a 20,000-character total counted over
  every turn. Anything else is a `400`.
- Builds the system instruction from `api/knowledge.js`: the biography, plus context blocks chosen by
  keywords in the latest question, plus plain-text output rules. The whole biography goes with every
  request; the keyword selection adds detail rather than saving tokens.
- Calls Gemini with a 12-second timeout per attempt inside a 25-second budget. On a `429` or `5xx`,
  or a network error or timeout, the second key is tried. Other `4xx` responses are not retried.
  Whether a second key helps depends on it belonging to a different Google Cloud project, since
  quotas are per project.
- Logs each upstream failure as one JSON line (event, status, key index, elapsed time, a truncated
  response body) without the key or the conversation, so an outage is visible in the function logs.
- Strips Markdown markers from the reply and returns `{ reply }`. Errors return a status the client
  maps to a sentence: `503` with `code: "not_configured"` when no key is set, `429` when rate limited
  or out of quota, `504` on timeout, `502` otherwise.

On the client, `src/lib/chat.js` builds the request from completed exchanges only (a failed turn is
never replayed as something the model said), keeps a cache keyed on the whole conversation for the
life of the page, throttles to 15 sends per five minutes as a courtesy before the server's limit,
and aborts a request after 20 seconds.

Tests in `api/*.test.js` and `src/lib/chat.test.js` cover the validator, the limiter, the context
builder, the request builder and the handler against a fake upstream, including failover, timeouts
and the log lines.

## Security notes

- The key is server-side only. `.env` is gitignored; no key has been committed, checked against the
  full history.
- The system prompt lives on the server. The client cannot supply one, choose the model, or change
  the generation settings.
- `vercel.json` sets a Content-Security-Policy (self-hosted assets, the two inline blocks in
  `index.html` allowed by hash, `formspree.io` as the only form action), `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`, and marks hashed assets immutable.
- Visitor messages go to Google to generate answers; the dialog says so under the input.

## Third-party assets

Skill logos in `public/skill-icons/*.svg` come from [skillicons.dev](https://skillicons.dev)
(MIT licensed) and are served from this site. The PNG logos in the same folder are the marks of
their respective owners, used to identify the tools.

## License

The source code is under the MIT License (see `LICENSE`). The photos, the resume and third-party
logos in `public/` are not covered by it.
