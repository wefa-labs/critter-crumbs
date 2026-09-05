import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
test('API profile persists a display name and four monotonic re-rolls', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const { headers } = await connect();
  for (let variant = 1; variant <= 4; variant++) {
    const response = await api({ method: 'PUT', path: '/api/me', headers, body: { variant, displayName: ' Juniper ' } });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ variant, rerollsUsed: variant, displayName: 'Juniper' });
  }
  expect((await api({ method: 'PUT', path: '/api/me', headers, body: { variant: 0 } })).status).toBe(400);
  expect((await api({ method: 'GET', path: '/api/me', headers })).body).toMatchObject({ variant: 4, rerollsUsed: 4, displayName: 'Juniper' });
});

test('API profile caches forward-confirmed ENS names for exactly 24 hours', async () => {
  let calls = 0;
  const { api, connect, close, clock, advance } = await apiHarness({ ens: {
    async lookupName() { calls++; return 'juniper.eth'; }, async resolveAddress() { return null; },
  } }); disposals.push(close);
  const { headers } = await connect();
  const read = () => api({ method: 'GET', path: '/api/me', headers });
  expect((await read()).body).toMatchObject({ ensName: 'juniper.eth', ensCheckedAt: clock() });
  advance(86400000 - 1); await read(); expect(calls).toBe(1);
  advance(1); await read(); expect(calls).toBe(2);
});

test('API profile falls back to the address with a copy ID when ENS is unavailable', async () => {
  const { api, connect, close } = await apiHarness({ ens: {
    async lookupName() { throw new Error('Recorded RPC unavailable'); }, async resolveAddress() { return null; },
  } }); disposals.push(close);
  const { headers, account } = await connect();
  expect((await api({ method: 'GET', path: '/api/me', headers })).body).toMatchObject({ address: account.address, ensName: null, warning: 'err.ensUnavailable' });
});
test('API concurrent re-roll retries count once and persist across sessions', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const { headers } = await connect();
  const request = { method: 'PUT', path: '/api/me', headers, body: { variant: 1 } };
  const replies = await Promise.all([api(request), api(request)]);
  expect(replies.map(reply => reply.body.rerollsUsed)).toEqual([1, 1]);
  const nextSession = await connect();
  expect((await api({ method: 'GET', path: '/api/me', headers: nextSession.headers })).body).toMatchObject({ variant: 1, rerollsUsed: 1 });
});
test('API profile rejects skipped variants', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const { headers } = await connect();
  expect((await api({ method: 'PUT', path: '/api/me', headers, body: { variant: 3 } })).status).toBe(400);
});
