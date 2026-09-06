import { concatHex, encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';
import { readFileSync } from 'node:fs';
import { canonicalJSON, type Hex } from '@critter-crumbs/shared';
import type { RegistrationJournal, ShutterAttempt, ShutterServerConfig } from '@critter-crumbs/core';
export const chainFixture = JSON.parse(readFileSync(new URL('./fixtures/shutter-registration.json', import.meta.url), 'utf8'));
const requests = chainFixture.observations.flatMap((entry: { requests: { id: number; method: string; params: unknown[] }[] }) => entry.requests) as { id: number; method: string; params: unknown[] }[];
const responses = chainFixture.observations.flatMap((entry: { responses: { id: number; result: unknown }[] }) => entry.responses) as { id: number; result: unknown }[];
const observed = (method: string, select: (params: unknown[]) => boolean = () => true) => responses.find(response => response.id === requests.find(request => request.method === method && select(request.params))?.id)!.result;
export function registrationFixture(options: { dynamic?: boolean; pending?: boolean } = {}) {
  const saved = new Map<string, ShutterAttempt>(); let registered = false;
  const posts: { body: unknown; headers: Headers }[] = [];
  const journal: RegistrationJournal = {
    async read(id) { return structuredClone(saved.get(id) ?? null); },
    async compareAndSet(id, previous, next) { if (canonicalJSON(previous) !== canonicalJSON(saved.get(id) ?? null)) return false; saved.set(id, structuredClone(next)); return true; },
  };
  const decoded = chainFixture.decoded;
  const server: ShutterServerConfig = { ...chainFixture.deployment, rpcUrl: 'https://rpc.fixture.invalid', apiKey: 'fixture-server-key', journal };
  let timestamp = BigInt(decoded.deadlineSeconds);
  const params = { eon: Number(decoded.eon), identity: decoded.identity, identity_prefix: decoded.identityPrefix, eon_key: decoded.eonKey };
  const fetch: typeof globalThis.fetch = async (url, init) => {
    if (String(url).startsWith(server.rpcUrl)) {
      const request = JSON.parse(String(init?.body)) as { id: number; method: string; params: unknown[] };
      let result: unknown;
      switch (request.method) {
        case 'eth_chainId': result = observed('eth_chainId'); break;
        case 'eth_blockNumber': result = `0x${(BigInt(decoded.blockNumber) - 1n).toString(16)}`; break;
        case 'eth_getBlockByNumber': result = observed('eth_getBlockByNumber'); break;
        case 'eth_getLogs': result = registered ? [{ ...chainFixture.selectedLog, ...(options.dynamic ? { data: encodeAbiParameters(parseAbiParameters('uint64, bytes32, address, uint64'), [BigInt(params.eon), params.identity_prefix, server.registrant, timestamp]) } : {}) }] : []; break;
        case 'eth_call': {
          const call = request.params[0] as { data: string };
          result = call.data.startsWith('0xda7c6a42') ? registered ? options.dynamic ? encodeAbiParameters(parseAbiParameters('uint64, uint64'), [BigInt(params.eon), timestamp]) : observed('eth_call', params => (params[0] as { data: string }).data.startsWith('0xda7c6a42')) : `0x${'00'.repeat(64)}` : observed('eth_call', params => (params[0] as { data: string }).data.startsWith('0x8a0b8b28')); break;
        }
        default: throw new Error(`Unexpected RPC method ${request.method}`);
      }
      return Response.json({ jsonrpc: '2.0', id: request.id, result });
    }
    if (String(url).includes('/get_data_for_encryption')) {
      if (options.dynamic) { params.identity_prefix = new URL(String(url)).searchParams.get('identityPrefix')!; params.identity = keccak256(concatHex([params.identity_prefix, server.registrant])); }
      return Response.json({ message: params });
    }
    if (String(url).endsWith('/register_identity')) { posts.push({ body: JSON.parse(String(init?.body)) as unknown, headers: new Headers(init?.headers) }); timestamp = BigInt((posts.at(-1)!.body as { decryptionTimestamp: number }).decryptionTimestamp); registered = !options.pending; return Response.json({ message: { ...params, tx_hash: decoded.transactionHash } }); }
    throw new Error(`Unexpected HTTP request ${String(url)}`);
  };
  return { server, fetch, posts, confirm() { registered = true; }, prefix: decoded.identityPrefix as Hex, deadline: Number(decoded.deadlineSeconds) * 1000 - 1,
    expected: { identityPrefix: decoded.identityPrefix, identity: decoded.identity, eon: Number(decoded.eon), eonKey: decoded.eonKey, txHash: decoded.transactionHash } };
}
