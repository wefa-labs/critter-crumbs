import { expect, test } from 'vitest';
import type { Feast } from '@critter-crumbs/shared';
import { apiHarness, apiTestTimeout } from './support.js';
import { resultFixture } from './result-fixture.js';

test('API result record verifies Base provenance and exposes public numbers only after recording', async () => {
  const fixture = resultFixture(); const { api, createFeast, advance, close } = await apiHarness({ resultReader: fixture.reader });
  try {
    const { path, owner } = await createFeast({ open: true, aggregatePublic: true }); advance(2000);
    const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
    expect((await api({ method: 'GET', path })).body.aggregate).toBeNull();
    const txHash = fixture.add(feast, owner.account.address);
    const saved = await api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: { txHash, attester: owner.account.address } });
    expect(saved.status).toBe(200);
    expect(saved.body.resultAttestation).toMatchObject({ chainId: 8453, txHash, attester: owner.account.address });
    const publicRead = await api({ method: 'GET', path });
    expect(publicRead.body.aggregate).toMatchObject({ scatterers: 0, crumbs: [0, 0, 0] });
    expect(publicRead.body).not.toHaveProperty('closeRecord'); expect(publicRead.body).not.toHaveProperty('statements');
  } finally { await close(); }
}, apiTestTimeout);

test.each(['draft', 'gathering', 'scattering', 'cancelled', 'void', 'private', 'nonmember', 'anonymous'] as const)('API result record gates %s before requesting Base', async state => {
  const fixture = resultFixture(); const h = await apiHarness({ resultReader: fixture.reader });
  try {
    const { path, owner, members, burrowId } = await h.createFeast({ open: state !== 'draft', aggregatePublic: state !== 'private' });
    if (state === 'cancelled') await h.api({ method: 'POST', path: `${path}/cancel`, headers: owner.headers });
    if (state === 'void') { await h.api({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: members[0]!.headers }); h.advance(2000); }
    if (state === 'scattering') h.advance(1000);
    if (['private', 'nonmember', 'anonymous'].includes(state)) h.advance(2000);
    const headers = state === 'anonymous' ? {} : state === 'nonmember' ? (await h.connect(4)).headers : owner.headers;
    const result = await h.api({ method: 'POST', path: `${path}/result-attestation`, headers, body: { txHash: `0x${'11'.repeat(32)}`, attester: owner.account.address } });
    expect(result.status).toBe(state === 'anonymous' ? 401 : ['private', 'nonmember'].includes(state) ? 403 : 400);
    expect(fixture.calls).toBe(0);
  } finally { await h.close(); }
}, apiTestTimeout);

test.each(['feast', 'close hash', 'issued crumbs', 'target order', 'owners', 'scatterers', 'total'] as const)('API result record rejects mismatched %s without publishing numbers', async change => {
  const fixture = resultFixture(); const h = await apiHarness({ resultReader: fixture.reader });
  try {
    const { path, owner } = await h.createFeast({ open: true, aggregatePublic: true }); h.advance(2000);
    const feast = (await h.api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
    const overrides = change === 'feast' ? { feastId: '00000000-0000-4000-8000-000000000001' } : change === 'close hash' ? { publishedSetHash: `0x${'11'.repeat(32)}` as const }
      : change === 'issued crumbs' ? { crumbsIssued: 10 } : change === 'target order' ? { targetIds: feast.targets.map(t => t.id).reverse() }
      : change === 'owners' ? { owners: feast.targets.map(() => owner.account.address) } : change === 'scatterers' ? { scatterers: 1, crumbs: [100, 0, 0] } : { crumbs: [1, 0, 0] };
    const txHash = fixture.add(feast, owner.account.address, undefined, overrides);
    const saved = await h.api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: { txHash, attester: owner.account.address } });
    expect(saved.status).toBe(400); expect(saved.body.error).toBe('err.generic');
    expect((await h.api({ method: 'GET', path })).body.aggregate).toBeNull();
  } finally { await h.close(); }
}, apiTestTimeout);

test('API result record commits the first concurrent post once and returns it on retries', async () => {
  const fixture = resultFixture(); const h = await apiHarness({ resultReader: fixture.reader });
  try {
    const { path, owner, members } = await h.createFeast({ open: true, aggregatePublic: true }); h.advance(2000);
    const feast = (await h.api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
    const actors = [owner, members[0]!]; const hashes = actors.map((actor, i) => fixture.add(feast, actor.account.address, `0x${String(i+1).repeat(64)}`));
    const responses = await Promise.all(actors.map((actor, i) => h.anotherApi()({ method: 'POST', path: `${path}/result-attestation`, headers: actor.headers, body: { txHash: hashes[i], attester: actor.account.address } })));
    expect(responses.map(r => r.status)).toEqual([200, 200]);
    expect(responses[0]!.body.resultAttestation).toEqual(responses[1]!.body.resultAttestation);
    const calls = fixture.calls;
    const retry = await h.api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: {} });
    expect(retry.body.resultAttestation).toEqual(responses[0]!.body.resultAttestation); expect(fixture.calls).toBe(calls);
  } finally { await h.close(); }
}, apiTestTimeout);

test.each(['recipient', 'expirationTime', 'revocationTime', 'revocable', 'refUID', 'time'] as const)('API result record rejects invalid stored %s', async field => {
  const fixture = resultFixture();
  const reader = { async read(tx: Parameters<typeof fixture.reader.read>[0]) {
    const value = await fixture.reader.read(tx);
    return { ...value, [field]: field === 'recipient' ? '0x0000000000000000000000000000000000000001' : field === 'revocable' ? true : field === 'refUID' ? `0x${'11'.repeat(32)}` : '1' };
  } };
  const h = await apiHarness({ resultReader: reader });
  try {
    const { path, owner } = await h.createFeast({ open: true, aggregatePublic: true }); h.advance(2000);
    const feast = (await h.api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
    const txHash = fixture.add(feast, owner.account.address);
    const saved = await h.api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: { txHash, attester: owner.account.address } });
    expect(saved.status).toBe(400);
  } finally { await h.close(); }
}, apiTestTimeout);

test.each(['claimed', 'onchain'] as const)('API result record rejects another %s attester', async mismatch => {
  const fixture = resultFixture(); const h = await apiHarness({ resultReader: fixture.reader });
  try {
    const { path, owner, members } = await h.createFeast({ open: true, aggregatePublic: true }); h.advance(2000);
    const feast = (await h.api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
    const txHash = fixture.add(feast, mismatch === 'onchain' ? members[0]!.account.address : owner.account.address);
    const saved = await h.api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: { txHash, attester: mismatch === 'claimed' ? members[0]!.account.address : owner.account.address } });
    expect(saved.status).toBe(403);
  } finally { await h.close(); }
}, apiTestTimeout);

test('API result record rechecks membership after Base verification', async () => {
  const fixture = resultFixture(); let leave = async () => {};
  const h = await apiHarness({ resultReader: { async read(tx) { const result = await fixture.reader.read(tx); await leave(); return result; } } });
  try {
    const { path, owner, burrowId } = await h.createFeast({ open: true, aggregatePublic: true }); h.advance(2000);
    const feast = (await h.api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
    const txHash = fixture.add(feast, owner.account.address);
    leave = async () => { expect((await h.api({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: owner.headers })).status).toBe(200); };
    expect((await h.api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: { txHash, attester: owner.account.address } })).status).toBe(403);
    expect((await h.api({ method: 'GET', path })).body.aggregate).toBeNull();
  } finally { await h.close(); }
}, apiTestTimeout);

test('API result record leaves optional recording retryable when Base is unavailable', async () => {
  const h = await apiHarness({ resultReader: { async read() { throw new Error('RPC unavailable'); } } });
  try {
    const { path, owner } = await h.createFeast({ open: true, aggregatePublic: true }); h.advance(2000);
    const saved = await h.api({ method: 'POST', path: `${path}/result-attestation`, headers: owner.headers, body: { txHash: `0x${'11'.repeat(32)}`, attester: owner.account.address } });
    expect(saved.status).toBe(503); expect(saved.body.error).toBe('err.storeUnreachable');
    expect((await h.api({ method: 'GET', path, headers: owner.headers })).body.phase).toBe('feast');
  } finally { await h.close(); }
}, apiTestTimeout);
