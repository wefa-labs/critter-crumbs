import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
test('API persists the existing critter versions across keeping, ENS refresh and reconnecting', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const first = await connect();
  expect(first.connected.body).toMatchObject({ generatorVersion: '1', rendererVersion: '1', variant: 0 });
  const kept = await api({ method: 'PUT', path: '/api/me', headers: first.headers, body: { variant: 1, keepCritter: true, displayName: 'Moss' } });
  expect(kept.body).toMatchObject({ generatorVersion: '1', rendererVersion: '1', variant: 1, rerollsUsed: 1, critterLocked: true });
  const next = await connect();
  expect((await api({ method: 'GET', path: '/api/me', headers: next.headers })).body).toMatchObject({ generatorVersion: '1', rendererVersion: '1', variant: 1, rerollsUsed: 1, critterLocked: true });
});
test('ordinary profile edits cannot migrate a critter or unlock its existing choice', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const { headers } = await connect();
  await api({ method: 'PUT', path: '/api/me', headers, body: { variant: 1, keepCritter: true, displayName: 'Moss' } });
  for (const versions of [{ generatorVersion: '2' }, { rendererVersion: '2' }, { generatorVersion: '3', rendererVersion: '3' }]) {
    const rejected = await api({ method: 'PUT', path: '/api/me', headers, body: { ...versions, displayName: 'Changed', variant: 1, critterLocked: false, rerollsUsed: 0 } });
    expect(rejected.status).toBe(400);
  }
  expect((await api({ method: 'GET', path: '/api/me', headers })).body).toMatchObject({ generatorVersion: '1', rendererVersion: '1', displayName: 'Moss', variant: 1, rerollsUsed: 1, critterLocked: true });
});
test('API first meeting saves a name and keeps the chosen critter in one write across sessions', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const { headers } = await connect();
  await api({ method: 'PUT', path: '/api/me', headers, body: { variant: 1 } });
  const saved = await api({ method: 'PUT', path: '/api/me', headers, body: { displayName: ' Avery ', keepCritter: true } });
  expect(saved.status).toBe(200);
  expect(saved.body).toMatchObject({ displayName: 'Avery', variant: 1, critterLocked: true, rerollsUsed: 1 });
  const next = await connect();
  expect((await api({ method: 'GET', path: '/api/me', headers: next.headers })).body).toMatchObject({ displayName: 'Avery', variant: 1, critterLocked: true });
  expect((await api({ method: 'PUT', path: '/api/me', headers: next.headers, body: { variant: 2 } })).status).toBe(400);
});
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

test('API keeping a critter irreversibly locks its identity across sessions', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const { headers } = await connect();
  const kept = await api({ method: 'PUT', path: '/api/me', headers, body: { variant: 1, keepCritter: true } });
  expect(kept.body).toMatchObject({ variant: 1, critterLocked: true });
  const next = await connect();
  expect((await api({ method: 'PUT', path: '/api/me', headers: next.headers, body: { variant: 2 } })).status).toBe(400);
  expect((await api({ method: 'PUT', path: '/api/me', headers: next.headers, body: { variant: 1, keepCritter: true } })).status).toBe(200);
});
