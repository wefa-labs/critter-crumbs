import { expect, test } from 'vitest';
import { shutterPreflight } from '../../scripts/deployment/shutter.js';
import { concatHex, encodeFunctionResult, keccak256, parseAbi } from 'viem';
const address = '0x1111111111111111111111111111111111111111';
const prefix = `0x${'11'.repeat(32)}` as const;
const key = `0x${'12'.repeat(96)}` as const;
const input = { mode: 'chiado', apiBase: 'https://shutter-api.chiado.staging.shutter.network', rpcUrl: 'https://rpc.fixture.invalid', registry: address, keyBroadcast: address, registrant: address } as const;
const abi = parseAbi(['function getEonKey(uint64) view returns (bytes)', 'function registrations(bytes32) view returns (uint64 eon,uint64 timestamp)']);
function fixture(mismatch = false, authenticated = true): typeof fetch {
  return async (url, init) => {
    if (String(url).includes('check_authentication')) return Response.json({ result: authenticated ? 'authenticated' : 'unauthenticated' });
    if (String(url).includes('get_data_for_encryption')) {
      expect(init?.method ?? 'GET').toBe('GET');
      return Response.json({ message: { eon: 16, identity: keccak256(concatHex([prefix, address])), identity_prefix: prefix, eon_key: key, epoch_id: `0x${'13'.repeat(48)}` } });
    }
    const request = JSON.parse(String(init?.body));
    let result: unknown;
    if (request.method === 'eth_chainId') result = '0x27d8';
    else if (request.method === 'eth_getBlockByNumber') result = { number: '0x10', hash: `0x${'14'.repeat(32)}` };
    else if (request.method === 'eth_getCode') result = '0x1234';
    else if (request.method === 'eth_call') {
      expect(request.params[1]).toBe('0x10');
      result = request.params[0].data.startsWith('0x8a0b8b28')
        ? encodeFunctionResult({ abi, functionName: 'getEonKey', result: mismatch ? `0x${'15'.repeat(96)}` : key })
        : encodeFunctionResult({ abi, functionName: 'registrations', result: [0n, 0n] });
    } else throw new Error('Unexpected RPC method');
    return Response.json({ jsonrpc: '2.0', id: request.id, result });
  };
}
test('deployment timelock preflight matches Chiado at a finalized block without registration', async () => {
  const result = await shutterPreflight({ ...input, fetch: fixture() });
  expect(result).toMatchObject({ mode: 'chiado', chainId: 10200, eon: '16', authentication: 'anonymous', keyMatches: true });
});
test('deployment timelock preflight rejects a mismatching on-chain eon key', async () => {
  await expect(shutterPreflight({ ...input, fetch: fixture(true) })).rejects.toThrow('eon key');
});
test('deployment timelock preflight rejects an unauthenticated HTTP 200', async () => {
  await expect(shutterPreflight({ ...input, mode: 'mainnet', apiBase: 'https://shutter-api.shutter.network', apiKey: 'fixture-key', fetch: fixture(false, false) })).rejects.toThrow('API key');
});
