// Skills grid: the full list per category and the six tiles shown on each card.

export const SKILLS = {
  Languages: ['Python', 'Java', 'C++', 'C#/.NET', 'JavaScript', 'SQL', 'VBT (IG-XL)', 'HTML/CSS'],
  'AI & ML': [
    'scikit-learn',
    'Gradient Boosting',
    'Calibration',
    'SHAP',
    'sentence-transformers',
    'Embeddings',
    'pgvector',
    'BM25',
    'Hybrid Retrieval',
    'Retrieval Evaluation',
    'TF-IDF',
    'Ollama',
    'Gemini API',
    'OpenCV',
    'MediaPipe',
    'Tree-sitter',
  ],
  'Backend & Distributed': [
    'Spring Boot',
    'FastAPI',
    'REST API Design',
    'AWS SQS',
    'DynamoDB',
    'AWS S3',
    'Idempotency',
    'Retries & Dead-Letter Queues',
    'Rate Limiting',
    'Graceful Shutdown',
    'PostgreSQL',
    'MySQL',
    'SQLAlchemy',
    'Alembic',
    'Docker Compose',
    'Testcontainers',
    'LocalStack',
    'GitHub Actions',
    'Git',
    'Maven',
  ],
  'Frontend & Cloud': [
    'React 18',
    'Vite',
    'Tailwind CSS',
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
    'Acceptance Test Automation',
    'VersionVault (ClearCase)',
    'WinDbg / cdb.exe',
    'JetBrains dotTrace',
    'pytest',
    'JUnit',
    'Vitest',
    'Arduino',
    'Firmata',
    'Serial Protocols',
  ],
  'Data & BI': [
    'Power BI (DAX)',
    'SQL Server',
    'PostgreSQL',
    'MySQL',
    'pandas',
    'NumPy',
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
    { label: 'Tree-sitter' },
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
