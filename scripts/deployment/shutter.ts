import { concatHex, createPublicClient, http, keccak256, parseAbi, zeroAddress } from 'viem';
import { hex, integer, parseAddress, record } from '@critter-crumbs/shared';

export class ShutterSetupError extends Error {}

const origins = { chiado: 'https://shutter-api.chiado.staging.shutter.network', mainnet: 'https://shutter-api.shutter.network' };
const abi = parseAbi(['function getEonKey(uint64) view returns (bytes)', 'function registrations(bytes32) view returns (uint64 eon,uint64 timestamp)']);

/** Public parameter and finalized-chain reads only. Never register an identity as a health check. */
export async function shutterPreflight(input: { mode: string; apiBase: string; rpcUrl: string; registry: string; keyBroadcast: string; registrant: string; apiKey?: string; fetch?: typeof fetch }) {
  if (input.mode !== 'chiado' && input.mode !== 'mainnet') throw new ShutterSetupError('Choose chiado or mainnet for Shutter preflight.');
  const mode = input.mode;
  if (input.apiBase !== origins[mode]) throw new ShutterSetupError('Shutter API origin does not match its mode.');
  const registry = parseAddress(input.registry), keyBroadcast = parseAddress(input.keyBroadcast), registrant = parseAddress(input.registrant);
  if ([registry, keyBroadcast, registrant].includes(zeroAddress)) throw new ShutterSetupError('Shutter addresses must be nonzero.');
  const request = input.fetch ?? globalThis.fetch;
  const read = async (path: string) => {
    const response = await request(new URL(path, input.apiBase), { redirect: 'error', signal: AbortSignal.timeout(20000), headers: input.apiKey ? { Authorization: `Bearer ${input.apiKey}` } : {} });
    if (!response.ok) throw new ShutterSetupError('Shutter API read failed.');
    return record(await response.json());
  };
  if (input.apiKey) {
    if (mode === 'chiado') throw new ShutterSetupError('Use anonymous Chiado access; API key authentication is a mainnet feature.');
    if ((await read('/check_authentication')).result !== 'authenticated') throw new ShutterSetupError('Shutter API key was not authenticated.');
  }
  const client = createPublicClient({ transport: http(input.rpcUrl, { retryCount: 0, fetchFn: request, fetchOptions: { redirect: 'error' } }) });
  const chainId = await client.getChainId();
  if (chainId !== (mode === 'chiado' ? 10200 : 100)) throw new ShutterSetupError('Shutter RPC chain does not match its mode.');
  const block = await client.getBlock({ blockTag: 'finalized' });
  if (block.number === null || block.hash === null) throw new ShutterSetupError('No finalized Shutter block available.');
  for (const address of [registry, keyBroadcast]) {
    const code = await client.getCode({ address, blockNumber: block.number });
    if (!code || code === '0x') throw new ShutterSetupError('Shutter contract is absent at the finalized block.');
  }
  const prefix = `0x${'11'.repeat(32)}` as const;
  const params = record((await read(`/api/time/get_data_for_encryption?address=${registrant}&identityPrefix=${prefix}`)).message);
  const eon = BigInt(integer(params.eon, 0, Number.MAX_SAFE_INTEGER));
  const identity = keccak256(concatHex([prefix, registrant]));
  if (hex(params.identity_prefix, 32) !== prefix || hex(params.identity, 32) !== identity) throw new ShutterSetupError('Shutter identity derivation does not match.');
  hex(params.epoch_id, 48);
  const eonKey = hex(params.eon_key, 96);
  const onChainKey = await client.readContract({ address: keyBroadcast, abi, functionName: 'getEonKey', args: [eon], blockNumber: block.number });
  if (onChainKey.toLowerCase() !== eonKey) throw new ShutterSetupError('Shutter API eon key does not match the finalized on-chain eon key.');
  await client.readContract({ address: registry, abi, functionName: 'registrations', args: [identity], blockNumber: block.number });
  return { mode, chainId, registry, keyBroadcast, registrant, eon: eon.toString(), finalizedBlock: block.number.toString(), finalizedBlockHash: block.hash, authentication: input.apiKey ? 'authenticated' : 'anonymous', keyMatches: true,
    limitation: 'Read-only consistency check; current API signer and a new registration/release lifecycle still require confirmation.' };
}
