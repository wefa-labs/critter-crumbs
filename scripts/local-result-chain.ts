import recorded from '../packages/core/test/fixtures/eas-base-record.json' with {type:'json'};
import {createEasReader,decodeResult,easAbi,resultSchema,schemaUID} from '@critter-crumbs/core';
import {canonicalJSON,hex,parseAddress,parseUuid,record,type Address,type Hex} from '@critter-crumbs/shared';
import {decodeFunctionData,encodeEventTopics,encodeFunctionResult,keccak256,stringToHex,zeroAddress,zeroHash} from 'viem';
export interface LocalResultTransaction { operationId:string;txHash:Hex;uid:Hex;actor:Address;data:Hex;time:string;block:string }
const address='0x4200000000000000000000000000000000000021' as const;
const resultSchemaUid=schemaUID(resultSchema);
/** A recorded RPC-shape fixture. No transport in this module can reach a chain. */
export function createLocalResultChain(options:{clock:()=>number;records:LocalResultTransaction[];save:(records:LocalResultTransaction[])=>Promise<void>}) {
  let records=structuredClone(options.records),serial=Promise.resolve();
  const responses=recorded.observations[1]!.responses;
  const template=(id:number)=>responses.find(response=>response.id===id)!.result as Record<string,unknown>;
  const blockHash=(block:string)=>keccak256(stringToHex(`critter-crumbs/local-result-block/${block}`));
  const fetch:typeof globalThis.fetch=async(_url,init)=>{
    const request=JSON.parse(String(init?.body)) as {id:number;method:string;params:unknown[]};let result:unknown;
    if(request.method==='eth_chainId')result='0x14a34';
    else if(request.method==='eth_getTransactionReceipt') {
      const tx=records.find(tx=>tx.txHash===request.params[0]);if(!tx)throw new Error('Local receipt absent');
      const hash=blockHash(tx.block);
      result={...template(1),status:'0x1',transactionHash:tx.txHash,from:tx.actor,to:address,blockNumber:tx.block,blockHash:hash,logs:[{...recorded.selectedLog,address,transactionHash:tx.txHash,blockNumber:tx.block,blockHash:hash,removed:false,data:tx.uid,topics:encodeEventTopics({abi:easAbi,eventName:'Attested',args:{recipient:zeroAddress,attester:tx.actor,schemaUID:resultSchemaUid}})}]};
    } else if(request.method==='eth_getBlockByNumber') {
      const tx=request.params[0]==='finalized'?records.at(-1):records.find(tx=>tx.block===request.params[0]);if(!tx)throw new Error('Local block absent');
      result={...template(3),number:tx.block,hash:blockHash(tx.block),timestamp:`0x${BigInt(tx.time).toString(16)}`};
    } else if(request.method==='eth_call') {
      const call=decodeFunctionData({abi:easAbi,data:(request.params[0] as {data:Hex}).data});
      const tx=records.find(tx=>tx.uid===call.args?.[0]);if(!tx || tx.block!==request.params[1])throw new Error('Local attestation absent');
      result=encodeFunctionResult({abi:easAbi,functionName:'getAttestation',result:{uid:tx.uid,schema:resultSchemaUid,time:BigInt(tx.time),expirationTime:0n,revocationTime:0n,refUID:zeroHash,recipient:zeroAddress,attester:tx.actor,revocable:false,data:tx.data}});
    } else throw new Error('Unsupported local RPC method');
    return Response.json({jsonrpc:'2.0',id:request.id,result});
  };
  return {
    reader:createEasReader({chainId:84532,address,resultSchemaUid,rpcUrl:'https://local-result-fixture.invalid',fetch}),
    snapshot:()=>structuredClone(records),
    async send(actor:Address,input:unknown):Promise<{txHash:Hex}> {
      const body=record(input);
      if(body.chainId!==84532 || parseAddress(body.address)!==parseAddress(actor) || parseAddress(body.to)!==address || body.value!=='0')throw new TypeError('Invalid local transaction');
      const operationId=parseUuid(body.operationId),data=hex(body.data);
      const call=decodeFunctionData({abi:easAbi,data});if(call.functionName!=='attest')throw new TypeError('Only result attestations are supported locally');
      const request=call.args[0];if(request.schema!==resultSchemaUid || request.data.recipient!==zeroAddress || request.data.expirationTime!==0n || request.data.revocable || request.data.refUID!==zeroHash || request.data.value!==0n)throw new TypeError('Invalid local result envelope');
      decodeResult(request.data.data);
      const txHash=keccak256(stringToHex(canonicalJSON({operationId,actor:parseAddress(actor),data,chainId:84532}))),uid=keccak256(stringToHex(`critter-crumbs/local-result/${txHash}`));
      const operation=serial.then(async()=>{
        const existing=records.find(tx=>tx.operationId===operationId);
        if(existing){if(existing.txHash!==txHash)throw new TypeError('Local operation changed');return;}
        const next=[...records,{operationId,txHash,uid,actor:parseAddress(actor),data:request.data.data,time:String(Math.ceil(options.clock()/1000)),block:`0x${(records.length+1).toString(16)}`} satisfies LocalResultTransaction];
        await options.save(next);records=next;
      });serial=operation.catch(()=>{});await operation;return{txHash};
    },
  };
}
