import { expect, test } from 'vitest';
import { serverTimelock } from '../../api/_lib/timelock.js';
import { registrationFixture } from '../../packages/core/test/shutter-registration-support.js';
import { apiHarness, apiTestTimeout } from './support.js';

test('API real timelock retains a pending registration across handler restart and opens only after confirmation', async () => {
  const fixture = registrationFixture({ dynamic: true, pending: true });
  const { api, anotherApi, createFeast, close } = await apiHarness({ timelockFactory: (db, clock) => serverTimelock(db, clock, {
    mode: 'chiado', production: false, rpcUrl: fixture.server.rpcUrl, registry: fixture.server.registry, keyBroadcast: fixture.server.keyBroadcast, registrant: fixture.server.registrant, fetch: fixture.fetch,
  }) });
  try {
    const { path, owner } = await createFeast();
    expect((await api({ method: 'POST', path: `${path}/open`, headers: owner.headers })).status).toBe(503);
    const draft = await api({ method: 'GET', path, headers: owner.headers });
    expect(draft.body.phase).toBe('draft'); expect(draft.body.registration).toBeNull();
    fixture.confirm();
    const opened = await anotherApi()({ method: 'POST', path: `${path}/open`, headers: owner.headers });
    expect(opened.status).toBe(200); expect(opened.body.phase).toBe('gathering');
    expect(opened.body.registration).toMatchObject({ eon: 16, eonKey: fixture.expected.eonKey, txHash: fixture.expected.txHash });
    expect(fixture.posts).toHaveLength(1);
  } finally { await close(); }
}, apiTestTimeout);

test('API real key retrieval preserves rate-limit retry guidance', async () => {
  const fixture = registrationFixture({ dynamic: true });
  const fetch: typeof globalThis.fetch = (url, init) => String(url).includes('/get_decryption_key') ? Promise.resolve(new Response('rate limited', { status: 429, headers: { 'Retry-After': '60' } })) : fixture.fetch(url, init);
  const { api, createFeast, close, advance } = await apiHarness({ timelockFactory: (db, clock) => serverTimelock(db, clock, {
    mode: 'chiado', production: false, rpcUrl: fixture.server.rpcUrl, registry: fixture.server.registry, keyBroadcast: fixture.server.keyBroadcast, registrant: fixture.server.registrant, fetch,
  }) });
  try {
    const { path, owner } = await createFeast({ open: true }); advance(2000);
    const response = await api({ method: 'GET', path: `${path}/key`, headers: owner.headers });
    expect(response.status).toBe(503); expect(response.body.error).toBe('err.keyUnreachable'); expect(response.headers['Retry-After']).toBe('60');
  } finally { await close(); }
});
