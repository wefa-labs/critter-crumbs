import { expect, test, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFoundrySender } from '../../scripts/deployment/foundry.js';

test('deployment EAS sender broadcasts with a named Foundry keystore and returns the transaction hash', async () => {
  const sender = createFoundrySender({ accountName: 'critter-deployer', chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid/credential' }, async request => {
    expect(request.args).toContain('--account');
    expect(request.args[request.args.indexOf('--account') + 1]).toBe('critter-deployer');
    expect(request.args[request.args.indexOf('--chain') + 1]).toBe('84532');
    expect(request.args).toContain('--async');
    expect(request.args).not.toContain('--private-key');
    expect(request.args).not.toContain('--password');
    expect(request.args.join(' ')).not.toContain('credential');
    expect(request.rpcUrl).toBe('https://rpc.fixture.invalid/credential');
    return `0x${'11'.repeat(32)}\n`;
  });
  await expect(sender.sendTransaction({ to: '0x4200000000000000000000000000000000000020', data: '0x1234', value: 0n })).resolves.toBe(`0x${'11'.repeat(32)}`);
});
test('deployment EAS sender isolates Foundry from inherited signer settings and project environment files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'critter-foundry-fixture-'));
  try {
    await writeFile(join(directory, 'cast'), `#!${process.execPath}
const fs = require('node:fs'), path = require('node:path');
const repository = fs.realpathSync(${JSON.stringify(process.cwd())});
const cwd = fs.realpathSync(process.cwd());
if (cwd === repository || cwd.startsWith(repository + path.sep) || repository.startsWith(cwd + path.sep)) process.exit(1);
if (fs.readFileSync('.env', 'utf8') !== '' || !fs.existsSync('foundry.toml')) process.exit(1);
const forbidden = ['ETH_KEYSTORE', 'ETH_KEYSTORE_ACCOUNT', 'ETH_PASSWORD', 'ETH_FROM', 'DEPLOYER_PRIVATE_KEY', 'TEMPO_ACCESS_KEY'];
if (forbidden.some(name => name in process.env) || process.env.ETH_RPC_URL !== 'https://rpc.fixture.invalid') process.exit(1);
console.log('0x' + '22'.repeat(32));
`, { mode: 0o700 });
    vi.stubEnv('PATH', directory);
    for (const name of ['ETH_KEYSTORE', 'ETH_KEYSTORE_ACCOUNT', 'ETH_PASSWORD', 'ETH_FROM', 'DEPLOYER_PRIVATE_KEY', 'TEMPO_ACCESS_KEY']) vi.stubEnv(name, 'fixture-must-not-be-forwarded');
    const sender = createFoundrySender({ accountName: 'critter-deployer', chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid' });
    await expect(sender.sendTransaction({ to: '0x4200000000000000000000000000000000000020' })).resolves.toBe(`0x${'22'.repeat(32)}`);
  } finally { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); }
});
test('deployment EAS sender stops on an uncertain Foundry failure without resubmission', async () => {
  let sends = 0;
  const sender = createFoundrySender({ accountName: 'critter-deployer', chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid' }, async () => { sends++; throw new Error('Uncertain send'); });
  await expect(sender.sendTransaction({ to: '0x4200000000000000000000000000000000000020' })).rejects.toThrow('Uncertain send');
  expect(sends).toBe(1);
});
