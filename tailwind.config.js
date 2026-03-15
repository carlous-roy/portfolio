/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display', 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont',
          'system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
        mono: [
          'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace',
        ],
      },
    },
  },
  plugins: [],
}
