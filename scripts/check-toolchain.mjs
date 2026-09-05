import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const expected = readFileSync(new URL('../.bun-version', import.meta.url), 'utf8').trim();
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const release = JSON.parse(readFileSync(new URL('./bun-release.json', import.meta.url), 'utf8'));
assert.equal(manifest.packageManager, `bun@${expected}`);
assert.equal(manifest.engines.bun, expected);
assert.equal(release.version, expected);
const bun = spawnSync('bun', ['--version'], { encoding: 'utf8' });
assert.equal(bun.status, 0, 'Bun must be installed and available on PATH.');
assert.equal(bun.stdout.trim(), expected, `Use Bun ${expected}.`);
const [major, minor, patch] = process.versions.node.split('.').map(Number);
assert(major === 22 && (minor > 22 || (minor === 22 && patch >= 1)), 'Use Node 22.22.1 or a newer Node 22 patch for the function toolchain.');
console.log(`Bun ${expected}; Node ${process.version}.`);
