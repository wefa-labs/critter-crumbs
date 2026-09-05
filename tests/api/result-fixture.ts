import recorded from '../../packages/core/test/fixtures/eas-base-record.json' with { type: 'json' };
import { encodeResult, schemaUID, resultSchema, createEasReader } from '@critter-crumbs/core';
import type { Feast, Hex, Address } from '@critter-crumbs/shared';
import { decodeFunctionData, encodeEventTopics, encodeFunctionResult, zeroAddress, zeroHash, type Abi } from 'viem';
// Synthetic result-schema variations of the separately retained public RPC recording.
export function resultFixture(change?: (method: string, result: unknown) => unknown) {
  const abi = recorded.abi.eas as Abi;
  const receipts = new Map<Hex, { actor: Address; feast: Feast; data: Hex; uid: Hex }>();
  let calls = 0;
  const config = { chainId: 8453 as const, address: recorded.deployment.eas as Address, resultSchemaUid: schemaUID(resultSchema), rpcUrl: 'https://base-fixture.invalid' };
  const base = recorded.observations[1]!.responses;
  const response = (id: number) => base.find(item => item.id === id)!.result;
  function add(feast: Feast, actor: Address, txHash = recorded.selectedLog.transactionHash as Hex, overrides: Partial<ReturnType<typeof encodeData>> = {}) {
    const data = { ...encodeData(feast), ...overrides };
    receipts.set(txHash, { actor, feast, data: encodeResult(data), uid: `0x${txHash.slice(2)}` }); return txHash;
  }
  function encodeData(feast: Feast) { return { feastId: feast.id, publishedSetHash: feast.closeRecord!.publishedSetHash, crumbsIssued: feast.crumbsPerCritter, scatterers: 0, targetIds: feast.targets.map(t => t.id), owners: feast.targets.map(t => t.ownerAddress ?? zeroAddress), crumbs: feast.targets.map(() => 0) }; }
  let active: ReturnType<typeof receipts.get>;
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    calls++;
    const request = JSON.parse(String(init?.body)) as { id: number; method: string; params: unknown[] };
    let result: unknown;
    if (request.method === 'eth_chainId') result = '0x2105';
    else if (request.method === 'eth_getTransactionReceipt') {
      active = receipts.get(request.params[0] as Hex); if (!active) throw new Error('Receipt absent');
      const raw = response(1) as Record<string, unknown>;
      result = { ...raw, transactionHash: request.params[0], from: active.actor, to: config.address, logs: [{ ...recorded.selectedLog, transactionHash: request.params[0], data: active.uid,
        topics: encodeEventTopics({ abi, eventName: 'Attested', args: { recipient: zeroAddress, attester: active.actor, schemaUID: config.resultSchemaUid } }) }] };
    } else if (request.method === 'eth_getBlockByNumber') result = { ...(response(3) as Record<string, unknown>), ...(active ? { timestamp: `0x${Math.ceil(active.feast.scatteringEndsAt / 1000).toString(16)}` } : {}) };
    else if (request.method === 'eth_call') {
      const call = decodeFunctionData({ abi, data: (request.params[0] as { data: Hex }).data });
      const stored = [...receipts.values()].find(entry => entry.uid === call.args?.[0]);
      if (!stored) throw new Error('Unknown fixture UID');
      result = encodeFunctionResult({ abi, functionName: 'getAttestation', result: {
      uid: stored.uid, schema: config.resultSchemaUid, time: BigInt(Math.ceil(stored.feast.scatteringEndsAt / 1000)), expirationTime: 0n, revocationTime: 0n, refUID: zeroHash, recipient: zeroAddress, attester: stored.actor, revocable: false, data: stored.data,
    } });
    } else throw new Error(`Unexpected fixture method ${request.method}`);
    return Response.json({ jsonrpc: '2.0', id: request.id, result: change ? change(request.method, result) : result });
  };
  return { add, config, fetch, get calls() { return calls; }, reader: createEasReader({ ...config, fetch }) };
}
