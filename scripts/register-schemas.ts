import { ballotSchema, prepareSchemaRegistration, resultSchema } from '@critter-crumbs/core';
import type { Account } from '@critter-crumbs/core';
import { createPublicClient, http } from 'viem';
import { parseArgs } from 'node:util';
import { base, baseSepolia } from 'viem/chains';
import { schemaSetup } from './deployment/eas.js';
import { createFoundrySender } from './deployment/foundry.js';
const { values } = parseArgs({ options: { chain: { type: 'string' }, account: { type: 'string' }, check: { type: 'boolean' }, execute: { type: 'boolean' } }, strict: true, allowPositionals: false });
if (values.check && values.execute) throw new Error('Choose --check or --execute, not both.');
const mode = values.execute ? '--execute' : values.check ? '--check' : undefined;
const chainId = Number(values.chain ?? process.env.EAS_CHAIN_ID ?? '84532');
if (chainId !== 8453 && chainId !== 84532) throw new Error('Choose Base 8453 or Base Sepolia 84532.');
const schemas = [ballotSchema, resultSchema].map(schema => ({ schema, ...prepareSchemaRegistration(schema) }));
if (!mode) console.log(JSON.stringify({ chainId, schemas }, (_key, value: unknown) => typeof value === 'bigint' ? value.toString() : value, 2));
else {
  try {
    const rpcUrl = process.env.BASE_RPC_URL;
    if (!rpcUrl) throw new Error('Missing BASE_RPC_URL');
    let account: Pick<Account, 'sendTransaction'> | undefined;
    if (mode === '--execute') {
      const accountName = values.account ?? process.env.FOUNDRY_ACCOUNT;
      if (!accountName) throw new Error('Choose a Foundry keystore with --account NAME or FOUNDRY_ACCOUNT.');
      const foundry = createFoundrySender({ accountName, chainId, rpcUrl });
      const chain = chainId === 8453 ? base : baseSepolia;
      const transport = http(rpcUrl, { retryCount: 0 });
      const client = createPublicClient({ chain, transport });
      account = { sendTransaction: async tx => {
        const hash = await foundry.sendTransaction(tx);
        console.log(JSON.stringify({ chainId, transactionHash: hash, status: 'submitted' }));
        const receipt = await client.waitForTransactionReceipt({ hash, confirmations: 2, timeout: 180000 });
        if (receipt.status !== 'success') throw new Error('Schema transaction reverted');
        return hash;
      } };
    }
    const result = await schemaSetup({ chainId, rpcUrl, ...(account ? { account } : {}) });
    console.log(JSON.stringify({ chainId, schemas: result }, null, 2));
    if (result.some(record => record.status === 'missing')) process.exitCode = 1;
  } catch {
    console.error('EAS setup failed. Check BASE_RPC_URL, the chain and your Foundry --account/FOUNDRY_ACCOUNT. Run --execute in an interactive terminal with cast installed. Check any submitted transaction before retrying; transport details are suppressed to protect credentials.');
    process.exitCode = 1;
  }
}
