import { createMockTimelock } from '@critter-crumbs/core';
import { afterEach, expect, test } from 'vitest';
import { apiHarness, testAccount } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('API gathering creates a people draft with deterministic targets visible only to its creator', async () => {
  const { api, connect, close, clock } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const burrow = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  for (const n of [2, 3]) await api({ method: 'POST', path: `/api/burrows/${burrow.body.id}/members`, headers: owner.headers, body: { address: testAccount(n).address } });
  const created = await api({ method: 'POST', path: `/api/burrows/${burrow.body.id}/feasts`, headers: owner.headers,
    body: { title: 'September', kind: 'people', crumbsPerCritter: 100, gatheringEndsAt: clock()+1000, scatteringEndsAt: clock()+2000, aggregatePublic: false, individualOpen: false } });
  expect(created.status).toBe(201);
  expect(created.body).toMatchObject({ phase: 'draft', status: 'draft' });
  expect(created.body.targets).toHaveLength(3);
  expect((await api({ method: 'GET', path: `/api/feasts/${created.body.id}`, headers: member.headers })).status).toBe(403);
});

test('API gathering opens a draft with mock registration and hides statements until scattering', async () => {
  const { api, connect, close, clock, advance } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const burrow = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  for (const n of [2, 3]) await api({ method: 'POST', path: `/api/burrows/${burrow.body.id}/members`, headers: owner.headers, body: { address: testAccount(n).address } });
  const created = await api({ method: 'POST', path: `/api/burrows/${burrow.body.id}/feasts`, headers: owner.headers,
    body: { title: 'September', kind: 'people', gatheringEndsAt: clock()+1000, scatteringEndsAt: clock()+2000, aggregatePublic: false, individualOpen: false } });
  const path = `/api/feasts/${created.body.id}`;
  const opened = await api({ method: 'POST', path: `${path}/open`, headers: owner.headers });
  expect(opened.status).toBe(200); expect(opened.body.phase).toBe('gathering');
  expect(opened.body.registration).toMatchObject({ eon: 0 });
  const target = (opened.body.targets as { id: string; ownerAddress: string }[]).find(target => target.ownerAddress === owner.account.address)!;
  expect((await api({ method: 'PUT', path: `${path}/statements/${target.id}`, headers: owner.headers, body: { body: 'Helped with the garden.' } })).status).toBe(200);
  expect((await api({ method: 'GET', path, headers: member.headers })).body.statements).toEqual([]);
  advance(1000);
  expect((await api({ method: 'GET', path, headers: member.headers })).body.statements).toContainEqual(expect.objectContaining({ body: 'Helped with the garden.', authorAddress: owner.account.address }));
});

test.each([false, true])('API creator cancels before scattering, opened=%s', async open => {
  const { api, createFeast, close } = await apiHarness(); disposals.push(close);
  const { path, owner } = await createFeast({ open });
  expect((await api({ method: 'POST', path: `${path}/cancel`, headers: owner.headers })).body.phase).toBe('cancelled');
});

test('API gathering extends once before the fixed scattering deadline', async () => {
  const { api, createFeast, close, clock } = await apiHarness(); disposals.push(close);
  const { path, owner } = await createFeast({ open: true });
  const extended = await api({ method: 'POST', path: `${path}/extend`, headers: owner.headers, body: { gatheringEndsAt: clock()+1500 } });
  expect(extended.status).toBe(200);
  expect(extended.body).toMatchObject({ gatheringEndsAt: clock()+1500, scatteringEndsAt: clock()+2000, gatheringExtended: true });
  expect((await api({ method: 'POST', path: `${path}/extend`, headers: owner.headers, body: { gatheringEndsAt: clock()+1750 } })).status).toBe(400);
});

test.each(['cancel', 'extend'])('API %s rejects the exact gathering deadline', async action => {
  const { api, createFeast, close, advance, clock } = await apiHarness(); disposals.push(close);
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  expect((await api({ method: 'POST', path: `${path}/${action}`, headers: owner.headers, body: { gatheringEndsAt: clock()+500 } })).status).toBe(400);
});
test.each(['open', 'cancel', 'extend'])('API %s rejects a member who is not the creator', async action => {
  const { api, createFeast, close, clock } = await apiHarness(); disposals.push(close);
  const { path, members } = await createFeast({ open: action !== 'open' });
  expect((await api({ method: 'POST', path: `${path}/${action}`, headers: members[0]!.headers, body: { gatheringEndsAt: clock()+500 } })).status).toBe(403);
});
test('API options statements are editable by the creator in draft and hidden from other members during gathering', async () => {
  const { api, createFeast, close } = await apiHarness(); disposals.push(close);
  const { path, owner, members, created } = await createFeast({ kind: 'options' });
  const target = (created.body.targets as { id: string }[])[0]!;
  expect((await api({ method: 'PUT', path: `${path}/statements/${target.id}`, headers: owner.headers, body: { body: 'New trees.' } })).status).toBe(200);
  await api({ method: 'POST', path: `${path}/open`, headers: owner.headers });
  expect((await api({ method: 'GET', path, headers: members[0]!.headers })).body.statements).toEqual([]);
  expect((await api({ method: 'PUT', path: `${path}/statements/${target.id}`, headers: members[0]!.headers, body: { body: 'Changed.' } })).status).toBe(403);
});
test.each([['overlong', 0, 'x'.repeat(2001), 'gathering.limit'], ['late', 1000, 'Late', 'scatter.closed']] as const)('API statements reject %s edits', async (_, elapsed, body, error) => {
  const { api, createFeast, close, advance } = await apiHarness(); disposals.push(close);
  const { path, owner, created } = await createFeast({ kind: 'options', open: true });
  const target = (created.body.targets as { id: string }[])[0]!;
  advance(elapsed);
  expect((await api({ method: 'PUT', path: `${path}/statements/${target.id}`, headers: owner.headers, body: { body } })).body.error).toBe(error);
});

test('API retries failed registration with the same persisted identity prefix', async () => {
  const mock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 });
  const prefixes: unknown[] = [];
  const { api, createFeast, close } = await apiHarness({ timelock: { ...mock, async register(...args) {
    prefixes.push(args[2]); if (prefixes.length === 1) throw new Error('Recorded registration failure'); return mock.register(...args);
  } } }); disposals.push(close);
  const { path, owner } = await createFeast();
  expect((await api({ method: 'POST', path: `${path}/open`, headers: owner.headers })).status).toBe(503);
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.phase).toBe('draft');
  expect((await api({ method: 'POST', path: `${path}/open`, headers: owner.headers })).status).toBe(200);
  expect(prefixes).toHaveLength(2); expect(prefixes[0]).toBe(prefixes[1]);
});
test('API concurrent open requests reserve one registration attempt', async () => {
  const mock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 });
  let calls = 0, unblock = () => {}, entered = () => {};
  const held = new Promise<void>(resolve => { unblock = resolve; });
  const started = new Promise<void>(resolve => { entered = resolve; });
  const { api, createFeast, close } = await apiHarness({ timelock: { ...mock, async register(...args) { calls++; entered(); await held; return mock.register(...args); } } }); disposals.push(close);
  const { path, owner } = await createFeast(); const request = { method: 'POST', path: `${path}/open`, headers: owner.headers };
  const first = api(request); await started;
  try { expect((await api(request)).status).toBe(503); } finally { unblock(); }
  expect((await first).status).toBe(200);
  expect((await api(request)).status).toBe(200); expect(calls).toBe(1);
});
test.each([false, true])('API arrival metadata excludes statements and encryption material, aggregatePublic=%s', async aggregatePublic => {
  const { api, createFeast, close } = await apiHarness(); disposals.push(close);
  const { path } = await createFeast({ open: true, aggregatePublic });
  const response = await api({ method: 'GET', path });
  expect(response.status).toBe(200); expect(response.body).toMatchObject({ title: 'Fixture', burrowName: 'Oak', aggregatePublic });
  for (const key of ['statements', 'registration', 'participants', 'participation', 'closeRecord']) expect(response.body).not.toHaveProperty(key);
});

test.each([
  ['whole crumbs', { crumbsPerCritter: 100.5 }], ['crumb bounds', { crumbsPerCritter: 9 }],
  ['deadline order', { gatheringEndsAt: 1800000002123, scatteringEndsAt: 1800000001123 }],
  ['privacy combination', { aggregatePublic: false, individualOpen: true }],
  ['empty options', { kind: 'options', options: [] }],
  ['duplicate option names', { kind: 'options', options: [{ name: 'Oak' }, { name: 'oak' }] }],
])('API draft rejects invalid %s', async (_, change) => {
  const { api, connect, close, clock } = await apiHarness(); disposals.push(close);
  const owner = await connect();
  const burrow = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const response = await api({ method: 'POST', path: `/api/burrows/${burrow.body.id}/feasts`, headers: owner.headers, body: { title: 'Fixture', kind: 'options', options: [{ name: 'Oak', statement: '' }], gatheringEndsAt: clock()+1000, scatteringEndsAt: clock()+2000, aggregatePublic: true, individualOpen: false, ...change } });
  expect(response.status).toBe(400);
});
test('API people draft requires three active critters at creation', async () => {
  const { api, connect, close, clock } = await apiHarness(); disposals.push(close);
  const owner = await connect();
  const burrow = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const response = await api({ method: 'POST', path: `/api/burrows/${burrow.body.id}/feasts`, headers: owner.headers, body: { title: 'Fixture', kind: 'people', gatheringEndsAt: clock()+1000, scatteringEndsAt: clock()+2000, aggregatePublic: false, individualOpen: false } });
  expect(response.body.error).toBe('setup.min.people');
});
test.each(['cancel', 'extend'])('API a departed creator cannot %s a gathering feast', async action => {
  const { api, createFeast, close, clock } = await apiHarness(); disposals.push(close);
  const { owner, path, burrowId } = await createFeast({ open: true });
  await api({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: owner.headers });
  expect((await api({ method: 'POST', path: `${path}/${action}`, headers: owner.headers, body: { gatheringEndsAt: clock()+1500 } })).status).toBe(403);
});
