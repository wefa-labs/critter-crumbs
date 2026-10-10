import { afterEach, expect, test } from 'vitest';
import { ApiClientError, createApiClient, createMockTimelock, createCloseRecord } from '@critter-crumbs/core';
import { bytesToHex,hexToBytes } from 'viem';
import { apiHarness } from './support.js';
import { encryptedScatter, testEas } from './scatter-support.js';
import { signScatter } from '../../packages/app/src/crypto/scatter.js';
import { openFeastResult } from '../../packages/app/src/app/feast-session.js';
import type { MemberFeast } from '../../packages/app/src/app/feast-view.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
async function fixture() {
  const server = await apiHarness({ eas:testEas,dev:{enabled:true,production:false,mode:'mock',setTime:()=>{},releaseKey:()=>{}} }); disposals.push(server.close);
  const group = await server.createFeast({ open:true }); server.advance(1000);
  const view = (await server.api({ method:'GET', path:group.path, headers:group.owner.headers })).body as unknown as MemberFeast;
  const submit = async (member = group.owner, amounts?: number[]) => { const signed = await encryptedScatter(view,member.account,server.clock(),amounts); const saved = await server.api({ method:'POST',path:`${group.path}/ballots`,headers:member.headers,body:signed }); expect(saved.status).toBe(200); return signed; };
  const client = (member = group.owner, change: (path: string, body: Record<string,unknown>) => void = () => {}) => createApiClient({ clock:server.clock, fetch:async (input) => { const path=String(input), response=await server.api({ method:'GET',path,headers:member.headers }); change(path,response.body); return new Response(JSON.stringify(response.body),{ status:response.status }); } });
  const close = async () => { server.advance(1000); return (await client().get(group.path)) as unknown as MemberFeast; };
  return { server, group, view, submit, client, close, timelock:createMockTimelock({ clock:server.clock }) };
}
test('two independent browser clients open real encrypted latest scatters, yield per candidate and produce identical core hashes', async () => {
  const f=await fixture(); const old=await f.submit(); const latest=await f.submit(); await f.submit(f.group.members[0]); const feast=await f.close(); let yields=0;
  const a=await openFeastResult({ api:f.client(),feast,timelock:f.timelock,eas:testEas,acceptedUids:[old.uid,latest.uid],yieldToBrowser:async () => { yields++; } });
  const b=await openFeastResult({ api:f.client(f.group.members[0]),feast,timelock:f.timelock,eas:testEas,yieldToBrowser:async () => {} });
  expect(a?.result.resultHash).toBe(b?.result.resultHash); expect(a?.result.totalScattered).toBe(200); expect(a?.result.counted).toHaveLength(2); expect(a?.missingUids).toEqual([]); expect(yields).toBe(2);
  expect(a?.givers.map(row=>row.uid)).toEqual(a?.result.counted.map(row=>row.uid)); expect(a?.result.counted.map(row=>row.uid)).not.toContain(old.uid);
});
test('unreadable latest ciphertext never revives the previous scatter; missing accepted UIDs stay visible', async () => {
  const f=await fixture(); await f.submit(); const client=createMockTimelock({ clock:f.server.clock });
  const broken=await f.submit(); const feast=await f.close();
  const api=f.client(f.group.owner,(path,body) => { if(path.endsWith('/ballots')) (body.ballots as {ciphertext:string}[]).at(-1)!.ciphertext=bytesToHex(new Uint8Array(30)); });
  const missing=`0x${'ff'.repeat(32)}`;
  const opened=await openFeastResult({ api,feast,timelock:client,eas:testEas,acceptedUids:[missing],yieldToBrowser:async()=>{} });
  expect(opened?.result.totalScattered).toBe(0); expect(opened?.result.rejected).toMatchObject([{ reason:'unreadable' }]); expect(opened?.givers).toEqual([]); expect(opened?.missingUids).toEqual([missing]); expect(opened?.result.counted.map(row=>row.uid)).not.toContain(broken.uid);
});
test('no browser decryption before trusted close; empty publication returns the core zero result', async () => {
  const f=await fixture(); await expect(openFeastResult({ api:f.client(),feast:f.view,timelock:f.timelock,eas:testEas,yieldToBrowser:async()=>{} })).rejects.toMatchObject({ copyId:'feast.keyNotYet' });
  const feast=await f.close(), opened=await openFeastResult({ api:f.client(),feast,timelock:f.timelock,eas:testEas,yieldToBrowser:async()=>{} });
  expect(opened?.result.totals.map(row=>row.share)).toEqual([[0,1],[0,1],[0,1]]); expect(opened?.result.didNotScatter).toHaveLength(3);
});
test('publication omissions and changed close records fail closed instead of silently changing a result', async () => {
  const f=await fixture(); await f.submit(); const feast=await f.close();
  for(const change of [(body:Record<string,unknown>)=>{body.ballots=[];},(body:Record<string,unknown>)=>{body.closeRecord=createCloseRecord(feast.id,[],f.server.clock());}]) {
    await expect(openFeastResult({ api:f.client(f.group.owner,(path,body)=>{if(path.endsWith('/ballots'))change(body);}),feast,timelock:f.timelock,eas:testEas,yieldToBrowser:async()=>{} })).rejects.toMatchObject({ copyId:'err.publicationChanged' });
  }
});

test('the actual browser signer produces the reviewed payload shape and a readable complete scatter',async()=>{
  const f=await fixture(),amounts=f.view.targets.map(target=>target.ownerAddress?.toLowerCase()===f.group.members[0]!.account.address.toLowerCase()?100:0);
  const signed=await signScatter(f.group.owner.account,f.view,amounts,f.server.clock());
  expect((await f.server.api({method:'POST',path:`${f.group.path}/ballots`,headers:f.group.owner.headers,body:signed})).status).toBe(200);
  const feast=await f.close(),opened=await openFeastResult({api:f.client(),feast,timelock:f.timelock,eas:testEas,yieldToBrowser:async()=>{}});
  expect(opened?.result.rejected).toEqual([]);expect(opened?.result.totalScattered).toBe(100);
});

test('key outages use the injected local fallback, while authorization errors never reach it',async()=>{
  const f=await fixture();await f.submit();const feast=await f.close();let fallback=0;
  const timelock={...f.timelock,getKey:async()=>{fallback++;return hexToBytes(feast.registration!.eonKey);}};
  const base=f.client(),api={...base,get:async(path:string)=>{if(path.endsWith('/key'))throw new ApiClientError('err.keyUnreachable',503);return base.get(path);}};
  expect((await openFeastResult({api,feast,timelock,eas:testEas,yieldToBrowser:async()=>{}}))?.result.totalScattered).toBe(100);expect(fallback).toBe(1);
  await expect(openFeastResult({api:{...api,get:async(path:string)=>{if(path.endsWith('/key'))throw new ApiClientError('err.generic',401);return base.get(path);}},feast,timelock,eas:testEas,yieldToBrowser:async()=>{}})).rejects.toMatchObject({status:401});expect(fallback).toBe(1);
});
