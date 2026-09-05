import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['shared', 'core', 'app'].map((name) => ({
      test: { name, environment: 'node', include: [`packages/${name}/test/**/*.test.ts`] },
    })),
  },
});
