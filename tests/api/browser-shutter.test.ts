import { afterEach, expect, test } from 'vitest';
import { createApiClient, createChiadoTimelock } from '@critter-crumbs/core';
import type { Feast } from '@critter-crumbs/shared';
import { apiHarness } from './support.js';
import { testEas } from './scatter-support.js';
import { createLocalShutterTimelock, nodeShutterSDK } from '../../scripts/local-shutter.js';
import { signScatter } from '../../packages/app/src/crypto/scatter.js';
import { openFeast } from '../../packages/app/src/crypto/feast.js';
import { chooseTimelock } from '../../packages/app/src/crypto/timelock.js';
import type { MemberFeast } from '../../packages/app/src/app/feast-view.js';

const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

/**
 * The store with Shutter's place taken by local keypers holding real keys, and the page's side as a production build
 * chooses it: Shutter's own SDK, loaded the way Node can. Nothing here is the mock.
 */
async function fixture() {
  const server = await apiHarness({ eas: testEas, timelockFactory: (_db, clock) => createLocalShutterTimelock({ secret: 'local-shutter-secret-for-tests-only-32', clock }) });
  disposals.push(server.close);
  const group = await server.createFeast({ open: true }); server.advance(1000);
  const people = [group.owner, ...group.members];
  const client = (member = group.owner) => createApiClient({ clock: server.clock, fetch: async input => { const response = await server.api({ method: 'GET', path: String(input), headers: member.headers }); return new Response(JSON.stringify(response.body), { status: response.status }); } });
  const lock = (feast: Feast) => chooseTimelock({ development: false, feast, now: server.clock, shutter: () => createChiadoTimelock({ sdk: nodeShutterSDK }) });
  const view = await client().get(group.path) as unknown as MemberFeast;
  /** A whole scatter to one other critter, or split between the two others. */
  const amounts = (giver: number, shares: number[]) => { const others = view.targets.map((target, index) => index).filter(index => view.targets[index]!.ownerAddress?.toLowerCase() !== people[giver]!.account.address.toLowerCase()); return view.targets.map((_, index) => shares[others.indexOf(index)] ?? 0); };
  async function scatter(giver: number, shares: number[]) {
    const signed = await signScatter(people[giver]!.account, view, amounts(giver, shares), server.clock(), lock(view));
    const saved = await server.api({ method: 'POST', path: `${group.path}/ballots`, headers: people[giver]!.headers, body: signed });
    expect(saved.status).toBe(200); return signed;
  }
  const close = async () => { server.advance(1000); return await client().get(group.path) as unknown as MemberFeast; };
  return { server, group, people, view, client, lock, amounts, scatter, close };
}

test('a feast scattered and opened through Shutter\'s own code gives every member the same result, and the latest scatter counts', async () => {
  const f = await fixture();
  expect((f.view.registration!.eonKey.length - 2) / 2).toBe(96);
  const first = await f.scatter(0, [100, 0]);
  const changed = await f.scatter(0, [30, 70]);
  await f.scatter(1, [0, 100]);
  expect((await f.server.api({ method: 'GET', path: `${f.group.path}/key`, headers: f.group.owner.headers })).status).not.toBe(200);

  const feast = await f.close();
  const opened = await Promise.all(f.people.map((_, index) => openFeast(f.client(f.people[index]), feast, index === 0 ? [first.uid, changed.uid] : [], f.lock(feast))));
  expect(new Set(opened.map(result => result?.result.resultHash)).size).toBe(1);
  const result = opened[0]!.result;
  expect(result.rejected).toEqual([]);
  expect(result.counted).toHaveLength(2);
  expect(result.counted.map(row => row.uid)).not.toContain(first.uid);
  expect(result.totalScattered).toBe(200);
  const expected = f.view.targets.map((_, index) => f.amounts(0, [30, 70])[index]! + f.amounts(1, [0, 100])[index]!);
  expect(f.view.targets.map(target => result.totals.find(total => total.targetId === target.id)!.crumbs)).toEqual(expected);
  expect(result.didNotScatter).toHaveLength(1);
  expect(opened[0]!.missingUids).toEqual([]);
}, 180000);

test('with Shutter\'s code missing on a device the feast waits there; it does not open as if nobody had scattered', async () => {
  const f = await fixture();
  await f.scatter(0, [100, 0]);
  const feast = await f.close();
  const without = chooseTimelock({ development: false, feast, now: f.server.clock, shutter: () => createChiadoTimelock({ sdk: async () => { throw new Error('Failed to load BLST'); } }) });
  await expect(openFeast(f.client(), feast, [], without)).rejects.toMatchObject({ copyId: 'err.keyUnreachable' });
  expect((await openFeast(f.client(), feast, [], f.lock(feast)))?.result.totalScattered).toBe(100);
}, 180000);

test('a scatter cannot be prepared without Shutter\'s code, and the member is told it was not saved, not that they declined', async () => {
  const f = await fixture();
  const without = chooseTimelock({ development: false, feast: f.view, now: f.server.clock, shutter: () => createChiadoTimelock({ sdk: async () => { throw new Error('Failed to load BLST'); } }) });
  await expect(signScatter(f.people[0]!.account, f.view, f.amounts(0, [100, 0]), f.server.clock(), without)).rejects.toMatchObject({ copyId: 'err.saveFailed' });
}, 180000);
