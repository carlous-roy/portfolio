// Site-wide content: names, navigation, links and the hero and about copy.
// Edit content here, not in the section components.

export const NAME = 'Roy Carlous Christudass'
export const SHORT_NAME = 'Roy'
export const HEADLINE = 'AI Software Engineer'
export const TAGLINE = 'Machine learning, data and backend systems, built end to end'
export const SITE_URL = 'https://roycarlous.com'

export const CONTACT = {
  email: 'roy4edu@gmail.com',
  phone: '+13264671939',
  phoneDisplay: '+1 (326) 467-1939',
  github: 'https://github.com/carlous-roy',
  linkedin: 'https://linkedin.com/in/roy-carlous-c',
  location: 'Dayton, OH',
  formEndpoint: 'https://formspree.io/f/xqedbdpw',
}

export const RESUME_PATH = '/Roy_Resume.pdf'

// Greetings cycle in the hero. `lang` marks the language for assistive tech.
export const GREETINGS = [
  { text: 'வணக்கம்', lang: 'ta', duration: 4000 },
  { text: 'Hi', lang: 'en', duration: 2000 },
  { text: 'Bonjour', lang: 'fr', duration: 2000 },
  { text: 'Hola', lang: 'es', duration: 2000 },
  { text: 'नमस्ते', lang: 'hi', duration: 2000 },
  { text: '你好', lang: 'zh', duration: 2000 },
  { text: 'こんにちは', lang: 'ja', duration: 2000 },
  { text: 'مرحبا', lang: 'ar', duration: 2000 },
  { text: 'Привет', lang: 'ru', duration: 2000 },
]

export const NAV = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export const HERO_EDUCATION = [
  { degree: 'MS Computer Science', where: 'WSU, USA' },
  { degree: 'BE Electronics and Communication Engineering', where: 'SIST, India' },
]

export const PHOTOS = [
  { src: '/roy-default.jpg', width: 800, height: 800 },
  { src: '/roy.jpg', width: 800, height: 800 },
  { src: '/roy-casual.jpg', width: 800, height: 800 },
]

export const ABOUT = [
  "I'm a software engineer working on AI and data systems. Most of what I build ends up the same shape: data coming in, a model or some logic over it, an API in the middle, and a front end someone actually uses, and I like working across all of that rather than owning one layer.",
  "Before my master's I spent nearly three years at HCLTech, contracted to Teradyne, writing C++ and C#/.NET drivers for semiconductor test equipment. The software controlled physical hardware, so bugs were expensive and I got good at tracing them. I also ended up owning customer escalations and building the dashboards that tracked them, which is how I got into data work in the first place.",
  "I'm currently actively looking for full-time roles where I can bring real engineering rigor to high-impact problems.",
]
