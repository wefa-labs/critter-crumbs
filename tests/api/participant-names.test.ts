import { expect, test } from 'vitest';
import { apiHarness, apiTestTimeout, testAccount } from './support.js';

/*
 * PRD F2: a critter's name comes from ENS, else the display name typed at first connect. In an options feast the
 * critters are the options, so the results can name a participant only by the name the burrow knows them by (QA
 * lifecycle-04, rules-05). A member's read of the feast carries it for every participant; a visitor's carries none.
 */
test('a member’s read of an options feast names each participant as the burrow knows them, ENS first; a visitor’s names nobody', async () => {
  const fern = testAccount(2).address;
  const h = await apiHarness({ ens: { lookupName: async address => address.toLowerCase() === fern.toLowerCase() ? 'fern.eth' : null, resolveAddress: async () => null } });
  try {
    const { owner, members, burrowId, path } = await h.createFeast({ kind: 'options', open: true });
    await h.api({ method: 'PUT', path: '/api/me', headers: owner.headers, body: { displayName: 'Moss' } });
    await h.api({ method: 'PUT', path: '/api/me', headers: members[0]!.headers, body: { displayName: 'Fern' } });
    await h.api({ method: 'GET', path: '/api/me', headers: members[0]!.headers });
    h.advance(1000);
    const read = await h.api({ method: 'GET', path, headers: members[1]!.headers });
    const names = read.body.participantNames as { address: string; name: string | null }[];
    expect(names.map(entry => entry.address)).toEqual(read.body.participants);
    expect(Object.fromEntries(names.map(entry => [entry.address, entry.name]))).toEqual({ [owner.account.address]: 'Moss', [fern]: 'fern.eth', [members[1]!.account.address]: null });
    /* a participant who leaves after the freeze is still in the feast, and still named */
    expect((await h.api({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: members[0]!.headers })).status).toBe(200);
    const later = await h.api({ method: 'GET', path, headers: owner.headers });
    expect(later.body.participantNames).toContainEqual({ address: fern, name: 'fern.eth' });
    expect((await h.api({ method: 'GET', path })).body).not.toHaveProperty('participantNames');
  } finally { await h.close(); }
}, apiTestTimeout);
