import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Scoped to src/ so this never picks up Playwright's *.spec.ts files
    // under tests/, which use @playwright/test's own test runner.
    include: ['src/**/*.test.{ts,mjs}'],
  },
});
