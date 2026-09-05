import type { Address, Hex, Registration } from '@critter-crumbs/shared';
export interface ShutterDeployment {
  mode: 'chiado' | 'mainnet'; chainId: 10200 | 100; apiOrigin: string;
  registry: Address; keyBroadcast: Address; registrant: Address;
}
export interface ShutterAttempt {
  version: 1; deployment: ShutterDeployment; identityPrefix: Hex; identity: Hex; timestamp: number;
  fromBlock: string; scanFromBlock: string; candidate: Registration | null;
  confirmed: { registration: Registration; blockNumber: string; blockHash: Hex } | null;
}
export interface RegistrationJournal {
  read(feastId: string): Promise<ShutterAttempt | null>;
  compareAndSet(feastId: string, previous: ShutterAttempt | null, next: ShutterAttempt): Promise<boolean>;
}
export interface ShutterServerConfig {
  rpcUrl: string; registry: Address; keyBroadcast: Address; registrant: Address;
  journal: RegistrationJournal; apiKey?: string;
}

import { concatHex, createPublicClient, http, keccak256, parseAbi, stringToHex, bytesToHex } from 'viem';
import { hex, integer, parseAddress, parseUuid, record } from '@critter-crumbs/shared';
import { ShutterError } from './shutter.js';
const registryAbi = parseAbi(['function registrations(bytes32 identity) view returns (uint64 eon,uint64 timestamp)', 'event IdentityRegistered(uint64 eon,bytes32 identityPrefix,address sender,uint64 timestamp)']);
const keyAbi = parseAbi(['function getEonKey(uint64 eon) view returns (bytes)']);
export function shutterRegistration(deployment: ShutterDeployment, server: ShutterServerConfig, transport: typeof fetch, random: (length: number) => Uint8Array = length => crypto.getRandomValues(new Uint8Array(length))) {
  const client = createPublicClient({ transport: http(server.rpcUrl, { fetchFn: transport, timeout: 10000, retryCount: 0 }) });
  async function request(path: string, body?: unknown) {
    let response: Response;
    try { response = await transport(`${deployment.apiOrigin}/api/time/${path}`, { credentials: 'omit', signal: AbortSignal.timeout(10000),
      headers: { ...(server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) }); }
    catch { throw new ShutterError('upstream'); }
    if (response.status === 429) throw new ShutterError('rate_limited', response.headers.get('Retry-After'));
    if (!response.ok) throw new ShutterError('upstream');
    try { return record(record(await response.json()).message); } catch { throw new ShutterError('invalid_response'); }
  }
  function registration(input: Record<string, unknown>, prefix: Hex, identity: Hex, tx: boolean): Registration {
    try {
      if (hex(input.identity_prefix, 32) !== prefix || hex(input.identity, 32) !== identity) throw new Error();
      return { identityPrefix: prefix, identity, eon: integer(input.eon, 0, 2147483647), eonKey: hex(input.eon_key, 96), txHash: tx ? hex(input.tx_hash, 32) : null };
    } catch { throw new ShutterError('invalid_response'); }
  }
  return async (feastId: string, decryptionTimestamp: number, identityPrefix?: Hex): Promise<Registration> => {
    parseUuid(feastId); const timestamp = Math.ceil(integer(decryptionTimestamp, 0, 8640000000000000) / 1000);
    let attempt = await server.journal.read(feastId);
    const prefix = hex(identityPrefix ?? attempt?.identityPrefix ?? keccak256(concatHex([stringToHex(`critter-crumbs${feastId}`), hex(bytesToHex(random(32)), 32)])), 32);
    if (await client.getChainId() !== deployment.chainId) throw new ShutterError('configuration');
    if (!attempt) {
      const identity = keccak256(concatHex([hex(prefix, 32), parseAddress(deployment.registrant)]));
      const parameters = registration(await request(`get_data_for_encryption?address=${deployment.registrant}&identityPrefix=${prefix}`), prefix, identity, false);
      const key = await client.readContract({ address: deployment.keyBroadcast, abi: keyAbi, functionName: 'getEonKey', args: [BigInt(parameters.eon)] });
      if (hex(key, 96) !== parameters.eonKey) throw new ShutterError('configuration');
      const fromBlock = String(await client.getBlockNumber({ cacheTime: 0 }));
      attempt = { version: 1, deployment, identityPrefix: prefix, identity, timestamp, fromBlock, scanFromBlock: fromBlock, candidate: null, confirmed: null };
      if (!await server.journal.compareAndSet(feastId, null, attempt)) throw new ShutterError('pending');
      const candidate = registration(await request('register_identity', { decryptionTimestamp: timestamp, identityPrefix: prefix }), prefix, identity, true);
      const submitted = { ...attempt, candidate };
      if (!await server.journal.compareAndSet(feastId, attempt, submitted)) throw new ShutterError('pending');
      attempt = submitted;
    }
    if (attempt.identityPrefix !== prefix || attempt.timestamp !== timestamp || attempt.deployment.chainId !== deployment.chainId) throw new ShutterError('configuration');
    if (attempt.confirmed) return attempt.confirmed.registration;
    const context = attempt.deployment;
    const block = await client.getBlock({ blockTag: 'finalized' });
    if (block.number === null || block.hash === null) throw new ShutterError('pending');
    const [eon, deadline] = await client.readContract({ address: context.registry, abi: registryAbi, functionName: 'registrations', args: [attempt.identity], blockNumber: block.number });
    if (deadline === 0n) throw new ShutterError('pending');
    if (deadline !== BigInt(attempt.timestamp) || eon > 2147483647n) throw new ShutterError('configuration');
    const eonKey = hex(await client.readContract({ address: context.keyBroadcast, abi: keyAbi, functionName: 'getEonKey', args: [eon], blockNumber: block.number }), 96);
    let scan = BigInt(attempt.scanFromBlock), transactionHash: Hex | null = null;
    for (let page = 0; page < 3 && scan <= block.number; page++) {
      const end = scan + 9999n < block.number ? scan + 9999n : block.number;
      const logs = await client.getLogs({ address: context.registry, event: registryAbi[1], fromBlock: scan, toBlock: end, strict: true });
      const matching = logs.filter(log => log.args.identityPrefix?.toLowerCase() === attempt!.identityPrefix && log.args.sender?.toLowerCase() === context.registrant.toLowerCase() && !log.removed);
      if (matching.length > 1 || matching.some(log => log.args.eon !== eon || log.args.timestamp !== deadline)) throw new ShutterError('configuration');
      if (matching[0]?.transactionHash) { transactionHash = matching[0].transactionHash; break; }
      scan = end + 1n;
    }
    if (!transactionHash) {
      await server.journal.compareAndSet(feastId, attempt, { ...attempt, scanFromBlock: scan > block.number ? attempt.fromBlock : String(scan) });
      throw new ShutterError('pending');
    }
    const result: Registration = { identityPrefix: attempt.identityPrefix, identity: attempt.identity, eon: Number(eon), eonKey, txHash: transactionHash };
    if (attempt.candidate && (attempt.candidate.eon !== result.eon || attempt.candidate.eonKey !== result.eonKey || attempt.candidate.txHash !== result.txHash)) throw new ShutterError('configuration');
    const confirmed = { ...attempt, confirmed: { registration: result, blockNumber: String(block.number), blockHash: block.hash } };
    if (!await server.journal.compareAndSet(feastId, attempt, confirmed)) throw new ShutterError('pending');
    return result;
  };
}
