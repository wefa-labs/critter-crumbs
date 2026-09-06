import { defineConfig } from 'vitest/config';
// Explicit opt-in only: every API fixture gets an isolated schema on DATABASE_URL.
export default defineConfig({ test: { name: 'api-neon', environment: 'node', maxWorkers: 1, include: ['tests/api/**/*.test.ts'], testTimeout: 60000 } });
