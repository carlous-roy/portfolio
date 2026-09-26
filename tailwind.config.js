/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Colours resolve to the CSS variables in src/styles/index.css, which
      // switch with data-theme. No dark: variants are needed for colour.
      colors: {
        bg: 'var(--bg)',
        tx: 'var(--tx)',
        su: 'var(--su)',
        mu: 'var(--mu)',
        accent: 'var(--accent)',
        'accent-text': 'var(--accent-text)',
        'accent-soft': 'var(--accent-soft)',
        surface: 'var(--surface)',
        chip: 'var(--chip)',
        edge: 'var(--edge)',
        line: 'var(--line)',
        nav: 'var(--nav)',
        menu: 'var(--menu)',
        'chat-ai': 'var(--chat-ai)',
        'chat-user': 'var(--chat-user)',
        'chat-input': 'var(--chat-input)',
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
