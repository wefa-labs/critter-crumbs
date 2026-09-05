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

test('API client retries failed reads, invalidates on writes and reports clock skew once with copy-ID errors', async () => {
  const warnings: unknown[] = [], requests: RequestInit[] = []; let calls = 0;
  const client = createApiClient({ clock: () => 1000, onClockSkew: (...args) => warnings.push(args), fetch: async (_path, init) => {
    requests.push(init!); calls++;
    return calls === 1 ? Response.json({ error: 'err.keyUnreachable', detail: 'pending', serverNow: 601001 }, { status: 503, headers: { 'Retry-After': '5' } }) : Response.json({ serverNow: 601001, calls });
  } });
  await expect(client.get('/api/me')).rejects.toMatchObject({ copyId: 'err.keyUnreachable', status: 503, detail: 'pending', retryAfter: '5' });
  expect(client.now()).toBe(601001); expect(warnings).toEqual([['err.clockSkew', 600001]]);
  expect(await client.get('/api/me')).toMatchObject({ calls: 2 });
  await client.write('/api/me', 'PUT', { displayName: 'Moss' });
  expect(requests[2]).toMatchObject({ method: 'PUT', credentials: 'same-origin', body: '{"displayName":"Moss"}', headers: { 'Content-Type': 'application/json' } });
  expect(await client.get('/api/me')).toMatchObject({ calls: 4 }); expect(warnings).toHaveLength(1);
});
