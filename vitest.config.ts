import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
    },
    environment: 'node',
    globals: true,
    hookTimeout: 120000,
    include: ['src/**/*.test.ts'],
    // Avoid parallel suites so Docker port 8000 isn’t claimed twice
    maxWorkers: 1,
  },
});
