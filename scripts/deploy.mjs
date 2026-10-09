import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ballotSchema, resultSchema, schemaUID } from '@critter-crumbs/core';

const args = process.argv.slice(2);
const execute = args.includes('--execute');
const target = args.includes('--production') ? 'production' : 'preview';
/* Production runs on testnet until the mainnet Shutter key arrives, and only when the operator says so (docs/decisions.md, 2026-10-08). */
const testnet = args.includes('--testnet');
if (new Set(args).size !== args.length || args.some(arg => !['--execute', '--production', '--testnet'].includes(arg))) throw new Error('Usage: deploy [--production [--testnet]] [--execute]. Default: print plan only.');
if (testnet && target !== 'production') throw new Error('--testnet applies only to --production; preview always uses testnet.');
const network = target === 'production' && !testnet ? 'mainnet' : 'testnet';
const steps = ['Confirm Vercel project, target-scoped environment variables and exact APP_ORIGIN.', 'Run the full check and build; review the changes.', 'Run migrations serially against the intended Neon branch.', 'Register missing EAS schemas separately, then run register-schemas --check.', 'Run the read-only Shutter preflight.', 'Generate the document CSP and deploy with the installed Vercel CLI.'];
if (!execute) console.log(JSON.stringify({ target, network, steps, execution: 'Add --execute only after the setup guide is complete. This wrapper does not migrate, seed, provision variables or register schemas.' }, null, 2));
else {
  const required = name => { if (!process.env[name]) throw new Error(`Missing ${name}`); return process.env[name]; };
  for (const name of ['VERCEL_PROJECT_ID', 'VERCEL_ORG_ID', 'APP_ORIGIN']) required(name);
  const origin = new URL(required('APP_ORIGIN'));
  if (origin.protocol !== 'https:' || origin.origin !== process.env.APP_ORIGIN) throw new Error('APP_ORIGIN must be an exact HTTPS origin without a trailing slash.');
  if (testnet && (process.env.SHUTTER_MODE !== 'chiado' || process.env.EAS_CHAIN_ID !== '84532')) throw new Error('Use Chiado and Base Sepolia with --testnet.');
  if (process.env.SHUTTER_MODE !== (network === 'mainnet' ? 'mainnet' : 'chiado')) throw new Error('Use Chiado for preview and verified mainnet settings for production.');
  if (process.env.EAS_CHAIN_ID !== (network === 'mainnet' ? '8453' : '84532')) throw new Error('EAS_CHAIN_ID does not match the deployment target.');
  for (const [name, expected] of Object.entries({ EAS_ADDRESS: '0x4200000000000000000000000000000000000021', EAS_BALLOT_SCHEMA_UID: schemaUID(ballotSchema), EAS_RESULT_SCHEMA_UID: schemaUID(resultSchema) })) {
    if (required(name).toLowerCase() !== expected) throw new Error(`${name} does not match the runtime contract.`);
  }
  const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
  if (!branch || branch !== required('VERCEL_DEPLOY_BRANCH')) throw new Error('Checked-out Git branch must match VERCEL_DEPLOY_BRANCH and its scoped Vercel variables.');
  if (!['0', 'false'].includes(required('DEV_ENDPOINTS_ENABLED'))) throw new Error('Hosted dev endpoints must be disabled.');
  if (required('VERCEL_PLAN') !== 'pro') throw new Error('The current API exceeds Hobby function limits. A reviewed packaging change is required for Hobby.');
  const region = required('VERCEL_REGION');
  if (!/^[a-z]{3}[1-9]$/.test(region)) throw new Error('Choose the Vercel function region nearest Neon.');
  const publicOrigin = name => {
    const url = new URL(required(name));
    if (url.protocol !== 'https:' || url.username || url.password || url.hostname.endsWith('.invalid')) throw new Error(`Invalid public endpoint: ${name}`);
    return url.origin;
  };
  const shutterOrigin = publicOrigin('SHUTTER_API_BASE'), baseOrigin = publicOrigin('VITE_BASE_RPC_URL');
  const run = (command, parameters) => {
    const result = spawnSync(command, parameters, { stdio: 'inherit', env: { ...process.env, VERCEL_TELEMETRY_DISABLED: '1' } });
    if (result.error || result.status !== 0) throw new Error('Deployment step failed; no subsequent step was run.');
  };
  run('bun', ['run', 'register-schemas', '--check']);
  run('bun', ['run', 'check:shutter']);
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const csp = config.headers.flatMap(rule => rule.headers).find(header => header.key === 'Content-Security-Policy');
  if (!csp?.value.includes('https://shutter-api.invalid') || !csp.value.includes('https://base-rpc.invalid')) throw new Error('Review the changed CSP template before deployment.');
  csp.value = csp.value.replace('https://shutter-api.invalid', shutterOrigin).replace('https://base-rpc.invalid', baseOrigin);
  config.regions = [region];
  await mkdir('.scratch/deployment', { recursive: true });
  const path = '.scratch/deployment/vercel.json';
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`);
  run(resolve('node_modules/.bin/vercel'), ['deploy', '--yes', '--local-config', path, ...(target === 'production' ? ['--prod'] : [])]);
}
