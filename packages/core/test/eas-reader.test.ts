import { createRequire } from 'node:module';
import { createEasReader, EasRecordError } from '@critter-crumbs/core';
import type { Address, Hex } from '@critter-crumbs/shared';
import { expect, test } from 'vitest';
import recorded from './fixtures/eas-base-record.json' with { type: 'json' };
const require = createRequire(import.meta.url);
const { EAS } = require('@ethereum-attestation-service/eas-sdk') as typeof import('@ethereum-attestation-service/eas-sdk');
const raw = (id: number) => recorded.observations[1]!.responses.find(item => item.id === id)!.result;
function reader(change?: (method: string, result: unknown) => unknown) {
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)) as { id: number; method: string; params: unknown[] };
    const result = request.method === 'eth_chainId' ? '0x2105' : request.method === 'eth_getTransactionReceipt' ? raw(1)
      : request.method === 'eth_getBlockByNumber' ? (request.params[0] === 'finalized' ? recorded.observations[0]!.responses.find(r => r.id === 2)!.result : raw(3))
      : request.method === 'eth_call' ? raw(2) : undefined;
    if (result === undefined) throw new Error(`Unexpected recorded RPC method ${request.method}`);
    return Response.json({ jsonrpc: '2.0', id: request.id, result: change ? change(request.method, result) : result });
  };
  return createEasReader({ chainId: 8453, address: recorded.deployment.eas as Address, resultSchemaUid: recorded.decoded.attestation.schema as Hex, rpcUrl: 'https://recorded-base.invalid', fetch });
}
test('eas reader replays a recorded finalized Base receipt and SDK-matching stored attestation', async () => {
  const result = await reader().read(recorded.selectedLog.transactionHash as Hex);
  const sdk = new EAS(recorded.deployment.eas);
  expect(sdk.getUIDsFromAttestReceipt(raw(1) as unknown as Parameters<typeof sdk.getUIDsFromAttestReceipt>[0])).toEqual([result.uid]);
  expect(result).toMatchObject(recorded.decoded.attestation);
});
test.each(['chain', 'receipt status', 'contract', 'schema', 'event attester', 'block hash', 'finality', 'missing event', 'duplicate event'] as const)('eas reader rejects a mismatched %s in recorded RPC evidence', async failure => {
  const adapter = reader((method, input) => {
    if (failure === 'chain' && method === 'eth_chainId') return '0x64';
    const value = input as Record<string, unknown>;
    if (method === 'eth_getBlockByNumber' && failure === 'block hash') return { ...value, hash: `0x${'aa'.repeat(32)}` };
    if (method === 'eth_getBlockByNumber' && failure === 'finality') return { ...value, number: '0x1' };
    if (method !== 'eth_getTransactionReceipt') return input;
    if (failure === 'receipt status') return { ...value, status: '0x0' };
    if (failure === 'contract') return { ...value, to: '0x0000000000000000000000000000000000000000' };
    const logs = structuredClone(value.logs) as { topics: string[] }[];
    if (failure === 'schema') logs[0]!.topics[3] = `0x${'aa'.repeat(32)}`;
    if (failure === 'event attester') logs[0]!.topics[2] = `0x${'00'.repeat(32)}`;
    return { ...value, logs: failure === 'missing event' ? [] : failure === 'duplicate event' ? [logs[0], logs[0]] : logs };
  });
  await expect(adapter.read(recorded.selectedLog.transactionHash as Hex)).rejects.toBeInstanceOf(EasRecordError);
});
