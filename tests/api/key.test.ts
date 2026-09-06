import { createMockTimelock } from '@critter-crumbs/core';
import type { Feast } from '@critter-crumbs/shared';
import { bytesToHex } from 'viem';
import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('API timelock key is phase gated, retries after release, and persists across handler instances', async () => {
  const mock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 }); let calls = 0;
  const { api, anotherApi, createFeast, close, advance } = await apiHarness({ timelock: { ...mock, async getKey(identity) { calls++; return mock.getKey(identity); },
    async encrypt() { throw new Error('Server must not encrypt'); }, async decrypt() { throw new Error('Server must not decrypt'); } } }); disposals.push(close);
  const { path, owner, members } = await createFeast({ open: true });
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const request = { method: 'GET', path: `${path}/key`, headers: owner.headers };
  expect((await api(request)).status).toBe(400); expect(calls).toBe(0);
  advance(2000);
  const pending = await api(request);
  expect(pending.status).toBe(503); expect(pending.body.error).toBe('err.keyUnreachable'); expect(pending.headers['Retry-After']).toBe('5');
  mock.release(feast.registration!.identity);
  const responses = await Promise.all([owner, ...members].map(member => api({ ...request, headers: member.headers })));
  const expected = bytesToHex((await mock.getKey(feast.registration!.identity))!);
  for (const response of responses) { expect(response.status).toBe(200); expect(response.body.key).toBe(expected); }
  expect((await anotherApi()(request)).body.key).toBe(expected); expect(calls).toBe(2);
});
test('API timelock key reservation permits one fetch across concurrent server instances', async () => {
  const mock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 });
  let calls = 0, entered = () => {}, unblock = () => {};
  const started = new Promise<void>(resolve => { entered = resolve; }), held = new Promise<void>(resolve => { unblock = resolve; });
  const { api, anotherApi, createFeast, close, advance } = await apiHarness({ timelock: { ...mock, async getKey(identity) { calls++; entered(); await held; return mock.getKey(identity); } } }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true });
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  mock.release(feast.registration!.identity); advance(2000);
  const request = { method: 'GET', path: `${path}/key`, headers: owner.headers }, other = anotherApi();
  const first = api(request); await started;
  try { expect((await other(request)).status).toBe(503); expect(calls).toBe(1); } finally { unblock(); }
  expect((await first).status).toBe(200); expect((await other(request)).status).toBe(200); expect(calls).toBe(1);
});

test('API timelock key reservation recovers after an interrupted instance and cannot overwrite the winning key', async () => {
  const mock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 });
  let calls = 0, entered = () => {}, unblock = () => {};
  const started = new Promise<void>(resolve => { entered = resolve; }), held = new Promise<void>(resolve => { unblock = resolve; });
  const { api, anotherApi, createFeast, close, advance } = await apiHarness({ timelock: { ...mock, async getKey(identity) {
    if (++calls === 1) { entered(); await held; return new Uint8Array(32).fill(1); }
    return mock.getKey(identity);
  } } }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true });
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  mock.release(feast.registration!.identity); advance(2000);
  const request = { method: 'GET', path: `${path}/key`, headers: owner.headers }, first = api(request); await started;
  const expected = bytesToHex((await mock.getKey(feast.registration!.identity))!);
  try { advance(31000); expect((await anotherApi()(request)).body.key).toBe(expected); } finally { unblock(); }
  expect((await first).body.key).toBe(expected); expect(calls).toBe(2);
});
