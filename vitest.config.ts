import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Core game logic is pure and DOM-free, so the default node environment is
    // sufficient. Component tests opt into jsdom per-file via
    // `// @vitest-environment jsdom`.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
