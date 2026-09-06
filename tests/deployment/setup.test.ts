import { expect, test } from 'vitest';
import { schemaSetup } from '../../scripts/deployment/eas.js';
import { encodeFunctionResult, parseAbi, zeroAddress, zeroHash } from 'viem';
import { ballotSchema, resultSchema, schemaUID, type Account } from '@critter-crumbs/core';
const abi = parseAbi(['function getSchema(bytes32 uid) view returns ((bytes32 uid,address resolver,bool revocable,string schema))']);
test('deployment EAS setup skips existing schemas and confirms a newly registered schema', async () => {
  const known = new Set([schemaUID(ballotSchema)]); let sends = 0;
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body));
    let result: unknown;
    if (request.method === 'eth_chainId') result = '0x14a34';
    else if (request.method === 'eth_call') {
      const uid = `0x${request.params[0].data.slice(-64)}` as `0x${string}`;
      const schema = uid === schemaUID(ballotSchema) ? ballotSchema : resultSchema;
      result = encodeFunctionResult({ abi, functionName: 'getSchema', result: { uid: known.has(uid) ? uid : zeroHash, resolver: zeroAddress, revocable: false, schema: known.has(uid) ? schema : '' } });
    } else throw new Error('Unexpected RPC method');
    return Response.json({ jsonrpc: '2.0', id: request.id, result });
  };
  const account: Pick<Account, 'sendTransaction'> = {
    async sendTransaction(tx) { expect(tx.to).toBe('0x4200000000000000000000000000000000000020'); sends++; known.add(schemaUID(resultSchema)); return `0x${'11'.repeat(32)}`; } };
  const result = await schemaSetup({ chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid', fetch, account });
  expect(result.map(s => s.status)).toEqual(['registered', 'registered']); expect(sends).toBe(1);
  await schemaSetup({ chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid', fetch, account }); expect(sends).toBe(1);
});
test('deployment EAS setup rejects the wrong chain before reading or sending a schema', async () => {
  let calls = 0;
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)); calls++;
    expect(request.method).toBe('eth_chainId');
    return Response.json({ jsonrpc: '2.0', id: request.id, result: '0x1' });
  };
  await expect(schemaSetup({ chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid', fetch })).rejects.toThrow('RPC chain');
  expect(calls).toBe(1);
});
test('deployment EAS check reports absent schemas without sending a transaction', async () => {
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body));
    expect(['eth_chainId', 'eth_call']).toContain(request.method);
    return Response.json({ jsonrpc: '2.0', id: request.id, result: request.method === 'eth_chainId' ? '0x14a34' : encodeFunctionResult({ abi, functionName: 'getSchema', result: { uid: zeroHash, resolver: zeroAddress, revocable: false, schema: '' } }) });
  };
  expect((await schemaSetup({ chainId: 84532, rpcUrl: 'https://rpc.fixture.invalid', fetch })).map(s => s.status)).toEqual(['missing', 'missing']);
});
