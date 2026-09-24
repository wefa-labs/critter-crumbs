import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
import { createPGliteDatabase } from '../../db/pglite.js';
import { encryptedScatter, testEas } from './scatter-support.js';
import type { Feast } from '@critter-crumbs/shared';
import type { Database } from '@critter-crumbs/api';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const close of disposals.splice(0)) await close(); });
const operationId = '00000000-0000-4000-8000-000000000001';
async function setup(options: Parameters<typeof apiHarness>[0] = {}) {
  const h = await apiHarness(options); disposals.push(h.close);
  const f = await h.createFeast({ open: true }), path = `/api/burrows/${f.burrowId}`;
  const body = { address: f.members[0]!.account.address, membershipVersion: 1, operationId };
  const remove = { method: 'POST', path: `${path}/removals`, headers: f.owner.headers, body };
  return { ...h, ...f, burrowPath: path, remove };
}
test('only an active burrow creator can remove another member, with visible durable history', async () => {
  const h = await setup();
  expect((await h.api({ ...h.remove, headers: h.members[1]!.headers })).status).toBe(403);
  expect((await h.api({ ...h.remove, body: { ...h.remove.body, address: h.owner.account.address } })).status).toBe(400);
  expect((await h.api({ ...h.remove, headers: {} })).status).toBe(401);
  const result = await h.api(h.remove); expect(result.status).toBe(200);
  expect((await h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers })).body.createdBy).toBe(h.owner.account.address);
  const record = result.body.removal;
  expect(record).toMatchObject({ action: 'remove', actorAddress: h.owner.account.address, address: h.remove.body.address, membershipVersion: 1, removedAt: h.clock() });
  expect((await h.anotherApi()({ method: 'GET', path: h.burrowPath, headers: h.members[1]!.headers })).body.removals).toEqual([record]);
  expect((await h.api({ method: 'GET', path: h.burrowPath, headers: h.members[0]!.headers })).status).toBe(403);
});
test('removal retries are scoped to the original membership, even after re-admission', async () => {
  const h = await setup(), first = await h.api(h.remove);
  expect(first.status).toBe(200);
  const add = { method: 'POST', path: `${h.burrowPath}/members`, headers: h.owner.headers, body: { address: h.remove.body.address } };
  await h.api(add); await h.api(add);
  expect((await h.api(h.remove)).body.removal).toEqual(first.body.removal);
  const read = await h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers });
  expect(read.body.members).toContainEqual(expect.objectContaining({ address: h.remove.body.address, membershipVersion: 2, leftAt: null }));
  const stale = { ...h.remove, body: { ...h.remove.body, operationId: '00000000-0000-4000-8000-000000000002' } };
  expect((await h.api(stale)).status).toBe(409);
  expect((await h.api({ ...h.remove, body: { ...h.remove.body, membershipVersion: 2 } })).status).toBe(409);
  h.advance(10);
  expect((await h.api({ ...stale, body: { ...stale.body, membershipVersion: 2 } })).status).toBe(200);
  const final = await h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers });
  expect((final.body.removals as unknown[])).toHaveLength(2);
  expect((final.body.removals as { removedAt: number }[]).map(r => r.removedAt)).toEqual([h.clock() - 10, h.clock()]);
});
test.each([999, 1000, 1001, 2000, 2001])('removal at +%i preserves phase boundaries, statements and close records', async elapsed => {
  const h = await setup();
  const initial = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  const target = (initial.body.targets as { id: string; ownerAddress: string }[]).find(t => t.ownerAddress === h.remove.body.address)!;
  await h.api({ method: 'PUT', path: `${h.path}/statements/${target.id}`, headers: h.members[0]!.headers, body: { body: 'Retained contribution.' } });
  h.advance(elapsed);
  const replies = await Promise.all([h.api(h.remove), h.anotherApi()(h.remove), h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers })]);
  expect(replies.slice(0, 2).map(r => r.status)).toEqual([200, 200]);
  expect(replies[0]!.body.removal).toEqual(replies[1]!.body.removal);
  if (elapsed < 1000) h.advance(1000 - elapsed);
  const read = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  if (elapsed < 1000) expect(read.body.phase).toBe('void');
  else {
    expect(read.body.participants).toContain(h.remove.body.address);
    expect(read.body.statements).toContainEqual(expect.objectContaining({ body: 'Retained contribution.' }));
    if (elapsed >= 2000) expect(read.body.closeRecord).toMatchObject({ closedAt: h.clock(), counted: [] });
  }
  await h.api({ method: 'POST', path: `${h.burrowPath}/members`, headers: h.owner.headers, body: { address: h.remove.body.address } });
  const final = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  expect(final.body.closeRecord).toEqual(read.body.closeRecord);
  expect(final.body.participants).toEqual(read.body.participants);
});
test('membership cannot change when its history transaction fails', async () => {
  let fail = false;
  const h = await setup({ databaseFactory: async () => {
    const db = await createPGliteDatabase();
    return { ...db, async batch(queries, options) {
      if (fail) queries = queries.map(q => q.text.includes('insert into member_removals') ? { ...q, values: [...q.values!.slice(0, -1), 'invalid-timestamp'] } : q);
      return db.batch(queries, options);
    } } satisfies Database;
  } });
  fail = true; expect((await h.api(h.remove)).status).toBe(503); fail = false;
  const read = await h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers });
  expect(read.body.removals).toEqual([]);
  expect(read.body.members).toContainEqual(expect.objectContaining({ address: h.remove.body.address, leftAt: null }));
});


test('removal preserves accepted sequences and a closed feast while a later feast still gathers', async () => {
  const h = await setup({ eas: testEas });
  const later = await h.api({ method: 'POST', path: `${h.burrowPath}/feasts`, headers: h.members[1]!.headers, body: { title: 'Later feast', kind: 'people', crumbsPerCritter: 100, gatheringEndsAt: h.clock() + 5000, scatteringEndsAt: h.clock() + 6000, aggregatePublic: false, individualOpen: false, options: [] } });
  expect(later.status).toBe(201);
  await h.api({ method: 'POST', path: `/api/feasts/${later.body.id}/open`, headers: h.members[1]!.headers });
  // A feast creator still has no authority to remove a burrow member.
  expect((await h.api({ ...h.remove, headers: h.members[1]!.headers })).status).toBe(403);
  h.advance(1000);
  const feast = (await h.api({ method: 'GET', path: h.path, headers: h.owner.headers })).body as unknown as Feast;
  const attestation = await encryptedScatter(feast, h.members[0]!.account, h.clock());
  expect((await h.api({ method: 'POST', path: `${h.path}/ballots`, headers: h.members[0]!.headers, body: attestation })).status).toBe(200);
  h.advance(1000);
  const closed = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  expect((await h.api(h.remove)).status).toBe(200);
  const after = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  expect(after.body.closeRecord).toEqual(closed.body.closeRecord);
  expect((after.body.closeRecord as Feast['closeRecord'])!.counted).toHaveLength(1);
  h.advance(3000);
  expect((await h.api({ method: 'GET', path: `/api/feasts/${later.body.id}`, headers: h.owner.headers })).body.phase).toBe('void');
});


test.each([999, 1999])('a revision retry crossing +%i reads fresh time before removing', async before => {
  let beforeCommit: (() => Promise<void>) | undefined;
  const h = await setup({ databaseFactory: async () => {
    const db = await createPGliteDatabase();
    return { ...db, async batch(queries, options) {
      if (beforeCommit && queries.some(q => q.text.includes('insert into member_removals'))) { const act = beforeCommit; beforeCommit = undefined; await act(); }
      return db.batch(queries, options);
    } } satisfies Database;
  } });
  const fourth = await h.connect(4); h.advance(before);
  beforeCommit = async () => {
    expect((await h.anotherApi()({ method: 'POST', path: `${h.burrowPath}/members`, headers: h.owner.headers, body: { address: fourth.account.address } })).status).toBe(200);
    h.advance(1);
  };
  const removed = await h.api(h.remove); expect(removed.status).toBe(200);
  expect(removed.body.removal).toMatchObject({ removedAt: h.clock() });
  const read = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  expect(read.body.participants).toContain(h.remove.body.address);
  expect(read.body.participants).toHaveLength(before === 999 ? 4 : 3);
  if (before === 1999) expect(read.body.closeRecord).toMatchObject({ closedAt: h.clock(), counted: [] });
  expect((await h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers })).body.removals).toEqual([removed.body.removal]);
});

test.each(['leave', 're-admit', 'remove'] as const)('a concurrent %s wins before the removal revision commits', async winner => {
  let beforeCommit: (() => Promise<void>) | undefined;
  const h = await setup({ databaseFactory: async () => {
    const db = await createPGliteDatabase();
    return { ...db, async batch(queries, options) {
      if (beforeCommit && queries.some(q => q.text.includes('insert into member_removals'))) { const act = beforeCommit; beforeCommit = undefined; await act(); }
      return db.batch(queries, options);
    } } satisfies Database;
  } });
  h.advance(999);
  beforeCommit = async () => {
    if (winner === 'remove') expect((await h.anotherApi()({ ...h.remove, body: { ...h.remove.body, operationId: '00000000-0000-4000-8000-000000000099' } })).status).toBe(200);
    else {
      expect((await h.anotherApi()({ method: 'POST', path: `${h.burrowPath}/leave`, headers: h.members[0]!.headers })).status).toBe(200);
      if (winner === 're-admit') expect((await h.anotherApi()({ method: 'POST', path: `${h.burrowPath}/members`, headers: h.owner.headers, body: { address: h.remove.body.address } })).status).toBe(200);
    }
    h.advance(1);
  };
  expect((await h.api(h.remove)).status).toBe(409);
  const burrow = await h.api({ method: 'GET', path: h.burrowPath, headers: h.owner.headers });
  expect(burrow.body.removals).toHaveLength(winner === 'remove' ? 1 : 0);
  expect(burrow.body.members).toContainEqual(expect.objectContaining({ address: h.remove.body.address, membershipVersion: winner === 're-admit' ? 2 : 1, leftAt: winner === 're-admit' ? null : h.clock() - 1 }));
  const feast = await h.api({ method: 'GET', path: h.path, headers: h.owner.headers });
  expect(feast.body.phase).toBe(winner === 're-admit' ? 'scattering' : 'void');
});
