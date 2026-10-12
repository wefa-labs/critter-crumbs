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
  {
    // fiber's <Canvas> registers every export of three so that any can be written as an element, and a library named
    // whole cannot be trimmed: it put all of three in the 3D chunk (docs/decisions.md, 2026-10-12).
    files: ['packages/app/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { paths: [{ name: '@react-three/fiber', importNames: ['Canvas'], message: 'Mount the scene through createRoot, as three/scene.tsx does: <Canvas> keeps all of three in the 3D chunk.' }] }] },
  },
];
