import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hex, parseAddress } from '@critter-crumbs/shared';
import type { Account } from '@critter-crumbs/core';

type CastRequest = { args: string[]; rpcUrl: string };
type CastRunner = (request: CastRequest) => Promise<string>;

/** Cast unlocks through the terminal; the application never reads the keystore or password. */
const runCast: CastRunner = async request => {
  const env: NodeJS.ProcessEnv = { ETH_RPC_URL: request.rpcUrl };
  for (const name of ['PATH', 'HOME', 'USER', 'LOGNAME', 'TERM', 'COLORTERM', 'TMPDIR', 'XDG_CONFIG_HOME', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy']) {
    if (process.env[name] !== undefined) env[name] = process.env[name];
  }
  const directory = await mkdtemp(join(tmpdir(), 'critter-foundry-run-'));
  try {
    // Cast loads dotenv/project configuration itself. Empty local files stop it
    // discovering project credentials after the environment has been filtered.
    await writeFile(join(directory, '.env'), '');
    await writeFile(join(directory, 'foundry.toml'), '');
    return await new Promise<string>((resolve, reject) => {
      // The password prompt uses the controlling terminal. Keep RPC diagnostics
      // out of output because they can contain credential-bearing endpoint URLs.
      const child = spawn('cast', request.args, { cwd: directory, env, stdio: ['inherit', 'pipe', 'ignore'] });
      let output = '';
      child.stdout?.setEncoding('utf8');
      child.stdout?.on('data', (chunk: string) => { output += chunk.slice(0, 8192 - output.length); });
      child.on('error', () => reject(new Error('Foundry cast could not start. Install Foundry and run from an interactive terminal.')));
      child.on('close', code => code === 0 ? resolve(output) : reject(new Error('Foundry send failed or was interrupted. Check the account and chain before retrying.')));
    });
  } finally { await rm(directory, { recursive: true, force: true }); }
};

/** Returns a broadcast hash. The caller still verifies the successful receipt. */
export function createFoundrySender(config: { accountName: string; chainId: 8453 | 84532; rpcUrl: string }, run: CastRunner = runCast): Required<Pick<Account, 'sendTransaction'>> {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(config.accountName)) throw new Error('Use a simple Foundry keystore account name, not a path.');
  return { async sendTransaction(tx) {
    const value = tx.value ?? 0n;
    if (value < 0n) throw new Error('Transaction value must be nonnegative.');
    const output = await run({ rpcUrl: config.rpcUrl, args: ['send', parseAddress(tx.to), '--data', hex(tx.data ?? '0x'), '--value', value.toString(), '--account', config.accountName, '--chain', String(config.chainId), '--async', '--color', 'never'] });
    return hex(output.trim(), 32);
  } };
}
