import { afterEach, expect, test } from 'vitest';
import { createApiClient } from '@critter-crumbs/core';
import { apiHarness } from './support.js';
import { createSession } from '../../packages/app/src/app/session.js';
import { createDevAccountProvider } from '../../packages/app/src/dev/account-provider.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('the browser session signs a real nonce, restores its cookie, updates a profile and disconnects', async () => {
  const fixture = await apiHarness({ dev: { enabled: true, production: false, mode: 'mock', setTime() {}, releaseKey() {} } }); disposals.push(fixture.close);
  let cookie = '';
  const api = createApiClient({ clock: fixture.clock, fetch: async (input, init) => {
    const reply = await fixture.api({ method: init?.method ?? 'GET', path: String(input), headers: { cookie }, ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}) });
    if (reply.headers['Set-Cookie']) cookie = reply.headers['Set-Cookie'].split(';')[0]!;
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: reply.headers });
  } });
  const provider = createDevAccountProvider(api), session = createSession(api);
  await session.restore(); expect(session.snapshot().me).toBeNull();
  const options = await provider.discover(); expect(options).toHaveLength(8);
  await session.connect(provider, options[0]!);
  expect(session.snapshot().me?.address.toLowerCase()).toBe(session.snapshot().account?.address.toLowerCase());
  expect(session.snapshot().me?.rerollsUsed).toBe(0);
  await session.updateProfile({ displayName: 'Rowan' });
  for (let variant = 1; variant <= 4; variant++) await session.updateProfile({ variant });
  expect(session.snapshot().me).toMatchObject({ displayName: 'Rowan', variant: 4, rerollsUsed: 4, critterLocked: true });
  const reopened = createSession(api); await reopened.restore(); expect(reopened.snapshot().me?.displayName).toBe('Rowan');
  await session.disconnect(); await reopened.restore(); expect(reopened.snapshot().me).toBeNull();
});

test('a disabled development capability never offers or creates a local account', async () => {
  const fixture = await apiHarness(); disposals.push(fixture.close);
  const api = createApiClient({ clock: fixture.clock, fetch: async (input, init) => {
    const reply = await fixture.api({ method: init?.method ?? 'GET', path: String(input) });
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  } });
  const provider = createDevAccountProvider(api);
  await expect(provider.discover()).resolves.toEqual([]);
  await expect(provider.connect({ id: 'local:1', name: 'Local fixture' })).rejects.toThrow();
});

test('an expired cookie can disconnect locally and reconnect through a fresh signed challenge', async () => {
  const fixture = await apiHarness({ dev: { enabled: true, production: false, mode: 'mock', setTime() {}, releaseKey() {} } }); disposals.push(fixture.close);
  let cookie = '';
  const api = createApiClient({ clock: fixture.clock, fetch: async (input, init) => {
    const reply = await fixture.api({ method: init?.method ?? 'GET', path: String(input), headers: { cookie }, ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}) });
    if (reply.headers['Set-Cookie']) cookie = reply.headers['Set-Cookie'].split(';')[0]!;
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: reply.headers });
  } });
  const provider = createDevAccountProvider(api), session = createSession(api), option = (await provider.discover())[0]!;
  await session.connect(provider, option); fixture.advance(8 * 86400000);
  await session.disconnect(); expect(session.snapshot()).toMatchObject({ me: null, account: null });
  await session.connect(provider, option); expect(session.snapshot().me).not.toBeNull();
});
