import { spawnSync } from 'node:child_process';
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL to a disposable Neon branch before running test:api:neon.');
const args = process.argv.slice(2).filter(arg => arg !== '--');
for (const command of [
  ['node_modules/typescript/bin/tsc', '-b'],
  ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.neon.config.ts', ...args],
]) {
  const result = spawnSync(process.execPath, command, { stdio: 'inherit', env: { ...process.env, CC_API_DATABASE: 'neon' } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
