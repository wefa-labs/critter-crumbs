import { createPublicClient, http, parseAbi, zeroAddress, zeroHash } from 'viem';
import { ballotSchema, prepareSchemaRegistration, resultSchema, type Account } from '@critter-crumbs/core';

const abi = parseAbi(['function getSchema(bytes32 uid) view returns ((bytes32 uid,address resolver,bool revocable,string schema))']);

/** An executing account must wait for a successful receipt before returning. */
export async function schemaSetup(input: { chainId: number; rpcUrl: string; fetch?: typeof fetch; account?: Account }) {
  if (input.chainId !== 8453 && input.chainId !== 84532) throw new Error('Choose Base 8453 or Base Sepolia 84532.');
  const client = createPublicClient({ transport: http(input.rpcUrl, { retryCount: 0, fetchFn: input.fetch }) });
  if (await client.getChainId() !== input.chainId) throw new Error('EAS RPC chain does not match EAS_CHAIN_ID.');
  const records = [];
  for (const schema of [ballotSchema, resultSchema]) {
    const { uid, transaction } = prepareSchemaRegistration(schema);
    const read = () => client.readContract({ address: transaction.to, abi, functionName: 'getSchema', args: [uid] });
    let record = await read();
    let transactionHash;
    if (record.uid === zeroHash && input.account) {
      if (!input.account.sendTransaction) throw new Error('Schema registration requires a transaction-capable account.');
      transactionHash = await input.account.sendTransaction(transaction);
      record = await read();
      if (record.uid === zeroHash) throw new Error('Schema is absent after the confirmed transaction.');
    }
    if (record.uid !== zeroHash && (record.uid !== uid || record.schema !== schema || record.resolver !== zeroAddress || record.revocable)) {
      throw new Error('Registered EAS schema does not match the contract.');
    }
    records.push({ uid, status: record.uid === zeroHash ? 'missing' : 'registered', ...(transactionHash ? { transactionHash } : {}) });
  }
  return records;
}
