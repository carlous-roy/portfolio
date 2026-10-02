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
    roles: ['ml', 'backend', 'fullstack'],
    sub: 'Code review with a trained change-risk model',
    tech: [
      'Python',
      'FastAPI',
      'scikit-learn',
      'Tree-sitter',
      'PostgreSQL',
      'pgvector',
      'React',
      'Docker',
      'Ollama',
    ],
    bullets: [
      'Parses Python and Java into Tree-sitter syntax trees, so cyclomatic complexity and nesting depth are measured rather than estimated and the rules never fire inside comments or strings. Findings map to pull-request lines and GitHub webhooks post them as inline comments',
      'A gradient-boosted change-risk model trained on ApacheJIT (106,674 commits from 15 Apache projects) with a per-project temporal split and isotonic calibration: held-out ROC-AUC 0.80, SHAP attributions per score, and a generated model card so the published numbers cannot drift from the artefact',
      'Findings are embedded and stored in pgvector, then clustered, so a review can say how many times an issue has been seen before. An optional local model through Ollama rewrites findings as review comments. 291 tests, 91% coverage, a four-container Compose stack',
    ],
    github: 'https://github.com/carlous-roy/DiffLens-Engine',
    status: 'Demo',
    link: 'https://difflens.roycarlous.com',
  },
  {
    name: 'TaskForge',
    roles: ['backend', 'fullstack'],
    sub: 'Distributed report generation built for the failure path',
    tech: [
      'Java 17',
      'Spring Boot',
      'AWS SQS',
      'DynamoDB',
      'S3',
      'Testcontainers',
      'LocalStack',
      'Docker',
      'React',
    ],
    bullets: [
      'A REST API enqueues jobs to SQS, independent workers generate CSV reports from a seeded sample dataset and upload them to S3 behind presigned links, and a dashboard polls job state and queue depth',
      'Idempotency keys enforced with a single DynamoDB transaction, so a duplicate submission gets a 409 with the original job even under concurrent requests. Full-jitter backoff through ChangeMessageVisibility, redrive to a dead-letter queue after three deliveries with a consumer that records the last error, and versioned conditional writes so a slow worker cannot overwrite newer state',
      'Correlation IDs travel through logs, SQS attributes and S3 tags, a SIGTERM lets in-flight work finish before the worker exits, and rate limiting sits behind a trusted-proxy check. 106 unit and 19 integration tests run against LocalStack in CI',
    ],
    github: 'https://github.com/carlous-roy/TaskForge-Engine',
    status: 'Demo',
    link: 'https://taskforge.roycarlous.com',
  },
  {
    name: 'Portfolio',
    roles: ['fullstack', 'ml'],
    sub: 'This site',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Gemini API', 'Vercel'],
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
    sub: 'Hand gestures to a relay module',
    tech: ['Python', 'MediaPipe', 'OpenCV', 'pyFirmata2', 'Arduino'],
    bullets: [
      "MediaPipe hand landmarks in tracking mode, a One Euro filter on the coordinates, and finger rules in the hand's own frame with hysteresis and a three-frame confirmation, so rotation, scale and mirroring do not change the count",
      'The relay path is fail-safe on every exit, including Ctrl-C, SIGTERM and a lost serial link, and an Arduino Firmata sketch with a host-loss watchdog releases the relays within a second if the host disappears',
      'A simulate command replays recorded hands through the real pipeline, a bench command measures each stage of the loop, and a JavaScript port shares the rules and golden vectors with the Python tests. Started as my final-year project in 2022. 537 tests, mypy strict',
    ],
    github: 'https://github.com/carlous-roy/GestureControl-Engine',
    status: 'Demo',
    link: 'https://gesture.roycarlous.com',
  },
  {
    name: 'CodeAtlas',
    roles: ['ml', 'data', 'backend'],
    sub: 'Semantic code search with a published retrieval evaluation',
    tech: ['Python', 'sentence-transformers', 'Tree-sitter', 'BM25', 'NumPy'],
    bullets: [
      'Semantic search over four of my own projects, and the evaluation harness that says how well it works: a corpus pinned by manifest (116 files, 11,819 lines), 36 labelled questions with a dev/test split, six retrieval strategies by three chunkings, and reruns that reproduce the results byte for byte',
      'Hit rate, recall, nDCG and MRR with 95% bootstrap intervals on every number. The shipped configuration, structural chunking with hybrid BM25 and embedding retrieval and a per-file cap, reaches hit rate@5 0.81, recall@5 0.65 and MRR 0.58',
      'The results that went against expectation are reported with the rest: hybrid retrieval beats BM25 on MRR, the per-file cap lifts recall@5 from 0.57 to 0.65, structural chunking and fixed windows are within noise of each other, and a stock cross-encoder reranker makes ranking worse',
    ],
    github: 'https://github.com/carlous-roy/CodeAtlas',
    status: 'Case Study',
    link: '/case-studies/codeatlas.html',
  },
]
