import {ApiClientError,prepareResultTransaction,resultSchema,schemaUID,type Account} from '@critter-crumbs/core';
import {type ResultAttestation,type TallyResult} from '@critter-crumbs/shared';
import {zeroAddress} from 'viem';
import type {MemberFeast} from './feast-view.js';
import {isMemberFeast} from './feast-view.js';
import type {AppApi} from './session.js';
/** Recording is optional to local completion; the established API verifies every receipt. */
export async function recordLocalResult({api,feast,result,account}:{api:AppApi;feast:MemberFeast;result:TallyResult;account:Account}) {
  const read=async()=>{api.invalidate();const latest=await api.get(`/api/feasts/${feast.id}`) as unknown as MemberFeast;if(!isMemberFeast(latest))throw new ApiClientError('err.sessionExpired',401);return latest;};
  const before=await read();if(before.resultAttestation)return before.resultAttestation;
  if(!feast.aggregatePublic || !feast.closeRecord || !account.sendTransaction)throw new ApiClientError('err.storeUnreachable',503);
  const transaction=prepareResultTransaction({chainId:84532,address:'0x4200000000000000000000000000000000000021',resultSchemaUid:schemaUID(resultSchema)},
    {feastId:feast.id,publishedSetHash:feast.closeRecord.publishedSetHash,crumbsIssued:feast.crumbsPerCritter,scatterers:result.counted.length,targetIds:feast.targets.map(target=>target.id),owners:feast.targets.map(target=>target.ownerAddress??zeroAddress),crumbs:feast.targets.map(target=>result.totals.find(total=>total.targetId===target.id)!.crumbs)});
  const txHash=await account.sendTransaction(transaction);
  let failure:unknown;
  try{await api.write(`/api/feasts/${feast.id}/result-attestation`,'POST',{txHash,attester:account.address});}catch(error){failure=error;}
  const saved=(await read()).resultAttestation;
  if(!saved)throw failure??new ApiClientError('err.storeUnreachable',503);
  return saved as ResultAttestation;
}
