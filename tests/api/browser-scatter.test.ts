import { afterEach, expect, test } from 'vitest';
import { createApiClient,createCloseRecord,createMockTimelock } from '@critter-crumbs/core';
import { apiHarness } from './support.js';
import { testEas, encryptedScatter } from './scatter-support.js';
import {createReceiptBook} from '../../packages/app/src/app/receipts.js';
import {openFeastResult} from '../../packages/app/src/app/feast-session.js';
import { createScatterSession } from '../../packages/app/src/app/scatter-session.js';
import type { MemberFeast } from '../../packages/app/src/app/feast-view.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
async function fixture(onAccepted: (receipt:{uid:string;seq:string})=>void=()=>{}) {
  const server = await apiHarness({ eas: testEas }); disposals.push(server.close);
  const { path, owner, members } = await server.createFeast({ open: true }); server.advance(1000);
  let uncertain = false, readsFail = false, rejectSign = false, signed = 0, failVerification = false, dropRead = false;
  const requests: unknown[] = [], accepted: {uid:string;seq:string}[]=[];
  const api = createApiClient({ clock: server.clock, fetch: async (input, init) => {
    if (dropRead && !init?.method) { dropRead = false; throw new Error('verification unavailable'); }
    if (readsFail && !init?.method) throw new Error('offline');
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    if (body) requests.push(body);
    const response = await server.api({ method: init?.method ?? 'GET', path: String(input), headers: owner.headers, body });
    if (failVerification && init?.method === 'POST') { failVerification = false; dropRead = true; }
    if (uncertain && init?.method === 'POST') { uncertain = false; throw new Error('lost response'); }
    return new Response(JSON.stringify(response.body), { status: response.status });
  } });
  const feast = await api.get(path) as unknown as MemberFeast;
  const session = createScatterSession({ api, feast, viewer: owner.account.address, onAccepted:receipt=>{accepted.push(receipt);onAccepted(receipt);}, sign: async (amounts, now, latest) => {
    signed++; if (rejectSign) throw new Error('rejected'); return encryptedScatter(latest, owner.account, now, amounts);
  } });
  const amounts = feast.targets.map(target => target.ownerAddress === members[0]!.account.address ? 100 : 0);
  return { server, api, path, owner, feast, session, amounts, requests, accepted, signed: () => signed, verificationFails() { failVerification = true; }, uncertain() { uncertain = true; }, offline(value: boolean) { readsFail = value; }, reject(value: boolean) { rejectSign = value; } };
}
test('a browser scatter encrypts the complete allocation and confirms its ordered receipt; latest replacement counts', async () => {
  const f = await fixture(); f.session.edit(f.amounts); await f.session.submit();
  expect(f.session.snapshot()).toMatchObject({ status: 'saved', receipt: { seq: '1' }, dirty: false });
  expect(JSON.stringify(f.requests)).not.toContain('allocation');
  const next = f.amounts.map((n, i) => n ? 60 : f.feast.targets[i]!.ownerAddress !== f.owner.account.address ? 40 : 0);
  f.session.edit(next); await f.session.submit();
  expect(f.session.snapshot()).toMatchObject({ status: 'saved', receipt: { seq: '2' }, amounts: next });
  const view = await f.api.get(f.path); expect(view.ownReceipts).toHaveLength(2);
  expect((await f.server.api({ method: 'GET', path: f.path })).body).not.toHaveProperty('ownReceipts');
});
test('an uncertain response is verified without creating another sequence or losing the edited allocation', async () => {
  const f = await fixture(); f.session.edit(f.amounts); f.uncertain(); await f.session.submit();
  expect(f.session.snapshot()).toMatchObject({ status: 'saved', receipt: { seq: '1' } }); expect(f.signed()).toBe(1);
  await f.session.submit(); expect(f.signed()).toBe(1); expect(f.requests).toHaveLength(1);
});
test('rejected signing and offline verification preserve counts; incomplete and self allocations never sign', async () => {
  const f = await fixture(); await expect(f.session.submit()).rejects.toThrow(); expect(f.signed()).toBe(0);
  const self = f.feast.targets.map(target => target.ownerAddress === f.owner.account.address ? 100 : 0);
  expect(() => f.session.edit(self)).toThrow();
  f.session.edit(f.amounts); f.reject(true); await expect(f.session.submit()).rejects.toThrow();
  expect(f.session.snapshot().amounts).toEqual(f.amounts);
  f.reject(false); f.offline(true); await expect(f.session.submit()).rejects.toThrow(); expect(f.session.snapshot().amounts).toEqual(f.amounts);
  f.offline(false); await f.session.submit(); expect(f.session.snapshot().status).toBe('saved');
});
test('another tab reports its latest receipt without overwriting local changes and close preserves the accepted scatter', async () => {
  const f = await fixture(); f.session.edit(f.amounts); await f.session.submit();
  const signed = await encryptedScatter(f.feast, f.owner.account, f.server.clock(), f.amounts);
  await f.server.api({ method: 'POST', path: `${f.path}/ballots`, headers: f.owner.headers, body: signed });
  await f.session.refresh(); expect(f.session.snapshot()).toMatchObject({ remote: { seq: '2' }, amounts: f.amounts });
  const edited = f.amounts.map(n => n ? 99 : 0); f.session.edit(edited); f.server.advance(1000);
  await expect(f.session.submit()).rejects.toThrow();
  expect(f.session.snapshot()).toMatchObject({ amounts: edited, receipt: { seq: '1' } });
});

test('retry verifies the earlier acceptance then saves the current changed allocation', async () => {
  const f = await fixture(); f.session.edit(f.amounts); f.verificationFails(); await expect(f.session.submit()).rejects.toThrow();
  const next = f.amounts.map((n, i) => n ? 60 : f.feast.targets[i]!.ownerAddress !== f.owner.account.address ? 40 : 0);
  f.session.edit(next); await f.session.submit();
  expect(f.requests).toHaveLength(2); expect(f.session.snapshot()).toMatchObject({ status: 'saved', dirty: false, amounts: next, receipt: { seq: '2' } });
});
test('expired public reads request renewal instead of losing edits or failing with a projection error', async () => {
  const f = await fixture(); f.session.edit(f.amounts); f.server.advance(8 * 86400000);
  await expect(f.session.submit()).rejects.toMatchObject({ status: 401, copyId: 'err.sessionExpired' });
  expect(f.session.snapshot().amounts).toEqual(f.amounts); expect(f.requests).toHaveLength(0);
});

test('a background member snapshot resolves an uncertain save without another submission', async () => {
  const f = await fixture(); f.session.edit(f.amounts); f.verificationFails(); await expect(f.session.submit()).rejects.toThrow();
  f.api.invalidate(); f.session.observe(await f.api.get(f.path) as unknown as MemberFeast);
  expect(f.session.snapshot()).toMatchObject({ status: 'saved', receipt: { seq: '1' }, dirty: false }); expect(f.requests).toHaveLength(1);
});

test('a successful acceptance is retained for close-record audit even when its verification read fails',async()=>{
  const f=await fixture();f.session.edit(f.amounts);f.verificationFails();await expect(f.session.submit()).rejects.toThrow();
  expect(f.accepted).toHaveLength(1);expect(f.accepted[0]).toMatchObject({seq:'1'});expect(f.session.snapshot().receipt).toBe(null);
  f.api.invalidate();const view=await f.api.get(f.path);expect((view.ownBallotUids as string[])).toContain(f.accepted[0]!.uid);
});

test('acknowledged UID survives failed verification and restart, exposing a consistent close-record omission',async()=>{
  const data=new Map<string,string>(),storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}},book=createReceiptBook(storage);
  let f:Awaited<ReturnType<typeof fixture>>;f=await fixture(receipt=>book.remember(f.feast.id,f.owner.account.address,receipt.uid));
  f.session.edit(f.amounts);f.verificationFails();await expect(f.session.submit()).rejects.toThrow();f.server.advance(1000);
  const api=createApiClient({clock:f.server.clock,fetch:async(input)=>{const path=String(input),response=await f.server.api({method:'GET',path,headers:f.owner.headers});if(path===f.path || path.endsWith('/ballots'))response.body.closeRecord=createCloseRecord(f.feast.id,[],f.server.clock());if(path===f.path){response.body.ownBallotUids=[];response.body.ownReceipts=[];}if(path.endsWith('/ballots'))response.body.ballots=[];return new Response(JSON.stringify(response.body),{status:response.status});}});
  const feast=await api.get(f.path) as unknown as MemberFeast,acceptedUids=createReceiptBook(storage).read(feast.id,f.owner.account.address);
  const opened=await openFeastResult({api,feast,acceptedUids,timelock:createMockTimelock({clock:f.server.clock}),eas:testEas,yieldToBrowser:async()=>{}});
  expect(opened?.missingUids).toEqual([f.accepted[0]!.uid]);expect(opened?.result.totalScattered).toBe(0);
});
