import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localApi } from './scripts/local-api.js'

// The chat route in api/ is a Vercel function. In development and in
// `vite preview` the localApi plugin mounts the same handler on /api/chat so the
// assistant can be exercised without the Vercel CLI. Keys are read from .env by
// the plugin (server side only; nothing from .env reaches the client bundle).
export default defineConfig({
  plugins: [react(), localApi()],
  server: { port: 5173, host: true },
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'node',
    include: ['api/**/*.test.js', 'src/**/*.test.js', 'scripts/**/*.test.js'],
  },
})
