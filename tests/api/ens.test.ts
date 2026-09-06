import { readFileSync } from 'node:fs';
import { custom, type Hex } from 'viem';
import { expect, test } from 'vitest';
import { createEnsResolver } from '@critter-crumbs/api';
const fixture: { address: Hex; name: string; exchanges: { method: string; params: unknown[]; result: Hex }[] } = JSON.parse(readFileSync(new URL('./fixtures/ens-mainnet.json', import.meta.url), 'utf8'));
function recordedResolver(mismatch = false) {
  return createEnsResolver(custom({ async request({ method, params }) {
    const exchange = fixture.exchanges.find(row => row.method === method && JSON.stringify(row.params).toLowerCase() === JSON.stringify(params).toLowerCase());
    if (!exchange) throw new Error('Unrecorded ENS request');
    return mismatch ? exchange.result.replaceAll(fixture.address.slice(2).toLowerCase(), '1'.repeat(40)) : exchange.result;
  } }, { retryCount: 0 }));
}
test('API ENS adapter replays recorded mainnet reverse and forward RPC responses', async () => {
  expect(await recordedResolver().lookupName(fixture.address)).toBe(fixture.name);
});
test('API ENS adapter rejects a reverse name whose forward address does not match', async () => {
  expect(await recordedResolver(true).lookupName(fixture.address)).toBe(null);
});
