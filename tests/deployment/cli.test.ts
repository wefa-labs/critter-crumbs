import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';
import { ballotSchema, resultSchema, schemaUID } from '@critter-crumbs/core';

const env = { VERCEL_PROJECT_ID: 'fixture-project', VERCEL_ORG_ID: 'fixture-org', APP_ORIGIN: 'https://fixture.invalid', SHUTTER_MODE: 'chiado', EAS_CHAIN_ID: '84532', DEV_ENDPOINTS_ENABLED: '0', VERCEL_PLAN: 'pro', VERCEL_REGION: 'iad1', SHUTTER_API_BASE: 'https://shutter-api.chiado.staging.shutter.network', VITE_BASE_RPC_URL: 'https://rpc.example.com', VERCEL_DEPLOY_BRANCH: 'fixture-not-current' };

test('deployment CLI defaults to an offline plan without credentials or mutations', () => {
  const output = execFileSync(process.execPath, ['--import', './scripts/no-network.mjs', 'scripts/deploy.mjs'], { encoding: 'utf8', env: {} });
  expect(JSON.parse(output)).toMatchObject({ target: 'preview' });
});
test('deployment CLI refuses execution before project configuration is supplied', () => {
  expect(() => execFileSync(process.execPath, ['--import', './scripts/no-network.mjs', 'scripts/deploy.mjs', '--execute'], { encoding: 'utf8', env: {}, stdio: 'pipe' })).toThrow('Missing VERCEL_PROJECT_ID');
});
test('deployment CLI rejects incorrect runtime EAS configuration before network calls', () => {
  expect(() => execFileSync(process.execPath, ['--import', './scripts/no-network.mjs', 'scripts/deploy.mjs', '--execute'], { encoding: 'utf8', env: { ...env, EAS_ADDRESS: '0x1111111111111111111111111111111111111111' }, stdio: 'pipe' })).toThrow('EAS_ADDRESS does not match');
});
test('deployment CLI rejects a branch that differs from the configured deployment branch', () => {
  expect(() => execFileSync(process.execPath, ['--import', './scripts/no-network.mjs', 'scripts/deploy.mjs', '--execute'], { encoding: 'utf8', env: { ...env, EAS_ADDRESS: '0x4200000000000000000000000000000000000021', EAS_BALLOT_SCHEMA_UID: schemaUID(ballotSchema), EAS_RESULT_SCHEMA_UID: schemaUID(resultSchema) }, stdio: 'pipe' })).toThrow('Checked-out Git branch must match');
});
