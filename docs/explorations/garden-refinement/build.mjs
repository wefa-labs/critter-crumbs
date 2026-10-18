import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
execFileSync('bun', ['run', `${here}generate-fixtures.ts`], { stdio: 'inherit' });
mkdirSync(`${here}lib`, { recursive: true });
execFileSync('bun', ['build', `${here}src/page.ts`, '--outdir', `${here}lib`, '--target', 'browser', '--format', 'iife', '--minify-syntax'], { stdio: 'inherit' });
// Koota's Number prototype methods require ESM's strict primitive `this` semantics.
writeFileSync(`${here}lib/page.js`, '/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- Generated review bundle. */\n"use strict";\n' + readFileSync(`${here}lib/page.js`, 'utf8'));
