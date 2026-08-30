import { useState, useEffect, useRef, useCallback } from 'react'
import IntroAnimation, { RCLogo, RCLogoCompact } from './components/IntroAnimation'
import AIChatbot, { GeminiLogo, SparkleIcon } from './components/AIChatbot'

// Site data — edit content here, not in the JSX
const GREETINGS = [
  { text: 'வணக்கம்', duration: 4000 }, { text: 'Hi', duration: 2000 }, { text: 'Bonjour', duration: 2000 },
  { text: 'Hola', duration: 2000 }, { text: 'नमस्ते', duration: 2000 }, { text: '你好', duration: 2000 },
  { text: 'こんにちは', duration: 2000 }, { text: 'مرحبا', duration: 2000 }, { text: 'Привет', duration: 2000 },
]
const NAV = [
  { id: 'hero', l: 'Home' }, { id: 'about', l: 'About' }, { id: 'skills', l: 'Skills' },
  { id: 'experience', l: 'Experience' }, { id: 'projects', l: 'Projects' }, { id: 'education', l: 'Education' }, { id: 'contact', l: 'Contact' },
]
const SKILLS = {
  Languages: ['Python', 'Java', 'C++', 'C#/.NET', 'JavaScript', 'SQL', 'HTML/CSS'],
  'AI & ML': ['scikit-learn', 'Gradient Boosting', 'Feature Engineering', 'Embeddings', 'Semantic Search', 'BM25', 'Hybrid Retrieval (BM25 + dense)', 'Retrieval Evaluation', 'TF-IDF', 'Ollama', 'CodeLlama', 'Gemini API', 'Claude', 'OpenCV', 'MediaPipe', 'Tree-sitter'],
  'Backend & Distributed': ['Spring Boot', 'FastAPI', 'REST API Design', 'Message Queues', 'Async Job Processing', 'Retries & DLQ', 'Idempotency', 'Rate Limiting', 'AWS SQS', 'AWS S3', 'DynamoDB', 'PostgreSQL', 'MySQL', 'SQLAlchemy', 'Alembic', 'Docker', 'Docker Compose', 'LocalStack', 'Git', 'Maven'],
  'Frontend & Cloud': ['React 18', 'Vite', 'Tailwind CSS', 'PostCSS', 'HTML5 Canvas', 'Responsive Layout', 'Dark Mode', 'Vercel', 'Nginx'],
  'Test & Embedded': ['Teradyne IG-XL', 'UltraFLEX', 'UltraFLEXplus', 'Instrument Drivers', 'Telemetry Acquisition', 'Root-Cause Analysis', 'WinDbg', 'JetBrains Profilers', 'Acceptance Test Automation', 'pytest', 'JUnit', 'Arduino', 'ESP8266', 'Serial Protocols'],
  'Data & BI': ['Power BI Dashboards', 'SQL', 'PostgreSQL', 'MySQL', 'pandas', 'NumPy', 'ETL Pipelines', 'KPI & Trend Reporting'],
}
const PROJ = [
  { name: 'DiffLens', roles: ['ml', 'backend', 'systems'], sub: 'ML-Powered Code Review Engine', tech: ['Python', 'FastAPI', 'scikit-learn', 'Tree-sitter', 'PostgreSQL', 'React', 'Docker', 'Ollama'], b: [
    'Static analysis engine that evaluates Python and Java code for complexity, naming conventions, and bug risk patterns using Tree-sitter AST parsing and gradient boosting ML risk scoring',
    'GitHub webhook integration to automatically analyze pull requests and post review comments with severity-ranked findings directly on PRs',
    'FastAPI backend with PostgreSQL review storage, React dashboard with data visualization, Docker Compose deployment, and a 15-file test suite',
  ], gh: 'https://github.com/carlous-roy/DiffLens-Engine', st: 'Demo', link: 'https://difflens.roycarlous.com' },
  { name: 'TaskForge', roles: ['backend', 'fullstack'], sub: 'Distributed Report Generation Engine', tech: ['Java', 'Spring Boot', 'AWS SQS', 'DynamoDB', 'S3', 'Docker', 'React', 'H2'], b: [
    'Distributed report generation system. Requests come in over a REST API, queue through SQS, get processed by independent workers, and land in S3 behind presigned download URLs with TTL expiry',
    'Fault-tolerance patterns: exponential backoff with jitter, dead letter queues, idempotency enforcement, graceful shutdown, and rate limiting (60 req/min per IP)',
    'Correlation ID tracing across the full pipeline, three report generators from real H2 business data, and an embedded React dashboard with live job status tracking',
  ], gh: 'https://github.com/carlous-roy/TaskForge-Engine', st: 'Demo', link: 'https://taskforge.roycarlous.com' },
  { name: 'Portfolio', roles: ['fullstack', 'ml'], sub: 'Personal Website', tech: ['React', 'Vite', 'Tailwind CSS', 'Gemini 3.5 Flash'], b: [
    'Cinematic multi-phase intro animation using HTML5 Canvas rendering and a phase state machine, with real-time background particle system',
    'Gemini 3.5 Flash API integration with context-aware prompt injection, dual-key rotation for failover, client-side rate limiting, and response caching',
  ], gh: 'https://github.com/carlous-roy/portfolio', st: 'Live', link: 'https://roycarlous.com' },
  { name: 'GestureControl', roles: ['ml', 'systems'], sub: 'Real-Time Machine Vision to Hardware Control', tech: ['Python', 'OpenCV', 'MediaPipe', 'PyFirmata', 'Arduino UNO'], b: [
    'A 30 FPS vision-to-actuator control loop. MediaPipe runs two models per frame: an SSD palm detector, then direct regression of 21 3D hand landmarks inside the cropped palm box',
    'A geometric classifier on top reads finger state from landmark geometry, comparing each fingertip against its PIP joint on the vertical axis. The thumb needs its own rule, since it moves laterally rather than vertically',
    'A 15px jitter threshold and a 3-frame stabilization window suppress false triggers before anything reaches the relays, and relays hold their last state when the hand leaves frame',
    'Drives a 4-channel relay module over PyFirmata serial to an Arduino UNO. A simulation mode runs and tests the whole loop with no board attached, which is what makes it demoable and CI-friendly',
  ], gh: 'https://github.com/carlous-roy/GestureControl-Engine', st: 'Demo', link: 'https://gesture.roycarlous.com' },
  { name: 'CodeAtlas', roles: ['ml', 'data', 'backend'], sub: 'Semantic Code Search with a Published Retrieval Evaluation', tech: ['Python', 'sentence-transformers', 'Tree-sitter', 'BM25', 'NumPy'], b: [
    'Semantic search over a 152-file, 11k-line codebase, and an evaluation harness that says how well it works: 36 questions with labelled answers, scored across four retrieval strategies and three chunking strategies',
    'Tree-sitter chunking on declaration boundaries plus hybrid BM25 and embedding retrieval fused with Reciprocal Rank Fusion, reaching recall@5 0.86 and MRR 0.591. Chunking on structure beat fixed windows on ranking, recall@1 0.42 against 0.31, but only once chunk size was held constant. The first version of that experiment moved size and boundaries together and had to be redone',
    'Diagnosed the remaining misses rather than tuning past them. Documentation filled 46% of the top 5 on failures against 29% on successes, so a per-file cap lifted recall@3 from 0.67 to 0.78 in about ten lines. A standard MS MARCO cross-encoder reranker lowered MRR here, because web-passage training does not transfer to code',
  ], gh: 'https://github.com/carlous-roy/CodeAtlas', st: 'Case Study', link: '/case-studies/codeatlas.html' },
]
const ROLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'backend', label: 'Backend & Distributed' },
  { id: 'ml', label: 'AI/ML' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'systems', label: 'Systems' },
]
const EDU = [
  { school: 'Wright State University', loc: 'Fairborn, OH', deg: 'Master of Science in Computer Science', period: 'Aug 2024 — Aug 2026', courses: 'Foundations of AI, Information Retrieval, Algorithm Design and Analysis, Distributed Computing, Advanced Computer Networks, Reverse Engineering and Program Analysis' },
  { school: 'Sathyabama Institute of Science and Technology', loc: 'Chennai, India', deg: 'Bachelor of Engineering in Electronics and Communication Engineering', period: 'Aug 2018 — Jun 2022', courses: '' },
]

// Experience data — 3 roles at HCLTech/Teradyne
const EXP_ROLES = [
  { title: 'Senior Software Engineer', period: 'Jan 2024 \u2014 Aug 2024', color: 'tx', opacity: 0.3, bullets: [
    "Owned C++ and C#/.NET instrument driver development for Teradyne's IG-XL automated test equipment platform (UltraFLEX, UltraFLEXplus), controlling and measuring analog instruments in real time, where a driver defect stops a production line",
    'Was the sole escalation point for critical ATE stopper issues affecting end customers, and built the Power BI dashboards that tracked issue trends across both tester platforms. Scattered escalation records became a view of where defects clustered by platform, module and instrument, which cut mean time to resolution on the recurring classes',
    'Cut root-cause time on memory leaks and performance regressions by moving legacy diagnostic workflows onto an AI-assisted debugging framework (WinDbg, JetBrains Timeline Profiler, automated flagging of regressions between builds), which reduced repeat escalations on defects that had kept coming back',
    'Worked across teams migrating the IG.NET framework from C++ to a modern C#/.NET architecture: triaged the defect backlog across the ported modules and profiled runtime performance against the original to catch bottlenecks before deployment. Zero production stoppers on the releases managed',
  ]},
  { title: 'Software Engineer', period: 'Aug 2022 \u2014 Dec 2023', color: 'su', opacity: 0.15, bullets: [
    'Resolved 150+ defects across three analog instrument driver codebases (DC30, DC70, DC75) by tracing failures through automated acceptance-test logs and captured measurement data, bringing all three product lines to regression-free release status',
    'Introduced new language nodes for analog instruments in the IG-XL environment, extending automated test coverage to next-generation hardware that had previously required manual configuration',
    'Extended C++ and C#/.NET driver architectures for new instrument capabilities in an Agile team spanning the US, Europe and Asia-Pacific, and wrote the unit and acceptance suites behind them, including repairing defective legacy tests against evolving IG-XL requirements',
    'Managed source code integrity through VersionVault (ClearCase) with branching and merge strategies across the Analog, Core and Digital codebases',
  ]},
  { title: 'Graduate Engineer Trainee', period: 'Jan 2022 \u2014 Jul 2022', color: 'mu', opacity: 0.1, bullets: [
    'Completed technical training in C++, C#/.NET and OOP/OOD principles, working alongside driver engineers to build a working understanding of analog instrument architecture and its driver code',
    'Gained hands-on exposure to semiconductor test equipment, including the chip docking process on live testers, tracking delivery through JIRA',
  ]},
]

// Icons
const Ic = {
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Github: ({ s = 24 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  LinkedIn: ({ s = 24 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  Mail: ({ s = 24 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone: ({ s = 24 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  DL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Ext: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Up: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Arrow: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Briefcase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Code: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Layers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  GradCap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>,
}

// A glyph per category, inline so it inherits currentColor and themes with the
// site, plus the tools that category is best known by as real brand icons.
// skillicons.dev returns one SVG for a comma-separated list, so a card costs one
// request rather than six. perline=3 lays them out three across, two down.
//
// Only tools that actually have an icon are listed, and only ones Roy has really
// used. Short categories stay short rather than getting padded with something
// adjacent; the count beside the name says how many more are behind the click.
const SkillIcon = {
  'AI & ML': () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="6" r="1.8"/><circle cx="19" cy="6" r="1.8"/><circle cx="5" cy="18" r="1.8"/><circle cx="19" cy="18" r="1.8"/><path d="M6.5 7.2 10 10.4M17.5 7.2 14 10.4M6.5 16.8 10 13.6M17.5 16.8 14 13.6"/></svg>,
  Languages: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/><line x1="13.5" y1="4.5" x2="10.5" y2="19.5"/></svg>,
  'Backend & Distributed': () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3" width="19" height="6" rx="1.6"/><rect x="2.5" y="15" width="19" height="6" rx="1.6"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/><path d="M12 9v6"/></svg>,
  'Frontend & Cloud': () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 11.2 3.9 3.9 0 0 0 7 19z"/><path d="M9.5 14.5 12 12l2.5 2.5"/></svg>,
  'Test & Embedded': () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"/></svg>,
  'Data & BI': () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="20" x2="5" y2="12"/><line x1="12" y1="20" x2="12" y2="5"/><line x1="19" y1="20" x2="19" y2="15"/><line x1="2.5" y1="20" x2="21.5" y2="20"/></svg>,
}

// Exactly six tiles per category, laid out 3 x 2.
//
// Some of these tools have a brand icon and some do not: BM25 and Power BI are
// real parts of the work with no logo to show. Rather than pad the grid with
// something adjacent just to reach six, a tile without an icon renders as a
// short label in the same square. The grid stays even and nothing is claimed
// that is not used.
//
// Brand icons come from skillicons.dev, one request per tile, lazy-loaded, with
// a fallback to the label if the service is unreachable.
const SKILL_TILES = {
  // Each logo appears on exactly one card, so the grid reads as six distinct
  // areas rather than the same mark repeated. `i` is a skillicons slug, `f` is
  // a file in /skill-icons for the tools skillicons has no icon for.
  Languages: [
    { i: 'py', l: 'Python' }, { i: 'java', l: 'Java' }, { i: 'cpp', l: 'C++' },
    { i: 'cs', l: 'C#' }, { i: 'js', l: 'JavaScript' }, { i: 'html', l: 'HTML' },
  ],
  'AI & ML': [
    { i: 'sklearn', l: 'scikit-learn' }, { i: 'opencv', l: 'OpenCV' },
    { f: 'mediapipe', l: 'MediaPipe' }, { f: 'ollama', l: 'Ollama' },
    { f: 'gemini', l: 'Gemini API' }, { f: 'claude', l: 'Claude' },
  ],
  'Backend & Distributed': [
    { i: 'spring', l: 'Spring' }, { i: 'fastapi', l: 'FastAPI' }, { i: 'aws', l: 'AWS' },
    { i: 'dynamodb', l: 'DynamoDB' }, { i: 'docker', l: 'Docker' }, { f: 'restapi', l: 'REST APIs' },
  ],
  'Frontend & Cloud': [
    { i: 'react', l: 'React' }, { i: 'vite', l: 'Vite' }, { i: 'tailwind', l: 'Tailwind' },
    { i: 'css', l: 'CSS' }, { i: 'vercel', l: 'Vercel' }, { i: 'nginx', l: 'Nginx' },
  ],
  'Test & Embedded': [
    { i: 'arduino', l: 'Arduino' }, { f: 'igxl', l: 'Teradyne IG-XL' },
    { f: 'ultraflex', l: 'UltraFLEXplus' }, { f: 'windbg', l: 'WinDbg' },
    { f: 'pytest', l: 'pytest' }, { f: 'junit', l: 'JUnit' },
  ],
  'Data & BI': [
    { i: 'postgres', l: 'Postgres' }, { i: 'mysql', l: 'MySQL' }, { f: 'powerbi', l: 'Power BI' },
    { f: 'pandas', l: 'pandas' }, { f: 'numpy', l: 'NumPy' }, { f: 'sql', l: 'SQL' },
  ],
}

const Chevron = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>

// A skill category: icon, name, count, and the full list behind a click.
// Collapsed by default so the section reads as six things rather than eighty.
function SkillTile({ tile, dark, su }) {
  const [failed, setFailed] = useState(false)
  const box = `aspect-square rounded-xl flex items-center justify-center overflow-hidden ${dark ? 'bg-white/[0.05]' : 'bg-black/[0.045]'}`
  const src = tile.f
    ? `/skill-icons/${tile.f}.png`
    : tile.i && `https://skillicons.dev/icons?i=${tile.i}&theme=${dark ? 'dark' : 'light'}`
  if (src && !failed) {
    return (
      <span className={box} title={tile.l}>
        <img
          src={src} alt="" aria-hidden="true" loading="lazy"
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }
  return (
    <span className={`${box} px-1.5 text-center leading-tight font-semibold ${su}`}
          style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }} title={tile.l}>
      {tile.l}
    </span>
  )
}

function SkillCard({ cat, items, dark, cBg, cBd, su, mu, open, onToggle }) {
  const Glyph = SkillIcon[cat]
  const tiles = SKILL_TILES[cat]
  const more = items.length - tiles.length
  const panelId = `skills-${cat.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className={`rounded-2xl ${cBg} border ${cBd} card-hover overflow-hidden`}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${cat}, ${items.length} skills`}
        className="w-full p-5 sm:p-6 bg-transparent border-none cursor-pointer text-left font-sans block"
        style={{ color: 'inherit' }}
      >
        {/* Six tiles, three across. The grid takes the full card width, so the
            tiles scale with the card instead of leaving a gap on the right. */}
        <span className="grid grid-cols-3 gap-2.5 mb-5">
          {tiles.map((t, i) => <SkillTile key={t.i || t.l || i} tile={t} dark={dark} su={su} />)}
        </span>
        <span className="flex items-center gap-3.5 min-h-[66px]">
          <span className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)', color: '#DC2626' }}>
            <Glyph />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-semibold tracking-tight">{cat}</span>
            <span className={`block text-[12.5px] mt-0.5 ${mu}`}>
              {more > 0 ? `+${more} more skill${more === 1 ? '' : 's'}` : `${items.length} skills`}
            </span>
          </span>
          <span className={`shrink-0 ${mu} transition-transform duration-300`}
                style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            <Chevron />
          </span>
        </span>
      </button>
      <div id={panelId} className="grid transition-all duration-300 ease-out"
           style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2 px-5 sm:px-6 pb-6 pt-1">
            {items.map(t => (
              <span key={t} className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${dark ? 'bg-white/[0.05]' : 'bg-black/[0.04]'} ${su}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Cursor glow — follows mouse on desktop, disabled on touch
function CursorGlow({ dark }) {
  const [p, setP] = useState({ x: -300, y: -300 })
  useEffect(() => {
    if (window.matchMedia('(pointer:coarse)').matches) return
    const h = e => setP({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return <div className="fixed pointer-events-none z-[1]" style={{
    left: p.x - 250, top: p.y - 250, width: 500, height: 500, borderRadius: '50%',
    background: dark
      ? 'radial-gradient(circle, rgba(220,38,38,0.05) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(29,78,216,0.06) 0%, rgba(220,38,38,0.02) 40%, transparent 70%)',
    transition: 'left 0.1s ease-out, top 0.1s ease-out',
  }} />
}

// Greeting text that cycles through languages with width animation
function GreetingCycle() {
  const [idx, setIdx] = useState(0), [txt, setTxt] = useState(GREETINGS[0].text), [cls, setCls] = useState('greet-idle'), mRef = useRef(null), [w, setW] = useState('auto')
  useEffect(() => { if (mRef.current) setW(mRef.current.offsetWidth + 2 + 'px') }, [txt])
  useEffect(() => {
    const t = setTimeout(() => { setCls('greet-exit'); setTimeout(() => { const ni = (idx + 1) % GREETINGS.length; setIdx(ni); setTxt(GREETINGS[ni].text); setCls('greet-enter'); setTimeout(() => setCls('greet-idle'), 400) }, 300) }, GREETINGS[idx].duration)
    return () => clearTimeout(t)
  }, [idx])
  return <>
    <span ref={mRef} className="absolute invisible whitespace-nowrap font-extrabold" style={{ fontSize: 'inherit' }} aria-hidden="true">{txt}</span>
    <span className="inline-block overflow-hidden align-bottom" style={{ width: w, transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
      <span className={`inline-block gradient-text font-extrabold whitespace-nowrap ${cls}`}>{txt}</span>
    </span>
  </>
}

// Profile photo carousel — auto-cycles every 5s, hover advances on desktop
function HeroPhoto({ dark }) {
  const containerRef = useRef(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const photos = [
    { src: '/roy-default.jpg', pos: 'center center' },
    { src: '/roy.jpg', pos: 'center center' },
    { src: '/roy-casual.jpg', pos: 'center center' },
  ]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setPhotoIdx(p => (p + 1) % photos.length), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || window.matchMedia('(pointer:coarse)').matches) return
    const advance = () => setPhotoIdx(p => (p + 1) % photos.length)
    el.addEventListener('mouseenter', advance)
    return () => el.removeEventListener('mouseenter', advance)
  }, [])

  const mu = dark ? 'text-[#4b5563]' : 'text-[#6b7280]'
  const iconSize = isMobile ? 18 : 22
  const socials = [
    { href: 'https://github.com/carlous-roy', icon: <Ic.Github s={iconSize} /> },
    { href: 'https://linkedin.com/in/roy-carlous-c', icon: <Ic.LinkedIn s={iconSize} /> },
    { href: 'mailto:roy4edu@gmail.com', icon: <Ic.Mail s={iconSize} /> },
    { href: 'tel:+13264671939', icon: <Ic.Phone s={iconSize} /> },
  ]
  const angles = [202, 226, 250, 274]
  const radius = isMobile ? 62 : 66
  const btnSize = isMobile ? 36 : 48
  const size = isMobile ? '160px' : 'clamp(260px, 26vw, 350px)'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div ref={containerRef} className="rounded-full p-[3px] cursor-pointer w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.5), rgba(234,88,12,0.3), rgba(245,158,11,0.2), rgba(29,78,216,0.4))', boxShadow: '0 0 100px rgba(220,38,38,0.08)' }}>
        <div className="w-full h-full rounded-full overflow-hidden relative">
          {photos.map((photo, i) => (
            <img key={photo.src} src={photo.src} alt="Roy Carlous Christudass" className="absolute inset-0 w-full h-full rounded-full object-cover" style={{ objectPosition: photo.pos, opacity: photoIdx === i ? 1 : 0, transform: photoIdx === i ? 'scale(1.06)' : 'scale(1.1)', transition: 'opacity 0.7s ease, transform 0.7s ease' }} />
          ))}
        </div>
      </div>
      {socials.map((item, i) => {
        const r = (angles[i] * Math.PI) / 180
        return (
          <a key={i} href={item.href} target={item.href.startsWith('mailto') || item.href.startsWith('tel') ? undefined : '_blank'} rel="noopener noreferrer"
            className={`absolute rounded-full flex items-center justify-center ${mu} hover:text-[#DC2626] transition-all hover:scale-110 social-icon-pop`}
            style={{ width: btnSize, height: btnSize, left: `calc(50% + ${Math.sin(r) * radius}%)`, top: `calc(50% + ${-Math.cos(r) * radius}%)`, transform: 'translate(-50%,-50%)', background: dark ? 'rgba(8,8,12,0.92)' : 'rgba(248,247,244,0.92)', backdropFilter: 'blur(16px)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)', animationDelay: `${0.6 + i * 0.1}s` }}>{item.icon}</a>
        )
      })}
    </div>
  )
}

// Scroll reveal — fades in on viewport entry, resets on exit
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null), [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s` }}>{children}</div>
}

const Label = ({ t }) => <p className="font-mono text-sm font-medium tracking-[0.15em] uppercase mb-4" style={{ color: '#DC2626' }}>{t}</p>
const H2 = ({ children, className = '' }) => <h2 className={`font-extrabold ${className}`} style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>{children}</h2>
const Body = ({ children, className = '' }) => <p className={className} style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', lineHeight: 1.75, fontWeight: 400, letterSpacing: '-0.005em' }}>{children}</p>

// Reusable bullet list for experience roles
function BulletList({ items, color, opacity }) {
  return (
    <ul className="flex flex-col gap-2.5 list-none">
      {items.map((item, i) => (
        <li key={i} className={`leading-relaxed ${color} pl-5 relative`} style={{ fontSize: 'clamp(15px, 1.6vw, 17px)' }}>
          <span className="absolute left-0 top-[11px] w-1.5 h-1.5 rounded-full" style={{ background: '#DC2626', opacity }} />
          {item}
        </li>
      ))}
    </ul>
  )
}

// Canvas particles — drifting dots with sine-wave alpha
function BackgroundParticles({ dark }) {
  const canvasRef = useRef(null)
  const darkRef = useRef(dark)
  useEffect(() => { darkRef.current = dark }, [dark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, af
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, baseAlpha: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const isDark = darkRef.current, t = Date.now() * 0.001
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        const alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(t * 0.8 + p.phase)) * (isDark ? 0.5 : 0.25)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`
        ctx.fill()
      })
      af = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(af); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

export default function App() {
  const [dark, setDark] = useState(true)
  const [introOk, setIntroOk] = useState(false)
  const [chat, setChat] = useState(false)
  const [mobMenu, setMobMenu] = useState(false)
  const [active, setActive] = useState('hero')
  const [openSkill, setOpenSkill] = useState(null)

  // Keep the document background matching the theme. Without this the html/body
  // default shows through during the intro-to-app transition and on overscroll.
  useEffect(() => {
    const c = dark ? '#08080c' : '#f8f7f4'
    document.documentElement.style.background = c
    document.body.style.background = c
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c)
  }, [dark])
  const [btt, setBtt] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([])
  const [role, setRole] = useState(() => { try { return new URLSearchParams(window.location.search).get('role') || 'all' } catch { return 'all' } })
  useEffect(() => { try { const u = new URL(window.location.href); if (role === 'all') u.searchParams.delete('role'); else u.searchParams.set('role', role); window.history.replaceState({}, '', u) } catch {} }, [role])
  const match = p => role === 'all' || (p.roles || []).includes(role)
  const orderedProj = role === 'all' ? PROJ.map(p => [p, false]) : [...PROJ.filter(match).map(p => [p, false]), ...PROJ.filter(p => !match(p)).map(p => [p, true])]

  // Track active section + back-to-top visibility
  useEffect(() => {
    if (!introOk) return
    const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }), { threshold: 0.35 })
    const onScroll = () => setBtt(window.scrollY > window.innerHeight * 0.5)
    window.addEventListener('scroll', onScroll)
    setTimeout(() => NAV.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) }), 50)
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [introOk])

  const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobMenu(false) }

  // Theme tokens
  const bg = dark ? 'bg-[#08080c]' : 'bg-[#f8f7f4]'
  const tx = dark ? 'text-[#e4e4e7]' : 'text-[#111827]'
  const su = dark ? 'text-[#9ca3af]' : 'text-[#374151]'
  const mu = dark ? 'text-[#4b5563]' : 'text-[#6b7280]'
  const cBg = dark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
  const cBd = dark ? 'border-white/[0.06]' : 'border-black/[0.08]'
  const navBg = dark ? 'bg-[#08080c]/85' : 'bg-[#f8f7f4]/85'

  if (!introOk) return <IntroAnimation onComplete={() => setIntroOk(true)} />

  // Map role color tokens to actual classes
  const colorMap = { tx, su, mu }

  return (
    <div className={`${bg} ${tx} min-h-screen font-sans theme-transition relative overflow-x-hidden noise-overlay`}>
      <CursorGlow dark={dark} />
      <BackgroundParticles dark={dark} />

      <nav className={`fixed top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-[clamp(16px,4vw,48px)] ${navBg} backdrop-blur-2xl border-b ${cBd} theme-transition`}>
        <button onClick={() => go('hero')} className="bg-transparent border-none cursor-pointer flex items-center gap-1">
          <RCLogoCompact size={30} dark={dark} /><span className={`font-mono text-xs font-medium ${mu}`}>/swe</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {NAV.filter(n => n.id !== 'hero').map(({ id, l }) => (
            <button key={id} onClick={() => go(id)} className={`px-4 py-1.5 rounded-full text-sm font-medium border-none cursor-pointer font-sans transition-all bg-transparent ${active === id ? (dark ? 'bg-white/[0.06] text-white' : 'bg-black/[0.05] text-black') : (dark ? 'text-[#9ca3af] hover:text-white' : 'text-[#6b7280] hover:text-[#111827]')}`}>{l}</button>
          ))}
          <div className={`w-px h-5 mx-2 ${dark ? 'bg-white/[0.08]' : 'bg-black/[0.08]'}`} />
          <button onClick={() => setDark(!dark)} className={`p-1.5 bg-transparent border-none cursor-pointer ${su}`}>{dark ? <Ic.Sun /> : <Ic.Moon />}</button>
        </div>
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setDark(!dark)} className={`p-1.5 bg-transparent border-none cursor-pointer ${su}`}>{dark ? <Ic.Sun /> : <Ic.Moon />}</button>
          <button onClick={() => setMobMenu(!mobMenu)} className={`p-1 bg-transparent border-none cursor-pointer ${tx}`}>{mobMenu ? <Ic.X /> : <Ic.Menu />}</button>
        </div>
      </nav>

      {mobMenu && <div className={`fixed top-16 inset-x-0 bottom-0 z-[99] backdrop-blur-2xl p-8 flex flex-col gap-2 ${dark ? 'bg-[#08080c]/95' : 'bg-[#f8f7f4]/95'}`}>
        {NAV.map(({ id, l }) => <button key={id} onClick={() => go(id)} className={`text-left py-4 text-2xl font-semibold border-none bg-transparent cursor-pointer font-sans border-b ${cBd} ${active === id ? tx : su}`}>{l}</button>)}
      </div>}

      {/* HERO */}
      <section id="hero" className="min-h-screen flex items-center pt-24 pb-16 px-[clamp(16px,4vw,80px)]">
        <div className="max-w-[1200px] w-full mx-auto">
          <div className="flex items-center md:justify-center gap-6 md:gap-16">
            <div className="flex-1 min-w-0">
              <Reveal><p className="relative" style={{ fontSize: 'clamp(26px, 4.5vw, 52px)', fontWeight: 300, lineHeight: 1.3, color: dark ? '#9ca3af' : '#374151' }}><GreetingCycle /><span className={mu}>, I'm</span></p></Reveal>
              <Reveal delay={0.1}><h1 className="font-black leading-[0.95] mb-5" style={{ fontSize: 'clamp(52px, 10vw, 108px)', letterSpacing: '-0.04em' }}>ROY</h1></Reveal>
              <Reveal delay={0.2}><p className="mb-1" style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 400, color: dark ? '#9ca3af' : '#374151' }}>AI Software Engineer</p></Reveal>
              <Reveal delay={0.22}><p className={`mb-5 ${mu}`} style={{ fontSize: 'clamp(14px, 1.5vw, 17px)' }}>Machine learning, data and backend systems, built end to end</p></Reveal>
              <Reveal delay={0.25}>
                <a href="/Roy_Resume.pdf" download className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border ${cBd} bg-transparent ${tx} text-sm font-medium no-underline transition-all hover:-translate-y-0.5 font-sans mb-8 resume-pop`} style={{ backdropFilter: 'blur(12px)', animationDelay: '1s' }}><Ic.DL /> Resume</a>
              </Reveal>
              <Reveal delay={0.3}>
                <div className={`mb-8 max-w-[560px] leading-[1.8] ${su}`} style={{ fontSize: 'clamp(15px, 1.8vw, 20px)' }}>
                  <p>MS Computer Science<span className={mu} style={{ fontWeight: 300 }}>, WSU, USA</span></p>
                  <p>BE Electronics and Communication Engineering<span className={mu} style={{ fontWeight: 300 }}>, SIST, India</span></p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.35} className="flex-shrink-0"><HeroPhoto dark={dark} /></Reveal>
          </div>

          <Reveal delay={0.4}>
            <div onClick={() => setChat(true)} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 max-w-[560px] mt-2 chat-bar-glow`} style={{ borderColor: dark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.15)', background: dark ? 'rgba(220,38,38,0.03)' : 'rgba(220,38,38,0.02)' }}>
              <SparkleIcon />
              <span className={`flex-1 text-[15px] ${mu}`}>Ask Roy's AI anything<span className="blinking-cursor" style={{ background: dark ? '#9ca3af' : '#6b7280' }} /></span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}><Ic.Arrow /></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
        <div className="max-w-[900px] mx-auto w-full">
          <Reveal><Label t="About" /><h2 className="font-extrabold mb-10" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.15, letterSpacing: '-0.025em' }}>Roy Carlous Christudass</h2></Reveal>
          <Reveal delay={0.15}>
            <Body className={su}>
              I'm a software engineer working on AI and data systems. Most of what I build ends up the same shape: data coming in, a model or some logic over it, an API in the middle, and a front end someone actually uses, and I like working across all of that rather than owning one layer.
            </Body>
            <Body className={`${su} mt-6`}>
              Before my master's I spent nearly three years at HCLTech, contracted to Teradyne, writing C++ and C#/.NET drivers for semiconductor test equipment. The software controlled physical hardware, so bugs were expensive and I got good at tracing them. I also ended up owning customer escalations and building the dashboards that tracked them, which is how I got into data work in the first place.
            </Body>
            <Body className={`${su} mt-6`}>
              I'm currently actively looking for Internship or Full-Time roles where I can bring real engineering rigor to high-impact problems.
            </Body>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex items-center gap-4 mt-12 flex-wrap">
              {[{ id: 'experience', label: 'Experience', icon: <Ic.Briefcase /> }, { id: 'projects', label: 'Projects', icon: <Ic.Layers /> }, { id: 'skills', label: 'Skills', icon: <Ic.Code /> }, { id: 'education', label: 'Education', icon: <Ic.GradCap /> }].map(item => (
                <button key={item.id} onClick={() => go(item.id)} className={`flex items-center gap-2.5 px-5 py-3 rounded-full border ${cBd} ${su} text-sm font-medium cursor-pointer font-sans transition-all hover:-translate-y-0.5 bg-transparent`}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'; e.currentTarget.style.color = dark ? '#e4e4e7' : '#111827' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>{item.icon}{item.label}</button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
        <div className="max-w-[960px] mx-auto w-full">
          <Reveal><Label t="Skills" /><H2 className="mb-12">What I work with.</H2></Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {Object.entries(SKILLS).map(([cat, items], i) => (
              <Reveal key={cat} delay={i * 0.06}>
                <SkillCard
                  cat={cat} items={items} dark={dark}
                  cBg={cBg} cBd={cBd} su={su} mu={mu}
                  open={openSkill === cat}
                  onToggle={() => setOpenSkill(openSkill === cat ? null : cat)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
        <div className="max-w-[900px] mx-auto w-full">
          <Reveal>
            <Label t="Experience" />
            <H2>HCLTech <span className={`font-normal ${mu}`}>→ Teradyne</span> <span className={`font-normal text-[0.45em] ${mu}`}>(Contractor)</span></H2>
            <p className={`font-mono text-sm mt-3 mb-10 ${mu}`}>Jan 2022 — Aug 2024</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="hidden sm:flex items-center gap-3 flex-wrap mb-8">
              {EXP_ROLES.map((role, i) => <span key={i}>{i > 0 && <span className={mu}> ← </span>}<span className={`text-lg ${i === 0 ? `font-bold ${tx}` : i === 1 ? `font-semibold text-[#6b7280]` : `font-medium ${dark ? 'text-[#374151]' : 'text-[#9ca3af]'}`}`}>{role.title}</span></span>)}
            </div>
            <div className="flex sm:hidden flex-col gap-2 mb-8">
              {EXP_ROLES.map((role, i) => <div key={i} className="flex items-center gap-2">{i > 0 && <span className={`text-[10px] ${mu}`}>↑</span>}<span className={`text-base ${i === 0 ? `font-bold ${tx}` : i === 1 ? `font-semibold text-[#6b7280]` : `font-medium ${dark ? 'text-[#374151]' : 'text-[#9ca3af]'}`}`}>{role.title}</span></div>)}
            </div>
          </Reveal>
          {EXP_ROLES.map((role, i) => (
            <Reveal key={i} delay={0.15 + i * 0.05}>
              <div className={i < EXP_ROLES.length - 1 ? 'mb-8' : ''}>
                <div className="flex justify-between flex-wrap gap-2 mb-3">
                  <h3 className={`text-base font-semibold ${colorMap[role.color]}`}>{role.title}</h3>
                  <span className={`font-mono text-xs ${mu}`}>{role.period}</span>
                </div>
                <BulletList items={role.bullets} color={su} opacity={role.opacity} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="min-h-screen flex items-center py-28 px-[clamp(24px,6vw,80px)]">
        <div className="max-w-[1000px] mx-auto w-full">
          <Reveal><Label t="Projects" /><H2 className="mb-6">Things I've built.</H2></Reveal>
          <Reveal><div className="flex flex-wrap gap-2 mb-10">
            {ROLE_FILTERS.map(f => <button key={f.id} onClick={() => setRole(f.id)} aria-pressed={role === f.id} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${role === f.id ? 'text-white' : `${su} ${dark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}`} style={role === f.id ? { background: '#DC2626' } : undefined}>{f.label}</button>)}
          </div></Reveal>
          <div className="flex flex-col gap-7">
            {orderedProj.map(([p, dim], i) => <Reveal key={p.name} delay={i * 0.1}><div className={`p-6 md:p-9 rounded-[24px] ${cBg} border ${cBd} card-hover`} style={{ opacity: dim ? 0.5 : 1, transition: 'opacity .35s ease' }}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-4">
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-bold tracking-tight">{p.name}<span className="ml-3 text-[11px] font-semibold px-3 py-1 rounded-full align-middle" style={{ background: (p.st === 'Live' || p.st === 'Demo') ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: (p.st === 'Live' || p.st === 'Demo') ? '#22c55e' : '#F59E0B' }}>{p.st}</span></h3>
                  <p className={`text-[14px] md:text-[15px] mt-1 ${mu}`}>{p.sub}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  {p.gh && <a href={p.gh} target="_blank" rel="noopener noreferrer" className={`${su} flex items-center gap-1.5 text-sm no-underline hover:text-[#DC2626] transition-colors`}><Ic.Github s={18} /> Code</a>}
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[#DC2626] flex items-center gap-1.5 text-sm no-underline"><Ic.Ext /> {p.st}</a>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">{p.tech.map(t => <span key={t} className={`px-3 py-1.5 rounded-lg text-xs font-mono ${dark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'} ${su}`}>{t}</span>)}</div>
              <BulletList items={p.b} color={su} opacity={0.3} />
            </div></Reveal>)}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
        <div className="max-w-[900px] mx-auto w-full">
          <Reveal><Label t="Education" /><H2 className="mb-14">Where I studied.</H2></Reveal>
          <div className="flex flex-col gap-7">
            {EDU.map((e, i) => <Reveal key={i} delay={i * 0.12}><div className={`p-9 rounded-[24px] ${cBg} border ${cBd} card-hover`}>
              <div className="flex justify-between flex-wrap gap-2 mb-2"><h3 className="text-xl font-bold">{e.school}</h3><span className={`font-mono text-xs ${mu}`}>{e.period}</span></div>
              <Body className={`${su} !leading-normal`}>{e.deg}</Body>
              <p className={`text-sm ${mu} mt-1`}>{e.loc}</p>
              {e.courses && <p className={`text-sm ${mu} mt-4`}><span className={`font-semibold ${su}`}>Relevant Coursework:</span> {e.courses}</p>}
            </div></Reveal>)}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="min-h-[90vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
        <div className="max-w-[640px] mx-auto w-full text-center">
          <Reveal>
            <Label t="Contact" />
            <H2 className="mb-4">Let's connect.</H2>
            <Body className={`${su} mb-3`}>Got a question, opportunity, or just want to say hello? Drop a message.</Body>
            <p className={`text-sm ${mu} mb-12`}>Dayton, OH &middot; open to relocation</p>
          </Reveal>
          <Reveal delay={0.15}>
            <form action="https://formspree.io/f/xqedbdpw" method="POST" className="flex flex-col gap-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input name="name" placeholder="Name" required className={`px-5 py-4 rounded-2xl border ${cBd} ${cBg} ${tx} text-[16px] font-sans`} />
                <input name="email" type="email" placeholder="Email" required className={`px-5 py-4 rounded-2xl border ${cBd} ${cBg} ${tx} text-[16px] font-sans`} />
              </div>
              <input name="subject" placeholder="Subject" className={`px-5 py-4 rounded-2xl border ${cBd} ${cBg} ${tx} text-[16px] font-sans`} />
              <textarea name="message" placeholder="Your message..." rows={5} required className={`px-5 py-4 rounded-2xl border ${cBd} ${cBg} ${tx} text-[16px] font-sans resize-y min-h-[140px]`} />
              <button type="submit" className="px-8 py-4 rounded-full border-none text-white text-[16px] font-semibold font-sans cursor-pointer self-center transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 4px 24px rgba(220,38,38,0.2)' }}>Send Message</button>
            </form>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="flex items-center justify-center gap-3 mt-10 mb-5">
              <div className={`h-px flex-1 max-w-[60px] ${dark ? 'bg-white/[0.08]' : 'bg-black/[0.08]'}`} />
              <span className={`text-sm ${mu}`}>or reach out directly</span>
              <div className={`h-px flex-1 max-w-[60px] ${dark ? 'bg-white/[0.08]' : 'bg-black/[0.08]'}`} />
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a href="https://linkedin.com/in/roy-carlous-c" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2.5 px-5 py-3 rounded-full border ${cBd} ${su} text-sm font-medium no-underline font-sans transition-all hover:-translate-y-0.5 hover:text-[#DC2626]`} style={{ background: 'transparent' }}><Ic.LinkedIn s={18} /> LinkedIn</a>
              <a href="mailto:roy4edu@gmail.com" className={`flex items-center gap-2.5 px-5 py-3 rounded-full border ${cBd} ${su} text-sm font-medium no-underline font-sans transition-all hover:-translate-y-0.5 hover:text-[#DC2626]`} style={{ background: 'transparent' }}><Ic.Mail s={18} /> Email</a>
              <a href="tel:+13264671939" className={`flex items-center gap-2.5 px-5 py-3 rounded-full border ${cBd} ${su} text-sm font-medium no-underline font-sans transition-all hover:-translate-y-0.5 hover:text-[#DC2626]`} style={{ background: 'transparent' }}><Ic.Phone s={18} /> Call</a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className={`py-12 px-[clamp(24px,6vw,80px)] border-t ${cBd} flex justify-center items-center`}>
        <p className={`text-sm ${mu}`}>© Roy Carlous Christudass</p>
      </footer>

      {!chat && <button onClick={() => setChat(true)} className="fixed bottom-7 right-7 w-14 h-14 rounded-full border-none cursor-pointer flex items-center justify-center z-[999] transition-transform hover:scale-110" style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 8px 36px rgba(220,38,38,0.3)' }}><GeminiLogo /></button>}
      {chat && <AIChatbot dark={dark} messages={chatMsgs} setMessages={setChatMsgs} onClose={() => setChat(false)} />}
      {btt && <button onClick={() => go('hero')} className={`fixed bottom-7 left-7 w-10 h-10 rounded-full border ${cBd} backdrop-blur-xl ${su} cursor-pointer flex items-center justify-center z-[998] transition-all hover:-translate-y-0.5 ${dark ? 'bg-[#08080c]/80' : 'bg-white/80'}`}><Ic.Up /></button>}
    </div>
  )
}
