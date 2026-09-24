import {afterEach,expect,test} from 'vitest';
import {createApiClient,type TxRequest} from '@critter-crumbs/core';
import {apiHarness} from './support.js';
import {testEas} from './scatter-support.js';
import {createLocalResultChain} from '../../scripts/local-result-chain.js';
import {recordLocalResult} from '../../packages/app/src/app/result-recorder.js';
import type {MemberFeast} from '../../packages/app/src/app/feast-view.js';
import {tally} from '@critter-crumbs/core';
const disposals:(()=>Promise<void>)[]=[];afterEach(async()=>{for(const close of disposals.splice(0))await close();});
async function fixture(){
  let server:Awaited<ReturnType<typeof apiHarness>>;const records:unknown[]=[];
  const chain=createLocalResultChain({clock:()=>server.clock(),records:[],save:async value=>{records.push(value);}});
  server=await apiHarness({eas:testEas,resultReader:chain.reader,dev:{enabled:true,production:false,mode:'mock',setTime:()=>{},releaseKey:()=>{},recordTransaction:chain.send}});disposals.push(server.close);
  const group=await server.createFeast({open:true,aggregatePublic:true});server.advance(2000);
  const client=(member=group.owner)=>createApiClient({clock:server.clock,fetch:async(input,init)=>{const response=await server.api({method:init?.method??'GET',path:String(input),headers:member.headers,body:init?.body?JSON.parse(String(init.body)):undefined});return new Response(JSON.stringify(response.body),{status:response.status});}});
  const api=client(),feast=await api.get(group.path) as unknown as MemberFeast;
  const result=tally({feastId:feast.id,publishedSetHash:feast.closeRecord!.publishedSetHash,crumbsIssued:100,targets:feast.targets,participants:feast.participants,ballots:[]});
  const account=(member=group.owner,transport=client(member))=>({...member.account,sendTransaction:async(tx:TxRequest)=>{const sent=await transport.write('/api/dev/result-transaction','POST',{...tx,value:'0',chainId:84532,address:member.account.address,operationId:crypto.randomUUID()});return sent.txHash as `0x${string}`;}});
  return{server,group,client,api,feast,result,account,records,chain};
}
test('Account.sendTransaction records a local Base Sepolia receipt which the established server reader verifies before publication',async()=>{
  const f=await fixture();expect((await f.server.api({method:'GET',path:f.group.path})).body.aggregate).toBe(null);
  let sent=0;const local=f.account();
  const record=await recordLocalResult({api:f.api,feast:f.feast,result:f.result,account:{...local,sendTransaction:async tx=>{sent++;return local.sendTransaction(tx);}}});
  expect(sent).toBe(1);expect(record.chainId).toBe(84532);expect(record.aggregate.crumbs).toEqual([0,0,0]);expect(f.records).toHaveLength(1);
  expect((await f.server.api({method:'GET',path:f.group.path})).body.aggregate).toEqual(record.aggregate);
  const restored=createLocalResultChain({clock:f.server.clock,records:f.chain.snapshot(),save:async()=>{}});expect((await restored.reader.read(record.txHash)).uid).toBe(record.uid);
});
test('rejected local transactions leave results available and retry can record; two recorders observe the first accepted record',async()=>{
  const f=await fixture();await expect(recordLocalResult({api:f.api,feast:f.feast,result:f.result,account:{...f.account(),sendTransaction:async()=>{throw new Error('rejected');}}})).rejects.toThrow();
  const [a,b]=await Promise.all([recordLocalResult({api:f.api,feast:f.feast,result:f.result,account:f.account()}),recordLocalResult({api:f.client(f.group.members[0]),feast:f.feast,result:f.result,account:f.account(f.group.members[0])})]);
  expect(a.uid).toBe(b.uid);expect(f.result.totalScattered).toBe(0);
});
test('the local transaction endpoint requires a session, mock capability, matching account and chain84532',async()=>{
  const f=await fixture();expect((await f.server.api({method:'POST',path:'/api/dev/result-transaction',body:{}})).status).toBe(401);
  expect((await f.server.api({method:'POST',path:'/api/dev/result-transaction',headers:f.group.owner.headers,body:{chainId:8453}})).status).toBe(400);
});
