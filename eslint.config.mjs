import parser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';
import critterCrumbs from './scripts/eslint-rules.mjs';

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '.git/**', '.agents/**', '.claude/**', '.scratch/**', '.vercel/**', 'playwright-report/**', 'test-results/**'] },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: { parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } } },
    plugins: { '@typescript-eslint': typescript, 'critter-crumbs': critterCrumbs },
    rules: {
      ...typescript.configs.recommended.rules,
      'critter-crumbs/no-html': 'error',
      'critter-crumbs/time-as-input': 'error',

    },
  },
  {
    files: ['packages/*/src/**/*.{ts,tsx,js,jsx,mjs}', 'api/**/*.{ts,js,mjs}'],
    rules: { 'critter-crumbs/imports': 'error' },
  },
  {
    files: ['packages/app/src/**/*.{tsx,jsx}', 'packages/app/src/{components,screens}/**/*.{ts,js}'],
    rules: { 'critter-crumbs/copy-ids': 'error' },
  },
];
