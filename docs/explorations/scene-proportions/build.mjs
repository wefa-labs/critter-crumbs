// Rebuild the static review mocks without importing an exploration into the app.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
execFileSync('bun', ['build', `${here}src/mocks.ts`, '--outfile', `${here}lib/mocks.js`, '--target', 'browser', '--format', 'iife', '--minify-syntax'], { stdio: 'inherit' });
const bundle = `${here}lib/mocks.js`;
writeFileSync(bundle, '/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- Generated bundle; lint src instead. */\n' + readFileSync(bundle, 'utf8'));
