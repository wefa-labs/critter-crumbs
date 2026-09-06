import { afterEach, expect, test } from 'vitest';
import { apiHarness, testAccount } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
test('API burrow admits only pre-added addresses and gives unconnected members default critters', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const owner = await connect(), newcomer = testAccount(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  expect((await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: newcomer.address } })).status).toBe(200);
  const before = await api({ method: 'GET', path, headers: owner.headers });
  expect(before.body.members).toContainEqual(expect.objectContaining({ address: newcomer.address, variant: 0, joinedAt: null, leftAt: null }));
  const member = await connect(2);
  expect((await api({ method: 'POST', path: `${path}/join`, headers: member.headers })).status).toBe(200);
  const stranger = await connect(3);
  const unknown = await api({ method: 'POST', path: `${path}/join`, headers: stranger.headers });
  expect(unknown.status).toBe(403);
  expect(unknown.body).toMatchObject({ error: 'burrow.unknown.title', detail: { burrowName: 'Oak' } });
});

test('API leaving affects only the signed-in member and preserves their history', async () => {
  const { api, connect, close, clock } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: member.account.address } });
  await api({ method: 'POST', path: `${path}/join`, headers: member.headers });
  expect((await api({ method: 'POST', path: `${path}/leave`, headers: member.headers, body: { address: owner.account.address } })).status).toBe(200);
  expect((await api({ method: 'GET', path, headers: member.headers })).status).toBe(403);
  const read = await api({ method: 'GET', path, headers: owner.headers });
  expect(read.body.members).toContainEqual(expect.objectContaining({ address: member.account.address, joinedAt: clock(), leftAt: clock() }));
  expect(read.body.members).toContainEqual(expect.objectContaining({ address: owner.account.address, leftAt: null }));
});

test('API membership freezes deadline participants before a first-request leave', async () => {
  const { api, connect, close, advance, openFeastFixture } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2), third = testAccount(3);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  for (const address of [member.account.address, third.address]) await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address } });
  const feastId = await openFeastFixture(String(created.body.id), owner.account.address);
  advance(1000);
  await api({ method: 'POST', path: `${path}/leave`, headers: member.headers });
  const read = await api({ method: 'GET', path, headers: owner.headers });
  expect(read.body.feasts).toContainEqual(expect.objectContaining({ id: feastId, phase: 'scattering', participants: expect.arrayContaining([owner.account.address, member.account.address, third.address]) }));
});

test('API resolves ENS additions to normalized addresses before admitting them', async () => {
  const second = testAccount(2);
  const { api, connect, close } = await apiHarness({ ens: { async lookupName() { return null; }, async resolveAddress(name) { return name === 'juniper.eth' ? second.address : null; } } }); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  expect((await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: 'juniper.eth' } })).status).toBe(200);
  expect((await api({ method: 'POST', path: `${path}/join`, headers: member.headers })).status).toBe(200);
});

test('API concurrent additions preserve every member and deduplicate retries', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const owner = await connect();
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  const replies = await Promise.all([2, 3, 4, 2].map(n => api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: testAccount(n).address } })));
  expect(replies.map(reply => reply.status)).toEqual([200, 200, 200, 200]);
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.members).toHaveLength(4);
});

test('API freezes the old participant set before admitting a member after the deadline', async () => {
  const { api, connect, close, advance, openFeastFixture } = await apiHarness(); disposals.push(close);
  const owner = await connect();
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  for (const n of [2, 3]) await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: testAccount(n).address } });
  const feastId = await openFeastFixture(String(created.body.id), owner.account.address); advance(1000);
  await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: testAccount(4).address } });
  const read = await api({ method: 'GET', path, headers: owner.headers });
  expect(read.body.feasts).toContainEqual(expect.objectContaining({ id: feastId, participants: expect.not.arrayContaining([testAccount(4).address]) }));
});

test('API voids a people feast when pre-deadline membership falls below three', async () => {
  const { api, connect, close, advance, openFeastFixture } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  for (const n of [2, 3]) await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: testAccount(n).address } });
  const feastId = await openFeastFixture(String(created.body.id), owner.account.address); advance(999);
  await api({ method: 'POST', path: `${path}/leave`, headers: member.headers }); advance(1);
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.feasts).toContainEqual(expect.objectContaining({ id: feastId, phase: 'void' }));
});

test.each(['members', 'join', 'leave'])('API %s rejects a signed-in nonmember', async action => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const owner = await connect(), stranger = await connect(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  expect((await api({ method: 'POST', path: `/api/burrows/${created.body.id}/${action}`, headers: stranger.headers, body: { address: testAccount(3).address } })).status).toBe(403);
});

test('API burrow phase and serverNow use the same checked snapshot across a deadline', async () => {
  let crossing = false, reads = 0; const initial = 1800000000123;
  const { api, connect, close, openFeastFixture } = await apiHarness({ clock: () => crossing ? initial + (++reads <= 2 ? 999 : 1000) : initial }); disposals.push(close);
  const owner = await connect();
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  for (const n of [2, 3]) await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: testAccount(n).address } });
  await openFeastFixture(String(created.body.id), owner.account.address); crossing = true;
  const result = await api({ method: 'GET', path, headers: owner.headers });
  expect(result.body).toMatchObject({ serverNow: initial + 999, feasts: [{ phase: 'gathering', participantsFrozenAt: null }] });
});

test('API explicitly re-adding a former member restores admission', async () => {
  const { api, connect, close } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`, add = { method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: member.account.address } };
  await api(add); await api({ method: 'POST', path: `${path}/join`, headers: member.headers });
  await api({ method: 'POST', path: `${path}/leave`, headers: member.headers }); await api(add);
  expect((await api({ method: 'POST', path: `${path}/join`, headers: member.headers })).status).toBe(200);
});

test('API burrow summaries reveal a draft only to its creator', async () => {
  const { api, connect, close, openFeastFixture } = await apiHarness(); disposals.push(close);
  const owner = await connect(), member = await connect(2);
  const created = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  await api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: member.account.address } });
  await openFeastFixture(String(created.body.id), owner.account.address, 'draft');
  expect((await api({ method: 'GET', path, headers: member.headers })).body.feasts).toEqual([]);
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.feasts).toHaveLength(1);
});
