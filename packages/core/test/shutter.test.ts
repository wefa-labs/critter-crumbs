import { createChiadoTimelock, createMainnetTimelock } from '@critter-crumbs/core';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/shutter-api.json', import.meta.url), 'utf8'));

test.each(['chiado', 'mainnet'] as const)('timelock %s waits only for the documented not-yet-released response', async mode => {
  let response = fixture.waiting;
  const requests: { url: string; init?: RequestInit }[] = [];
  const adapter = (mode === 'chiado' ? createChiadoTimelock : createMainnetTimelock)({ fetch: async (url, init) => { requests.push({ url: String(url), ...(init ? { init } : {}) }); return Response.json(response, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }); } });
  const identity = fixture[mode].message.identity;
  expect(await adapter.getKey(identity)).toBeNull();
  expect(requests[0]!.url).toBe(`${mode === 'chiado' ? 'https://shutter-api.chiado.staging.shutter.network' : 'https://shutter-api.shutter.network'}/api/time/get_decryption_key?identity=${identity}`);
  expect(requests[0]!.init).toMatchObject({ credentials: 'omit' });
  expect(new Headers(requests[0]!.init?.headers).has('Authorization')).toBe(false);
  response = fixture.unregistered;
  await expect(adapter.getKey(identity)).rejects.toMatchObject({ reason: 'unregistered' });
});

test.each(['chiado', 'mainnet'] as const)('timelock %s returns a released key only for the requested identity', async mode => {
  const vector = JSON.parse(readFileSync(new URL('./fixtures/shutter-sdk.json', import.meta.url), 'utf8'));
  const identity = fixture[mode].message.identity;
  let returnedIdentity = identity;
  const adapter = (mode === 'chiado' ? createChiadoTimelock : createMainnetTimelock)({ fetch: async () => Response.json({ message: { identity: returnedIdentity, decryption_key: vector.decryptionKey, decryption_timestamp: 1800000000 } }) });
  expect(Array.from(await adapter.getKey(identity) ?? [])).toEqual(Array.from(Buffer.from(vector.decryptionKey.slice(2), 'hex')));
  returnedIdentity = `0x${'00'.repeat(32)}`;
  await expect(adapter.getKey(identity)).rejects.toMatchObject({ reason: 'invalid_response' });
});

test.each([[429, 'rate_limited'], [500, 'upstream'], [400, 'upstream']] as const)('timelock classifies HTTP %s as %s without hiding failures as waiting', async (status, reason) => {
  const adapter = createChiadoTimelock({ fetch: async () => new Response('upstream response', { status, headers: { 'Retry-After': '60' } }) });
  await expect(adapter.getKey(fixture.chiado.message.identity)).rejects.toMatchObject({ reason, ...(status === 429 ? { retryAfter: '60' } : {}) });
});
test('timelock rejects malformed successful key data', async () => {
  const malformed = createChiadoTimelock({ fetch: async () => Response.json({ message: { identity: fixture.chiado.message.identity, decryption_key: '0x', decryption_timestamp: 1800000000 } }) });
  await expect(malformed.getKey(fixture.chiado.message.identity)).rejects.toMatchObject({ reason: 'invalid_response' });
});
test('timelock reports transport failure', async () => {
  const offline = createChiadoTimelock({ fetch: async () => { throw new Error('Offline'); } });
  await expect(offline.getKey(fixture.chiado.message.identity)).rejects.toMatchObject({ reason: 'upstream' });
});

test('timelock browser adapters cannot register identities without server configuration', async () => {
  const adapter = createChiadoTimelock({ fetch: async () => { throw new Error('Unexpected request'); } });
  await expect(adapter.register('00000000-0000-4000-8000-000000000001', 1800000000000, `0x${'11'.repeat(32)}`)).rejects.toMatchObject({ reason: 'configuration' });
});

test('timelock honors the configured API origin while keeping browser key reads anonymous', async () => {
  const requests: { url: string; headers: Headers }[] = [];
  const fetch: typeof globalThis.fetch = async (url, init) => { requests.push({ url: String(url), headers: new Headers(init?.headers) }); return Response.json(fixture.waiting, { status: 400 }); };
  const adapter = createChiadoTimelock({ fetch, apiBase: 'https://shutter.example.test/' });
  expect(await adapter.getKey(fixture.chiado.message.identity)).toBeNull();
  expect(requests[0]!.url.startsWith('https://shutter.example.test/api/time/')).toBe(true);
  expect(requests[0]!.headers.has('Authorization')).toBe(false);
});

test('timelock fetches the key directly and anonymously when the store is unreachable', async () => {
  const { createApiClient, readFeastKey } = await import('@critter-crumbs/core');
  const vector = JSON.parse(readFileSync(new URL('./fixtures/shutter-sdk.json', import.meta.url), 'utf8'));
  const identity = fixture.chiado.message.identity;
  const client = createApiClient({ clock: () => 1800000000000, fetch: async () => { throw new Error('Store unavailable'); } });
  const direct = createChiadoTimelock({ fetch: async (_url, init) => {
    expect(init?.credentials).toBe('omit'); expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    return Response.json({ message: { identity, decryption_key: vector.decryptionKey, decryption_timestamp: 1800000000 } });
  } });
  const key = await readFeastKey(client, { id: '00000000-0000-4000-8000-000000000001', registration: { identity, identityPrefix: fixture.chiado.message.identity_prefix, eon: 16, eonKey: fixture.chiado.message.eon_key, txHash: null } }, direct);
  expect(Buffer.from(key!).toString('hex')).toBe(vector.decryptionKey.slice(2));
});

test('timelock treats only the documented missing released key as waiting', async () => {
  let description = 'decryption key doesnt exist';
  const adapter = createMainnetTimelock({ fetch: async () => Response.json({ description, statusCode: 404 }, { status: 404 }) });
  expect(await adapter.getKey(fixture.mainnet.message.identity)).toBeNull();
  description = 'route not found';
  await expect(adapter.getKey(fixture.mainnet.message.identity)).rejects.toMatchObject({ reason: 'upstream' });
});
test.each([400, 401, 403])('timelock fallback preserves an explicit store status %s', async status => {
  const { createApiClient, readFeastKey } = await import('@critter-crumbs/core');
  const client = createApiClient({ clock: () => 1000, fetch: async () => Response.json({ error: 'err.generic', serverNow: 1000 }, { status }) });
  const direct = createChiadoTimelock({ fetch: async () => { throw new Error('Fallback must not run'); } });
  await expect(readFeastKey(client, { id: '00000000-0000-4000-8000-000000000001', registration: { identity: fixture.chiado.message.identity, identityPrefix: fixture.chiado.message.identity_prefix, eon: 16, eonKey: fixture.chiado.message.eon_key, txHash: null } }, direct)).rejects.toMatchObject({ status });
});
