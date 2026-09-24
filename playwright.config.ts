import { defineConfig } from 'playwright/test';

export default defineConfig({
  // The local mock clock is shared across rehearsals.
  workers: 1,
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:5173' },
  forbidOnly: Boolean(process.env.CI),
});
