import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Core game logic is pure and DOM-free, so the default node environment is
    // sufficient. Components that need the DOM can opt in per-file later.
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
})
