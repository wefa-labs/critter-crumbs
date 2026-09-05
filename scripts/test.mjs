import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
const args = process.argv.slice(2).filter(arg => arg !== '--');
const tooling = readdirSync('scripts').filter(name => name.endsWith('.test.mjs') && name !== 'development-assets.test.mjs').map(name => `scripts/${name}`);
for (const command of [
  [process.execPath, ['node_modules/typescript/bin/tsc', '-b']],
  [process.execPath, ['node_modules/vitest/vitest.mjs', 'run', ...args]],
  [process.execPath, ['--import', './scripts/no-network.mjs', '--test', ...tooling]],
]) {
  const result = spawnSync(command[0], command[1], { stdio: 'inherit', env: { ...process.env, CC_API_DATABASE: 'pglite' } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
