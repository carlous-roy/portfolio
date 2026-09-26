// Skills grid: the full list per category and the six tiles shown on each card.

export const SKILLS = {
  Languages: ['Python', 'Java', 'C++', 'C#/.NET', 'JavaScript', 'SQL', 'HTML/CSS'],
  'AI & ML': [
    'scikit-learn',
    'Feature Engineering',
    'Embeddings',
    'Semantic Search',
    'BM25',
    'Hybrid Retrieval (BM25 + dense)',
    'Retrieval Evaluation',
    'TF-IDF',
    'Ollama',
    'CodeLlama',
    'Gemini API',
    'Claude',
    'OpenCV',
    'MediaPipe',
    'Tree-sitter',
  ],
  'Backend & Distributed': [
    'Spring Boot',
    'FastAPI',
    'REST API Design',
    'Message Queues',
    'Async Job Processing',
    'Retries & DLQ',
    'Idempotency',
    'Rate Limiting',
    'AWS SQS',
    'AWS S3',
    'DynamoDB',
    'PostgreSQL',
    'MySQL',
    'SQLAlchemy',
    'Alembic',
    'Docker',
    'Docker Compose',
    'LocalStack',
    'Git',
    'Maven',
  ],
  'Frontend & Cloud': [
    'React 18',
    'Vite',
    'Tailwind CSS',
    'PostCSS',
    'HTML5 Canvas',
    'Responsive Layout',
    'Dark Mode',
    'Vercel',
    'Nginx',
  ],
  'Test & Embedded': [
    'Teradyne IG-XL',
    'UltraFLEX',
    'UltraFLEXplus',
    'Instrument Drivers',
    'Telemetry Acquisition',
    'Root-Cause Analysis',
    'WinDbg',
    'JetBrains Profilers',
    'Acceptance Test Automation',
    'pytest',
    'JUnit',
    'Arduino',
    'ESP8266',
    'Serial Protocols',
  ],
  'Data & BI': [
    'Power BI Dashboards',
    'SQL',
    'PostgreSQL',
    'MySQL',
    'pandas',
    'NumPy',
    'ETL Pipelines',
    'KPI & Trend Reporting',
  ],
}

// Exactly six tiles per category, laid out 3 x 2.
//
// Some of these tools have a brand icon and some do not: BM25 and Power BI are
// real parts of the work with no logo to show. Rather than pad the grid with
// something adjacent just to reach six, a tile without an icon renders as a
// short label in the same square.
//
// `icon` names a self-hosted SVG pair in /skill-icons (<icon>-dark.svg and
// <icon>-light.svg, taken once from skillicons.dev, MIT licensed); `file` names
// a PNG in the same folder for tools that set has no icon for. Each logo appears
// on exactly one card. A tile falls back to its label if the image fails.
export const SKILL_TILES = {
  Languages: [
    { icon: 'py', label: 'Python' },
    { icon: 'java', label: 'Java' },
    { icon: 'cpp', label: 'C++' },
    { icon: 'cs', label: 'C#' },
    { icon: 'js', label: 'JavaScript' },
    { icon: 'html', label: 'HTML' },
  ],
  'AI & ML': [
    { icon: 'sklearn', label: 'scikit-learn' },
    { icon: 'opencv', label: 'OpenCV' },
    { file: 'mediapipe', label: 'MediaPipe' },
    { file: 'ollama', label: 'Ollama' },
    { file: 'gemini', label: 'Gemini API' },
    { file: 'claude', label: 'Claude' },
  ],
  'Backend & Distributed': [
    { icon: 'spring', label: 'Spring' },
    { icon: 'fastapi', label: 'FastAPI' },
    { icon: 'aws', label: 'AWS' },
    { icon: 'dynamodb', label: 'DynamoDB' },
    { icon: 'docker', label: 'Docker' },
    { file: 'restapi', label: 'REST APIs' },
  ],
  'Frontend & Cloud': [
    { icon: 'react', label: 'React' },
    { icon: 'vite', label: 'Vite' },
    { icon: 'tailwind', label: 'Tailwind' },
    { icon: 'css', label: 'CSS' },
    { icon: 'vercel', label: 'Vercel' },
    { icon: 'nginx', label: 'Nginx' },
  ],
  'Test & Embedded': [
    { icon: 'arduino', label: 'Arduino' },
    { file: 'igxl', label: 'Teradyne IG-XL' },
    { file: 'ultraflex', label: 'UltraFLEXplus' },
    { file: 'windbg', label: 'WinDbg' },
    { file: 'pytest', label: 'pytest' },
    { file: 'junit', label: 'JUnit' },
  ],
  'Data & BI': [
    { icon: 'postgres', label: 'Postgres' },
    { icon: 'mysql', label: 'MySQL' },
    { file: 'powerbi', label: 'Power BI' },
    { file: 'pandas', label: 'pandas' },
    { file: 'numpy', label: 'NumPy' },
    { file: 'sql', label: 'SQL' },
  ],
}
