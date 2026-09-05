import { createApiClient } from '@critter-crumbs/core';
import { expect, test } from 'vitest';

test('API client shares GET requests and advances from serverNow without replaying cached time', async () => {
  let deviceNow = 1000, calls = 0;
  const client = createApiClient({ clock: () => deviceNow, fetch: async () => { calls++; return Response.json({ serverNow: 5000, name: 'Oak' }); } });
  expect(client.now()).toBeNull();
  const [first, second] = await Promise.all([client.get('/api/me'), client.get('/api/me')]);
  expect(first).toEqual(second); expect(calls).toBe(1); expect(client.now()).toBe(5000);
  deviceNow += 400; await client.get('/api/me'); expect(client.now()).toBe(5400); expect(calls).toBe(1);
  client.invalidate(); await client.get('/api/me'); expect(calls).toBe(2); expect(client.now()).toBe(5000);
});

test('API client exposes server copy IDs and retry metadata', async () => {
  const client = createApiClient({ clock: () => 1000, fetch: async () => Response.json({ error: 'err.keyUnreachable', detail: 'pending', serverNow: 5000 }, { status: 503, headers: { 'Retry-After': '5' } }) });
  await expect(client.get('/api/feasts/example/key')).rejects.toMatchObject({ copyId: 'err.keyUnreachable', status: 503, detail: 'pending', retryAfter: '5' });
});

test('API client retries a failed read instead of caching its failure', async () => {
  let available = false;
  const client = createApiClient({ clock: () => 1000, fetch: async () => {
    if (!available) throw new Error('Offline');
    return Response.json({ serverNow: 5000, name: 'Oak' });
  } });
  await expect(client.get('/api/me')).rejects.toMatchObject({ copyId: 'err.storeUnreachable' });
  available = true;
  expect(await client.get('/api/me')).toMatchObject({ name: 'Oak' });
});

test('API client writes JSON and invalidates the previously read state', async () => {
  let name = 'Oak';
  const client = createApiClient({ clock: () => 1000, fetch: async (_path, init) => {
    if (init?.method === 'PUT') {
      expect(init).toMatchObject({ credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } });
      name = (JSON.parse(String(init.body)) as { displayName: string }).displayName;
    }
    return Response.json({ serverNow: 5000, name });
  } });
  expect(await client.get('/api/me')).toMatchObject({ name: 'Oak' });
  await client.write('/api/me', 'PUT', { displayName: 'Moss' });
  expect(await client.get('/api/me')).toMatchObject({ name: 'Moss' });
});

test('API client reports skew above five minutes once, including on error responses', async () => {
  const warnings: unknown[] = []; let stamp = 301000;
  const client = createApiClient({ clock: () => 1000, onClockSkew: (...args) => warnings.push(args), fetch: async () => Response.json({ serverNow: stamp, error: 'err.generic' }, { status: 503 }) });
  await client.get('/api/me').catch(() => {}); expect(warnings).toEqual([]);
  stamp = 601001;
  await client.get('/api/me').catch(() => {});
  await client.get('/api/me').catch(() => {});
  expect(warnings).toEqual([['err.clockSkew', 600001]]); expect(client.now()).toBe(601001);
});
