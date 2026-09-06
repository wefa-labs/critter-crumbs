import { buildSignInMessage, createApiClient, createLocalAccount, createMockTimelock, participantSetHash, publishedSetHash, signBallot, tally, type Account, type SignInChallenge } from '@critter-crumbs/core';
import { canonicalJSON, type CloseRecord, type Feast, type Hex } from '@critter-crumbs/shared';
import { bytesToHex, hexToBytes } from 'viem';
import { expect, test } from 'vitest';
import { apiHarness, apiTestTimeout } from './support.js';
import { testEas } from './scatter-support.js';

test('API lifecycle: seed → N sign-ins → statements → advance time → scatter and resubmit → advance → release key → two independent tallies produce the same resultHash', async () => {
  let now = 1800000000000;
  const timelock = createMockTimelock({ secret: 'lifecycle-mock-secret-for-tests-only', clock: () => now });
  const { api, close } = await apiHarness({ clock: () => now, timelock, eas: testEas, dev: { enabled: true, production: false, mode: 'mock', setTime: value => { now = value; }, releaseKey: timelock.release } });
  try {
    const seeded = await api({ method: 'POST', path: '/api/dev/seed', body: { phase: 'gathering', kind: 'people' } });
    expect(seeded.status).toBe(201);
    const seed = (seeded.body.feasts as Feast[])[0]!, path = `/api/feasts/${seed.id}`;
    const clients: { account: Account; client: ReturnType<typeof createApiClient> }[] = [];
    for (let index = 1; index <= 8; index++) {
      let cookie: string | undefined;
      const account = createLocalAccount(`0x${index.toString(16).padStart(64, '0')}`);
      const client = createApiClient({ clock: () => now - 5000, fetch: async (url, init) => {
        const response = await api({ method: init?.method ?? 'GET', path: String(url), headers: cookie ? { cookie } : {}, ...(init?.body ? { body: JSON.parse(String(init.body)) as unknown } : {}) });
        if (response.headers['Set-Cookie']) cookie = response.headers['Set-Cookie'].split(';')[0];
        return Response.json(response.body, { status: response.status, headers: response.headers });
      } });
      const challenge = await client.get('/api/session/nonce') as unknown as SignInChallenge;
      await client.write('/api/session', 'POST', { address: account.address, nonce: challenge.nonce, signature: await account.signMessage(buildSignInMessage(account.address, challenge)) });
      const gathering = await client.get(path) as unknown as Feast;
      const own = gathering.targets.find(target => target.ownerAddress === account.address)!;
      await client.write(`${path}/statements/${own.id}`, 'PUT', { body: `Rehearsal contribution ${index}.` });
      clients.push({ account, client });
    }
    expect((await api({ method: 'POST', path: '/api/dev/time', body: { now: seed.gatheringEndsAt } })).status).toBe(200);
    for (const { client } of clients) client.invalidate();
    const feast = await clients[0]!.client.get(path) as unknown as Feast;
    expect(feast.participants).toHaveLength(8);
    async function scatter(index: number, recipientIndex: number) {
      const { account, client } = clients[index]!, recipient = clients[recipientIndex]!.account.address;
      const payload = { v: 1, feast: feast.id, scatterer: account.address.toLowerCase(), participants: participantSetHash(feast.participants), allocation: feast.targets.map(target => [target.id, target.ownerAddress === recipient ? 100 : 0]), nonce: 'ab'.repeat(8) };
      const encryption = createMockTimelock({ clock: () => client.now()! });
      const encrypted = await encryption.encrypt(new TextEncoder().encode(canonicalJSON(payload)), feast.registration!);
      const signed = await signBallot(account, testEas, { feastId: feast.id, shutterIdentity: feast.registration!.identity, ciphertext: bytesToHex(encrypted), now: client.now()! });
      return client.write(`${path}/ballots`, 'POST', signed);
    }
    for (let index = 0; index < 8; index++) expect((await scatter(index, (index + 1) % 8)).seq).toBe(String(index + 1));
    expect((await scatter(0, 2)).seq).toBe('9');
    expect((await api({ method: 'POST', path: '/api/dev/time', body: { now: feast.scatteringEndsAt } })).status).toBe(200);
    expect((await api({ method: 'POST', path: '/api/dev/release-key', body: { identity: feast.registration!.identity } })).status).toBe(200);
    const results = await Promise.all(clients.slice(0, 2).map(async ({ client }) => {
      client.invalidate();
      const closed = await client.get(`${path}/ballots`), closeRecord = closed.closeRecord as CloseRecord;
      expect(publishedSetHash(feast.id, closeRecord.published, closeRecord.counted)).toBe(closeRecord.publishedSetHash);
      expect(closeRecord.published).toHaveLength(9); expect(closeRecord.counted).toHaveLength(8);
      const key = hexToBytes((await client.get(`${path}/key`)).key as Hex), crypto = createMockTimelock({ clock: () => client.now()! });
      const entries = closed.ballots as { uid: Hex; seq: string; attester: Hex; ciphertext: Hex }[];
      const ballots = await Promise.all(entries.map(async entry => ({ ...entry, plaintext: new TextDecoder().decode(await crypto.decrypt(hexToBytes(entry.ciphertext), key)) })));
      return tally({ feastId: feast.id, crumbsIssued: 100, participants: feast.participants, targets: feast.targets, publishedSetHash: closeRecord.publishedSetHash, ballots });
    }));
    expect(results[0]!.resultHash).toBe(results[1]!.resultHash); expect(results[0]).toEqual(results[1]);
    expect(results[0]!.totalScattered).toBe(800); expect(results[0]!.counted).toHaveLength(8); expect(results[0]!.rejected).toEqual([]);
  } finally { await close(); }
}, apiTestTimeout);
