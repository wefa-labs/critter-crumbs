import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';

test('deployment CLI defaults to an offline plan without credentials or mutations', () => {
  const output = execFileSync(process.execPath, ['--import', './scripts/no-network.mjs', 'scripts/deploy.mjs'], { encoding: 'utf8', env: {} });
  expect(JSON.parse(output)).toMatchObject({ target: 'preview' });
});
test('deployment CLI refuses execution before project configuration is supplied', () => {
  expect(() => execFileSync(process.execPath, ['--import', './scripts/no-network.mjs', 'scripts/deploy.mjs', '--execute'], { encoding: 'utf8', env: {}, stdio: 'pipe' })).toThrow('Missing VERCEL_PROJECT_ID');
});
