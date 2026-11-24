import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// In dev, /api is proxied to the Spring Boot app on :8080.
// In production the built files are served by Spring Boot itself (same origin).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
