import { afterEach, expect, test } from 'vitest';
import { apiHarness, apiTestTimeout, openTestDatabase, testAccount } from './support.js';
import type { Database } from '@critter-crumbs/api';
import type { Feast } from '@critter-crumbs/shared';
import { encryptedScatter, testEas } from './scatter-support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

async function capacityBurrow(size: number, options: Parameters<typeof apiHarness>[0] = {}) {
  const harness = await apiHarness({ eas: testEas, ...options }); disposals.push(harness.close);
  const owner = await harness.connect();
  const created = await harness.api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
  const path = `/api/burrows/${created.body.id}`;
  const add = (n: number, api = harness.api) => api({ method: 'POST', path: `${path}/members`, headers: owner.headers, body: { address: testAccount(n).address } });
  for (let n = 2; n <= size; n++) expect((await add(n)).status).toBe(200);
  const setup = { title: 'September', kind: 'people', crumbsPerCritter: 1000, gatheringEndsAt: harness.clock()+1000, scatteringEndsAt: harness.clock()+2000, aggregatePublic: false, individualOpen: false };
  const draft = (changes = {}) => harness.api({ method: 'POST', path: `${path}/feasts`, headers: owner.headers, body: { ...setup, ...changes } });
  return { ...harness, owner, path, add, draft };
}

test('API capacity rejects a people draft above 49 active critters without limiting an options feast', async () => {
  const { api, owner, path, draft } = await capacityBurrow(50);
  const rejected = await draft();
  expect(rejected.status).toBe(400);
  expect(rejected.body.error).toBe('err.feastCapacity');
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.feasts).toEqual([]);
  expect((await draft({ kind: 'options', options: [{ name: 'Trees' }] })).status).toBe(201);
}, apiTestTimeout);

test.each(['people', 'options'])('API capacity refuses to open an oversized %s draft saved before the limit existed', async kind => {
  let legacyDb: Database;
  const { api, owner, path, draft, clock } = await capacityBurrow(49, { databaseFactory: async () => { legacyDb = await openTestDatabase(); return legacyDb; } });
  const created = await draft({ kind, options: Array.from({ length: 49 }, (_, i) => ({ name: `Option ${i}` })) });
  // Database fixture models an existing pre-upgrade draft; all observations use handlers.
  if (kind === 'people') {
    const address = testAccount(50).address.toLowerCase();
    await legacyDb!.query('insert into profiles (address,created_at) values ($1,$2)', [address, new Date(clock()).toISOString()]);
    await legacyDb!.query('insert into burrow_members (burrow_id,address,added_by) values ($1,$2,$3)', [path.split('/').at(-1), address, owner.account.address.toLowerCase()]);
  } else {
    await legacyDb!.query("insert into targets (feast_id,target_id,kind,name,position) values ($1,$2,'option','Legacy option',49)", [created.body.id, Buffer.alloc(32, 255)]);
  }
  const feastPath = `/api/feasts/${created.body.id}`;
  const reply = await api({ method: 'POST', path: `${feastPath}/open`, headers: owner.headers });
  expect(reply.status).toBe(400);
  expect(reply.body.error).toBe('err.feastCapacity');
  expect((await api({ method: 'GET', path: feastPath, headers: owner.headers })).body).toMatchObject({ phase: 'draft', registration: null });
}, apiTestTimeout);

test.each(['people', 'options'])('API capacity accepts a complete maximum-size %s scatter and rejects excessive options at creation', async kind => {
  const { api, owner, draft, clock, advance } = await capacityBurrow(kind === 'people' ? 49 : 1);
  const options = Array.from({ length: 50 }, (_, i) => ({ name: `Option ${i}` }));
  if (kind === 'options') {
    const rejected = await draft({ kind, options });
    expect(rejected.status).toBe(400); expect(rejected.body.error).toBe('err.feastCapacity');
  }
  const created = await draft({ kind, options: options.slice(0, 49) });
  expect(created.status).toBe(201);
  const path = `/api/feasts/${created.body.id}`;
  expect((await api({ method: 'POST', path: `${path}/open`, headers: owner.headers })).status).toBe(200);
  advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const amounts = [kind === 'people' ? 170 : 160, 100, 100, 100, 100, ...Array<number>(kind === 'people' ? 43 : 44).fill(10)];
  if (kind === 'people') amounts.splice(feast.targets.findIndex(target => target.ownerAddress === owner.account.address), 0, 0);
  const signed = await encryptedScatter(feast, owner.account, clock(), amounts);
  const response = await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed });
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ uid: signed.uid, seq: '1' });
}, apiTestTimeout);

test.each([false, true])('API capacity serializes additions and re-admission before freeze, already open=%s', async open => {
  const { api, anotherApi, owner, path, add, draft, connect, advance } = await capacityBurrow(48);
  const created = await draft(), feastPath = `/api/feasts/${created.body.id}`;
  if (open) expect((await api({ method: 'POST', path: `${feastPath}/open`, headers: owner.headers })).status).toBe(200);
  const replies = await Promise.all([add(49), add(50, anotherApi())]);
  expect(replies.map(reply => reply.status).sort()).toEqual([200, 400]);
  expect(replies.find(reply => reply.status === 400)!.body.error).toBe('err.feastCapacity');
  expect((await api({ method: 'GET', path: feastPath, headers: owner.headers })).body.targets).toHaveLength(49);
  expect((await add(1)).status).toBe(200); // Repeating an existing addition consumes no capacity.

  const member = await connect(2);
  expect((await api({ method: 'POST', path: `${path}/leave`, headers: member.headers })).status).toBe(200);
  expect((await add(51)).status).toBe(200);
  expect((await add(2)).body.error).toBe('err.feastCapacity');
  if (!open) expect((await api({ method: 'POST', path: `${feastPath}/open`, headers: owner.headers })).status).toBe(200);
  advance(1000);
  expect((await add(2)).status).toBe(200); // First request freezes before admitting the next member.
  const frozen = (await api({ method: 'GET', path: feastPath, headers: owner.headers })).body;
  expect(frozen.participants).toHaveLength(49);
  expect(frozen.targets).toHaveLength(49);
  expect(frozen.participants).not.toContain(member.account.address);
}, apiTestTimeout);
