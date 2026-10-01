import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
      'apps/**/*.test.ts',
      'apps/**/*.spec.ts',
    ],
    passWithNoTests: false,
  },
});
