import { defineConfig } from 'playwright/test';
export default defineConfig({ testDir: './tests/screens', outputDir: '.scratch/screens/test-results', workers: 1, use: { baseURL: 'http://127.0.0.1:5173' } });
