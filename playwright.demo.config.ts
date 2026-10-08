import {defineConfig} from 'playwright/test';
export default defineConfig({testDir:'./tests/demo',outputDir:'.scratch/demo/test-results',workers:1,timeout:180000,use:{baseURL:'http://127.0.0.1:5173'}});
