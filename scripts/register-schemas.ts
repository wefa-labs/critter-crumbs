import { ballotSchema, prepareSchemaRegistration, resultSchema } from '@critter-crumbs/core';
import type { Account } from '@critter-crumbs/core';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { hex } from '@critter-crumbs/shared';
import { schemaSetup } from './deployment/eas.js';
const args = process.argv.slice(2);
const mode = args.includes('--execute') ? '--execute' : args.includes('--check') ? '--check' : undefined;
const remaining = args.filter(arg => arg !== mode);
if ((mode && args.filter(arg => arg === mode).length !== 1) || (remaining.length !== 0 && (remaining.length !== 2 || remaining[0] !== '--chain'))) throw new Error('Usage: register-schemas [--chain 8453|84532] [--check|--execute]. Default: prepare only.');
const chainId = Number(remaining[1] ?? process.env.EAS_CHAIN_ID ?? '84532');
if (chainId !== 8453 && chainId !== 84532) throw new Error('Choose Base 8453 or Base Sepolia 84532.');
const schemas = [ballotSchema, resultSchema].map(schema => ({ schema, ...prepareSchemaRegistration(schema) }));
if (!mode) console.log(JSON.stringify({ chainId, schemas }, (_key, value: unknown) => typeof value === 'bigint' ? value.toString() : value, 2));
else {
  try {
    const rpcUrl = process.env.BASE_RPC_URL;
    if (!rpcUrl) throw new Error('Missing BASE_RPC_URL');
    let account: Pick<Account, 'sendTransaction'> | undefined;
    if (mode === '--execute') {
      const key = hex(process.env.DEPLOYER_PRIVATE_KEY, 32);
      const signer = privateKeyToAccount(key);
      const chain = chainId === 8453 ? base : baseSepolia;
      const transport = http(rpcUrl, { retryCount: 0 });
      const client = createPublicClient({ chain, transport });
      const wallet = createWalletClient({ account: signer, chain, transport });
      account = { sendTransaction: async tx => {
        const hash = await wallet.sendTransaction(tx);
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
    console.error('EAS setup failed. Check configuration and any submitted transaction before retrying; RPC details are suppressed to protect credentials.');
    process.exitCode = 1;
  }
}
