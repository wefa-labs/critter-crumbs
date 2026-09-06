import type { Feast, SignedOffchainAttestation } from '@critter-crumbs/shared';
import { ballotSchema, feastBytes32, encodeBallot, offchainUID, type Account } from '@critter-crumbs/core';
import { encodeAbiParameters, parseAbiParameters, parseSignature } from 'viem';
import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
import { encryptedScatter, testEas } from './scatter-support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
async function resign(signed: SignedOffchainAttestation, account: Account) {
  signed.uid = offchainUID(signed.message);
  const signature = parseSignature(await account.signTypedData({ domain: signed.domain, types: signed.types, primaryType: 'Attest',
    message: { ...signed.message, time: BigInt(signed.message.time), expirationTime: BigInt(signed.message.expirationTime) } }));
  signed.signature = { r: signature.r, s: signature.s, v: Number(signature.v) as 27 | 28 };
}
type Mutation = (signed: SignedOffchainAttestation, feast: Feast) => void;
const invalidCases: [string, Mutation][] = [
  ['wrong domain version', signed => { signed.domain.version = '1.0.0'; }],
  ['wrong chain', signed => { signed.domain.chainId = 8453; }],
  ['wrong domain name', signed => { signed.domain.name = 'Different attestation'; }],
  ['wrong contract', signed => { signed.domain.verifyingContract = '0x0000000000000000000000000000000000000001'; }],
  ['wrong schema', signed => { signed.message.schema = `0x${'ff'.repeat(32)}`; }],
  ['wrong feast', (signed, feast) => { signed.message.data = encodeBallot({ feastId: '00000000-0000-4000-8000-000000000002', shutterIdentity: feast.registration!.identity, ciphertext: '0x11' }); }],
  ['wrong Shutter identity', (signed, feast) => { signed.message.data = encodeBallot({ feastId: feast.id, shutterIdentity: `0x${'ff'.repeat(32)}`, ciphertext: '0x11' }); }],
  ['stale time', signed => { signed.message.time = String(BigInt(signed.message.time) - 301n); }],
  ['future time', signed => { signed.message.time = String(BigInt(signed.message.time) + 301n); }],
  ['nonzero recipient', signed => { signed.message.recipient = '0x0000000000000000000000000000000000000001'; }],
  ['expiring attestation', signed => { signed.message.expirationTime = '1'; }],
  ['revocable attestation', signed => { signed.message.revocable = true; }],
  ['nonzero reference', signed => { signed.message.refUID = `0x${'ff'.repeat(32)}`; }],
  ['oversized ciphertext', (signed, feast) => { signed.message.data = encodeBallot({ feastId: feast.id, shutterIdentity: feast.registration!.identity, ciphertext: `0x${'11'.repeat(4097)}` }); }],
  ['unsupported payload version', (signed, feast) => { signed.message.data = encodeAbiParameters(parseAbiParameters(ballotSchema), [feastBytes32(feast.id), feast.registration!.identity, '0x11', 2]); }],
  ['wrong typed fields', signed => { signed.types.Attest[0]!.type = 'uint64'; }],
  ['malformed schema data', signed => { signed.message.data = '0x11'; }],
];
test.each(invalidCases)('API ballot verification rejects %s even with a valid signature', async (_, change) => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock()); change(signed, feast); await resign(signed, owner.account);
  const response = await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed });
  expect(response.status).toBe(400); expect(response.body.error).toBe('err.generic');
  expect((await api({ method: 'GET', path, headers: owner.headers })).body.ownBallotUids).toEqual([]);
});
test('API ballot verification rejects a signature made by a different participant', async () => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner, members } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: members[0]!.headers, body: signed })).status).toBe(400);
});
test('API ballot verification rejects a member added after participants froze', async () => {
  const { api, createFeast, connect, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner, burrowId } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const late = await connect(4);
  await api({ method: 'POST', path: `/api/burrows/${burrowId}/members`, headers: owner.headers, body: { address: late.account.address } });
  const signed = await encryptedScatter(feast, late.account, clock());
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: late.headers, body: signed })).body.error).toBe('err.notParticipant');
});

test.each([-300, 300])('API ballot verification accepts the inclusive %s-second time tolerance and 4 KB ciphertext', async offset => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  signed.message.time = String(BigInt(signed.message.time) + BigInt(offset));
  signed.message.data = encodeBallot({ feastId: feast.id, shutterIdentity: feast.registration!.identity, ciphertext: `0x${'11'.repeat(4096)}` });
  await resign(signed, owner.account);
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body: signed })).status).toBe(200);
});
test.each(['signature', 'uid', 'server sequence'] as const)('API ballot verification rejects tampered %s metadata', async field => {
  const { api, createFeast, close, clock, advance } = await apiHarness({ eas: testEas }); disposals.push(close);
  const { path, owner } = await createFeast({ open: true }); advance(1000);
  const feast = (await api({ method: 'GET', path, headers: owner.headers })).body as unknown as Feast;
  const signed = await encryptedScatter(feast, owner.account, clock());
  const body = field === 'server sequence' ? { ...signed, seq: '999' } : signed;
  if (field === 'uid') signed.uid = `0x${'ff'.repeat(32)}`;
  if (field === 'signature') signed.signature.r = `0x${'ff'.repeat(32)}`;
  expect((await api({ method: 'POST', path: `${path}/ballots`, headers: owner.headers, body })).status).toBe(400);
});
