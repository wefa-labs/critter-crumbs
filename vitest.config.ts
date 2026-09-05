import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [...['shared', 'core', 'app'].map((name) => ({
      test: { name, environment: 'node', setupFiles: ['./scripts/no-network.mjs'], include: [`packages/${name}/test/**/*.test.ts`] },
    })), { test: { name: 'api', environment: 'node', setupFiles: ['./scripts/no-network.mjs'], include: ['tests/api/**/*.test.ts'], testTimeout: 15000 } }],
  },
});
