// Builds lib/directions.js, the review page's one classic script, from src/page.ts and the app's own painters and
// layout. A classic script, so index.html opens from the file system without a server.
// Run from the repository root: mise exec node@22.22.1 -- node docs/explorations/critter-directions/build.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
execFileSync('bun', ['build', `${here}src/page.ts`, '--outfile', `${here}lib/directions.js`, '--target', 'browser', '--format', 'iife', '--minify-syntax'], { stdio: 'inherit' });

const bundle = `${here}lib/directions.js`;
writeFileSync(bundle, '/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- Generated bundle; lint src instead. */\n' + readFileSync(bundle, 'utf8'));
