import { createMockTimelock, publishedSetHash, tally } from '@critter-crumbs/core';
import type { CloseRecord, Feast, Hex } from '@critter-crumbs/shared';
import { hexToBytes } from 'viem';
import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
import { encryptedScatter, testEas } from './scatter-support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('API encrypted scatter is decrypted and tallied independently with no fallback from an invalid latest submission', async () => {
  const { api, anotherApi, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner, members } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const first = await encryptedScatter(feast, owner.account, clock());
  const recipient = feast.targets.find(target => target.ownerAddress !== owner.account.address)!;
  const invalid = await encryptedScatter(feast, owner.account, clock(), feast.targets.map(target => target.id === recipient.id ? 99 : 0));
  for (const signed of [first, invalid]) expect((await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed })).status).toBe(200);
  advance(1000);
  const results = await Promise.all(members.map(async member => {
    const client = createMockTimelock({ clock }), read = anotherApi();
    const response = await read({ method: 'GET', path: `${path}/ballots`, headers: member.headers });
    const closeRecord = response.body.closeRecord as CloseRecord;
    expect(publishedSetHash(feast.id, closeRecord.published, closeRecord.counted)).toBe(closeRecord.publishedSetHash);
    const keyReply = await api({ method: 'GET', path: `${path}/key`, headers: member.headers });
    const encrypted = response.body.ballots as { seq: string; uid: Hex; attester: Hex; ciphertext: Hex }[];
    const candidates = await Promise.all(encrypted.map(async entry => ({ ...entry, plaintext: new TextDecoder().decode(await client.decrypt(hexToBytes(entry.ciphertext), hexToBytes(keyReply.body.key as Hex))) })));
    return tally({ feastId: feast.id, crumbsIssued: feast.crumbsPerCritter, targets: feast.targets, participants: feast.participants, publishedSetHash: closeRecord.publishedSetHash, ballots: candidates });
  }));
  expect(results[0]).toEqual(results[1]); expect(results[0]!.totalScattered).toBe(0);
  expect(results[0]!.counted).toEqual([]); expect(results[0]!.rejected).toMatchObject([{ seq: '2', reason: 'invalid_payload' }]);
});
test('API public arrival metadata never grants ciphertext or key access to outsiders', async () => {
  const { api, connect, createFeast, close, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path } = await createFeast({ open: true, aggregatePublic: true }); const outsider = await connect(4); advance(2000);
  expect((await api({ method: 'GET', path, headers: outsider.headers })).status).toBe(200);
  for (const route of ['ballots', 'key']) {
    expect((await api({ method: 'GET', path: `${path}/${route}` })).status).toBe(401);
    expect((await api({ method: 'GET', path: `${path}/${route}`, headers: outsider.headers })).status).toBe(403);
  }
});
