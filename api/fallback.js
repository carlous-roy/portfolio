// Answers the route serves itself when no model can be reached: no key set,
// quota spent, an upstream error or a timeout. They are written from the same
// facts as the system instruction in knowledge.js and chosen by the words in
// the visitor's latest message, so the dialog always answers the questions it
// suggests, and the common ones besides, instead of reporting a failure.
//
// The matching is deliberately small: a list of topics, each with a pattern,
// scored by how many of its words appear in the question. Ties go to the
// topic listed first, which is why the specific topics (one project, a
// boundary) come before the general ones (projects, about).

import { CONTACT_EMAIL, CONTACT_PHONE } from './knowledge.js'

const CONTACT_LINE = `Call or text ${CONTACT_PHONE}, email ${CONTACT_EMAIL}, or find him on LinkedIn at linkedin.com/in/roy-carlous-c and on GitHub at github.com/carlous-roy.`

export const ANSWERS = {
  personal: `That's one for Roy himself: email him at ${CONTACT_EMAIL}. I can tell you about his work, his projects and his skills.`,

  thanks:
    "You're welcome. Ask me anything else about Roy's work, his projects or how to reach him.",

  greeting:
    "Hi. Ask me about Roy's work at HCLTech, the four projects he has built, his skills and education, or how to reach him.",

  about: `Roy Carlous Christudass is a software engineer. He spent January 2022 to August 2024 at HCLTech, contracted to Teradyne, writing and debugging the C++ and C#/.NET drivers that run inside semiconductor test equipment, then finished a master's in computer science at Wright State University in August 2026 and built four public projects around machine learning, retrieval and distributed systems. He is in the US, open to relocation anywhere in the country, and looking for a full-time backend, machine learning or data role. The shape he keeps coming back to: data coming in, a model or some logic over it, an API in the middle, and a front end someone uses.`,

  work: `Roy spent January 2022 to August 2024 at HCLTech, contracted to Teradyne in Chennai, on the C++ and C#/.NET drivers for analog instruments in Teradyne's IG-XL platform, where a driver defect can stop a customer's production line. He started as a Graduate Engineer Trainee reproducing customer-reported defects on the DC30 and UVI80 instruments, resolved about a hundred defects end to end as a Software Engineer from August 2022, and as a Senior Software Engineer from January 2024 was the single escalation point for production-stopping issues during the IG-XL .NET migration, with zero production stoppers on the releases he managed. Along the way he built the team's Power BI defect dashboards on a SQL Server mirror of Jira and wrote Python tooling around cdb.exe and dotTrace to catch memory and runtime regressions between nightly builds.`,

  education: `Roy has an MS in Computer Science from Wright State University in Fairborn, Ohio, completed in August 2026, with coursework in Foundations of AI, Information Retrieval, Algorithm Design and Analysis, Distributed Computing, Advanced Computer Networks, and Reverse Engineering and Program Analysis. Before that he did a BE in Electronics and Communication Engineering at Sathyabama Institute of Science and Technology in Chennai, 2018 to 2022.`,

  skills: `Languages: Python, Java, C++, C#/.NET, JavaScript and SQL. Machine learning and retrieval: scikit-learn, gradient boosting with calibration and SHAP, embeddings and pgvector, BM25 and hybrid retrieval, Tree-sitter, OpenCV and MediaPipe. Backend: Spring Boot, FastAPI, SQS, DynamoDB and S3, and the patterns around them: idempotency, retries, dead-letter queues, graceful shutdown. Data and tooling: PostgreSQL, SQL Server, Power BI, Docker, GitHub Actions, Testcontainers and LocalStack, pytest, JUnit and Vitest. From the Teradyne years: IG-XL on UltraFLEX and UltraFLEXplus, WinDbg and cdb, dotTrace, VersionVault.`,

  projects: `Roy has four public projects, each with its code on GitHub. DiffLens is a code review service: Tree-sitter analysis of Python and Java, a change-risk model trained on ApacheJIT with a held-out ROC-AUC of 0.80, and a GitHub webhook that posts the review. TaskForge is a distributed report-generation system on Spring Boot and AWS, built around the failure path: transactional idempotency, jittered retries, a dead-letter queue and a graceful drain. GestureControl turns webcam hand gestures into relay switching, with a One Euro filter, finger rules in the hand's own frame and fail-safe Arduino relays. CodeAtlas is semantic code search with an evaluation harness that reports hit rate, MRR and bootstrap intervals over a pinned corpus. Three have browser demos and the fourth a case study; the Projects section has the links.`,

  difflens: `DiffLens is a code review service. Tree-sitter parses Python and Java into syntax trees, so cyclomatic complexity and nesting depth come from the tree and the rules never fire inside comments or strings. A gradient-boosting change-risk model, trained on ApacheJIT (about 106,000 labelled commits from fifteen Apache projects) with a temporal split and isotonic calibration, scores each pull request and reports the features behind the score; on held-out data it reaches ROC-AUC 0.80. Findings are embedded into pgvector and clustered, so a review can say a problem has been seen before, and a GitHub webhook posts the review as one comment that is updated on every push. FastAPI, scikit-learn, PostgreSQL, React, 291 tests. Code at github.com/carlous-roy/DiffLens-Engine, demo at difflens.roycarlous.com.`,

  taskforge: `TaskForge is a distributed report-generation system built for the failure path. A REST API accepts jobs, workers pull them from SQS, and reports land in S3 behind presigned links. Idempotency keys are enforced with a single DynamoDB transaction, so a duplicate submission gets a 409 with the original job id even under concurrent requests; retries use full-jitter backoff through the queue's visibility timeout; a job moves to a dead-letter queue after three attempts and a consumer records why; every write is conditional on a version; correlation ids follow a job from the request to the stored object; and a SIGTERM lets in-flight work finish. Java 17, Spring Boot, AWS SDK, LocalStack in the tests: 106 unit and 19 integration tests. Code at github.com/carlous-roy/TaskForge-Engine, demo at taskforge.roycarlous.com.`,

  gesturecontrol: `GestureControl is a webcam-to-relay control loop that began as Roy's final-year project in 2022 and was rebuilt in 2026. MediaPipe tracks the hand landmarks, a One Euro filter removes jitter, and finger state is read in the hand's own frame, along the axis from the wrist to the middle knuckle and scaled by palm width, so rotating the hand or moving closer to the camera does not change the count; a hysteresis band and a three-frame confirmation stop flicker before anything reaches the relays. The relays are switched over Firmata on an Arduino and released whenever the program exits or loses the serial link, and an Arduino watchdog drops them within a second if the host disappears. A simulation mode replays recorded hands through the real pipeline, and a JavaScript port shares the rules and test vectors with the Python code. 537 tests. Code at github.com/carlous-roy/GestureControl-Engine, demo at gesture.roycarlous.com.`,

  codeatlas: `CodeAtlas is semantic search over a codebase, and the measurement that says how well it works. The corpus is pinned to exact commits of four projects (116 files, about 11,800 lines) with a checksum manifest, so anyone can regenerate the numbers. Thirty-six labelled questions are scored across six retrieval strategies and three chunking strategies with bootstrap confidence intervals on every figure. The shipped configuration, hybrid BM25 and embedding retrieval with a per-file cap, reaches a hit rate of 0.81 in the top five and a mean reciprocal rank of 0.58; the cap lifts recall at five from 0.57 to 0.65, several differences that looked interesting are within noise at thirty-six questions, and a cross-encoder reranker made ranking worse. Code at github.com/carlous-roy/CodeAtlas, case study at roycarlous.com/case-studies/codeatlas.html.`,

  site: `This site is a React 18 and Vite app Roy built himself, with this assistant served through a small server-side route that holds the prompt and the key, validates every request and limits how much one caller can send. The answers come from Gemini when it is reachable and from the same facts on the server when it is not. The source is at github.com/carlous-roy/portfolio.`,

  hobbies: `Outside work: photography on a Sony A7 V (the photos on this site are his), cricket, football, Formula 1, UFC, cinema (Nolan, Villeneuve, Tamil cinema) and music (A. R. Rahman, The Weeknd, Linkin Park, Hans Zimmer).`,

  availability: `Roy finished his master's in August 2026 and is available now for full-time roles in backend, machine learning or data engineering. He is in the US and open to relocation anywhere in the country. Email ${CONTACT_EMAIL} or call ${CONTACT_PHONE} to talk about a role; timing, compensation and work authorization are best discussed with him directly.`,

  contact: `${CONTACT_LINE} He is in the US and open to relocation anywhere in the country.`,

  default: `I can tell you about Roy's work at HCLTech, his four projects (DiffLens, TaskForge, GestureControl and CodeAtlas), his skills and education, and how to reach him. For anything else, ${CONTACT_EMAIL} reaches him directly.`,
}

// Topic patterns, in priority order. Each is scored by its number of matches
// in the lower-cased question; the highest score wins and ties go to the
// earlier entry.
const RULES = [
  [
    'personal',
    /\b(salary|salaries|compensation|pay|paid|visa|sponsor\w*|authori[sz]\w*|work in the (us|usa|united states)|eligib\w*|citizen\w*|h-?1b|opt|green card|religio\w*|politic\w*|married|marriage|girlfriend|wife|dating|how old|birthday|ethnicit\w*|caste)\b/g,
  ],
  ['thanks', /\b(thanks|thank you|thx|cheers)\b/g],
  ['greeting', /^\s*(hi|hello|hey|hiya|yo|howdy|good (morning|afternoon|evening))\b/g],
  ['difflens', /\b(difflens|diff lens|code review|risk model|apachejit|tree-?sitter|pgvector)\b/g],
  [
    'taskforge',
    /\b(taskforge|task forge|sqs|dynamodb|report generation|idempoten\w*|dead-? ?letter|backoff)\b/g,
  ],
  [
    'gesturecontrol',
    /\b(gesture\w*|mediapipe|relays?|arduino|webcam|hand landmarks?|firmata|one euro)\b/g,
  ],
  [
    'codeatlas',
    /\b(codeatlas|code atlas|semantic (code )?search|retrieval|bm25|embeddings?|rag|reranker|evaluation harness)\b/g,
  ],
  [
    'availability',
    /\b(looking for|open to|available|availability|hire|hiring|job search|seeking|what (kind of |sort of |type of )?(jobs?|roles?|positions?) (is he|does he|would he)|start date|notice period|full-?time|intern\w*|interview\w*|relocat\w*|fit for|good fit)\b/g,
  ],
  [
    'work',
    /\b(hcl|hcltech|teradyne|experience|career|jobs?|employ\w*|employer|roles?|escalations?|drivers?|semiconductor|instruments?|worked|work (there|at|for|history|experience)|responsibilit\w*|ig-?xl|ultraflex\w*|chennai|how long)\b/g,
  ],
  [
    'education',
    /\b(educat\w*|school|universit\w*|college|wright|degrees?|master'?s?|m\.?s\.?|bachelor'?s?|undergrad\w*|coursework|courses?|gpa|study|studied|graduat\w*|sathyabama)\b/g,
  ],
  [
    'contact',
    /\b(contact|e-?mail|reach|connect|linkedin|github|resume|cv|phone|call him|message|located|based|location|where (is|does) he (live|work|stay)|which (city|state))\b/g,
  ],
  [
    'skills',
    /\b(skills?|tech(nolog\w*)?|stack|languages?|frameworks?|tools?|cloud|aws|docker|react|java|python|c\+\+|c#|\.net|sql|spring|fastapi|kubernetes|typescript|javascript|proficien\w*|good at)\b/g,
  ],
  [
    'projects',
    /\b(projects?|built|build|portfolio|demos?|code|open source|repos?|repositor\w*)\b/g,
  ],
  [
    'hobbies',
    /\b(hobb\w*|interests?|cricket|football|soccer|f1|formula|ufc|music|photo\w*|camera|movies?|films?|cinema|sports?|fun|free time|outside work|weekends?)\b/g,
  ],
  [
    'site',
    /\b(this site|website|this page|assistant|chatbot|bot|are you (an? )?(ai|human|real|bot)|what are you|who are you|gemini|built this|made this)\b/g,
  ],
  [
    'about',
    /\b(who is roy|who'?s roy|about roy|about him|what does he do|does roy do|introduce|introduction|background|overview|summary|summari[sz]e|in short|elevator pitch|bio|why (should|would) (i|we)|different from|unique|stand out|strengths?)\b/g,
  ],
]

// Returns the best topic for a question, or 'default' when nothing matches.
export function pickTopic(question) {
  const q = String(question || '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
  let best = 'default'
  let bestScore = 0
  for (const [topic, re] of RULES) {
    re.lastIndex = 0
    const score = (q.match(re) || []).length
    if (score > bestScore) {
      best = topic
      bestScore = score
    }
  }
  return best
}

export function fallbackReply(question) {
  const topic = pickTopic(question)
  return { topic, reply: ANSWERS[topic] }
}
