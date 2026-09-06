import type { Feast } from '@critter-crumbs/shared';
import { decodeBallot, signBallot } from '@critter-crumbs/core';
import { encryptedScatter, testEas } from './scatter-support.js';
import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('API scatter stores a signed ciphertext and assigns a new sequence for an identical retry', async () => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  const request = { method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed };
  expect((await api(request)).body).toEqual({ uid: signed.uid, seq: '1', serverNow: clock() });
  expect((await api(request)).body).toEqual({ uid: signed.uid, seq: '2', serverNow: clock() });
  const view = (await api({ method: 'GET', path, headers: owner.headers })).body;
  expect(view.ownBallotUids).toEqual([signed.uid, signed.uid]);
  expect(view.participation).toMatchObject({ scattered: [owner.account.address] });
});

test('API close record is produced once under concurrent first requests and keeps latest ciphertexts only', async () => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner, members } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  for (let i = 0; i < 2; i++) await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed });
  expect((await api({ method: 'GET', path: `${path}/ballots`, headers: owner.headers })).status).toBe(400);
  advance(1000);
  const results = await Promise.all([owner, ...members].map(member => api({ method: 'GET', path: `${path}/ballots`, headers: member.headers })));
  const record = results[0]!.body.closeRecord;
  for (const result of results) { expect(result.status).toBe(200); expect(result.body.closeRecord).toEqual(record); }
  expect(record).toMatchObject({ closedAt: clock(), published: [{ seq: '1', uid: signed.uid, attester: owner.account.address }, { seq: '2', uid: signed.uid, attester: owner.account.address }], counted: [{ seq: '2', uid: signed.uid, attester: owner.account.address }] });
  expect(results[0]!.body.ballots).toEqual([{ seq: '2', uid: signed.uid, attester: owner.account.address, ciphertext: decodeBallot(signed.message.data).ciphertext, attestation: signed }]);
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed })).body.error).toBe('scatter.closed');
  advance(1000);
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.closeRecord).toEqual(record);
});

test.each(['draft', 'gathering', 'scattering', 'feast', 'cancelled', 'void'] as const)('API scatter, ciphertext and key routes enforce the %s phase', async phase => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner, members, burrowId } = await createFeast({ open: phase !== 'draft' });
  if (phase === 'cancelled') await api({ method: 'POST', path: `${path}/cancel`, headers: owner.headers });
  if (phase === 'void') await api({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: members[0]!.headers });
  if (phase === 'scattering' || phase === 'void') advance(1000);
  if (phase === 'feast') advance(2000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await signBallot(owner.account, testEas, { feastId: feast.id, shutterIdentity: feast.registration?.identity ?? `0x${'00'.repeat(32)}`, ciphertext: '0x11', now: clock() });
  const request = { path: `${path}/ballots`, headers: owner.headers };
  expect((await api({ ...request, method: 'POST', body: signed })).status).toBe(phase === 'scattering' ? 200 : 400);
  expect((await api({ ...request, method: 'GET' })).status).toBe(phase === 'feast' ? 200 : 400);
  expect((await api({ ...request, method: 'GET', path: `${path}/key` })).status).toBe(phase === 'feast' ? 200 : 400);
});
test('API frozen participants retain submission rights after leaving but lose member ciphertext and key reads', async () => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner, burrowId } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  await api({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: owner.headers });
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed })).status).toBe(200);
  advance(1000);
  for (const route of ['ballots', 'key']) expect((await api({ method: 'GET', path: `${path}/${route}`, headers: owner.headers })).status).toBe(403);
});
test('API concurrent scatters receive distinct monotonic sequences without deduplicating UIDs', async () => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  const responses = await Promise.all(Array.from({ length: 6 }, () => api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed })));
  expect(responses.map(response => response.status)).toEqual([200, 200, 200, 200, 200, 200]);
  expect(responses.map(response => response.body.seq).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  expect(new Set(responses.map(response => response.body.uid))).toEqual(new Set([signed.uid]));
});
test('API scatter rechecks the clock after signature verification before committing', async () => {
  let readClock = () => 1800000000123;
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas, clock: () => readClock() }); disposals.push(close); readClock = clock;
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock()); let reads = 0;
  readClock = () => reads++ === 0 ? clock() : clock() + 1000;
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed })).body.error).toBe('scatter.closed');
  expect((await api({ method: 'GET', path: `${path}/ballots`, headers: owner.headers })).body.ballots).toEqual([]);
});
