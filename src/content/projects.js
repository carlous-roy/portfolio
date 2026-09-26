// Projects and the role filters over them. `status` drives the badge; `link`
// is a browser demo, the live site or the case study page.

export const ROLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'backend', label: 'Backend & Distributed' },
  { id: 'ml', label: 'AI/ML' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'systems', label: 'Systems' },
]

const ROLE_IDS = new Set(ROLE_FILTERS.map((f) => f.id))

// Reads ?role= from a query string and returns a known filter id, or 'all'.
export function roleFromSearch(search) {
  try {
    const value = new URLSearchParams(search).get('role')
    return value && ROLE_IDS.has(value) ? value : 'all'
  } catch {
    return 'all'
  }
}

export const PROJECTS = [
  {
    name: 'DiffLens',
    roles: ['ml', 'backend', 'systems'],
    sub: 'ML-Powered Code Review Engine',
    tech: [
      'Python',
      'FastAPI',
      'scikit-learn',
      'Tree-sitter',
      'PostgreSQL',
      'React',
      'Docker',
      'Ollama',
    ],
    bullets: [
      'Static analysis engine that parses Python and Java into Tree-sitter ASTs to measure cyclomatic complexity and nesting depth, then scores pull-request risk from those features alongside finding severity and diff size',
      'GitHub webhook integration to automatically analyze pull requests and post review comments with severity-ranked findings directly on PRs',
      'FastAPI backend with PostgreSQL review storage, React dashboard with data visualization, Docker Compose deployment, and a 14-file test suite',
    ],
    github: 'https://github.com/carlous-roy/DiffLens-Engine',
    status: 'Demo',
    link: 'https://difflens.roycarlous.com',
  },
  {
    name: 'TaskForge',
    roles: ['backend', 'fullstack'],
    sub: 'Distributed Report Generation Engine',
    tech: ['Java', 'Spring Boot', 'AWS SQS', 'DynamoDB', 'S3', 'Docker', 'React', 'H2'],
    bullets: [
      'Distributed report generation system. Requests come in over a REST API, queue through SQS, get processed by independent workers, and land in S3 behind presigned download URLs with TTL expiry',
      'Fault-tolerance patterns: exponential backoff with jitter, dead letter queues, idempotency enforcement, graceful shutdown, and rate limiting (60 req/min per IP)',
      'Correlation ID tracing across the full pipeline, three report generators from real H2 business data, and an embedded React dashboard with live job status tracking',
    ],
    github: 'https://github.com/carlous-roy/TaskForge-Engine',
    status: 'Demo',
    link: 'https://taskforge.roycarlous.com',
  },
  {
    name: 'Portfolio',
    roles: ['fullstack', 'ml'],
    sub: 'Personal Website',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Gemini 3.5 Flash'],
    bullets: [
      'Single-page React site with a timed intro sequence over a canvas particle backdrop, both skippable and switched off under reduced motion; dark and light themes that follow the OS preference and remember a choice; role-filtered project views with ?role= links',
      'Gemini assistant served through a serverless route that owns the system prompt, validates the message schema, checks the request origin, rate limits per instance and falls over to a second key in sequence. Replies are cached per conversation for the session. ESLint, Vitest and GitHub Actions on every push',
    ],
    github: 'https://github.com/carlous-roy/portfolio',
    status: 'Live',
    link: 'https://roycarlous.com',
  },
  {
    name: 'GestureControl',
    roles: ['ml', 'systems'],
    sub: 'Real-Time Machine Vision to Hardware Control',
    tech: ['Python', 'OpenCV', 'MediaPipe', 'PyFirmata', 'Arduino UNO'],
    bullets: [
      'A 30 FPS vision-to-actuator control loop. MediaPipe runs two models per frame: an SSD palm detector, then direct regression of 21 3D hand landmarks inside the cropped palm box',
      'A geometric classifier on top reads finger state from landmark geometry, comparing each fingertip against its PIP joint on the vertical axis. The thumb needs its own rule, since it moves laterally rather than vertically',
      'A 15px jitter threshold and a 3-frame stabilization window suppress false triggers before anything reaches the relays, and relays hold their last state when the hand leaves frame',
      'Drives a 4-channel relay module over PyFirmata serial to an Arduino UNO. A simulation mode runs and tests the whole loop with no board attached, which is what makes it demoable and CI-friendly',
    ],
    github: 'https://github.com/carlous-roy/GestureControl-Engine',
    status: 'Demo',
    link: 'https://gesture.roycarlous.com',
  },
  {
    name: 'CodeAtlas',
    roles: ['ml', 'data', 'backend'],
    sub: 'Semantic Code Search with a Published Retrieval Evaluation',
    tech: ['Python', 'sentence-transformers', 'Tree-sitter', 'BM25', 'NumPy'],
    bullets: [
      'Semantic search over a 152-file, 11k-line codebase, and an evaluation harness that says how well it works: 36 questions with labelled answers, scored across four retrieval strategies and three chunking strategies',
      'Tree-sitter chunking on declaration boundaries plus hybrid BM25 and embedding retrieval fused with Reciprocal Rank Fusion, reaching recall@5 0.86 and MRR 0.591. Chunking on structure beat fixed windows on ranking, recall@1 0.42 against 0.31, but only once chunk size was held constant. The first version of that experiment moved size and boundaries together and had to be redone',
      'Diagnosed the remaining misses rather than tuning past them. Documentation filled 46% of the top 5 on failures against 29% on successes, so a per-file cap lifted recall@3 from 0.67 to 0.78 in about ten lines. A standard MS MARCO cross-encoder reranker lowered MRR here, because web-passage training does not transfer to code',
    ],
    github: 'https://github.com/carlous-roy/CodeAtlas',
    status: 'Case Study',
    link: '/case-studies/codeatlas.html',
  },
]
