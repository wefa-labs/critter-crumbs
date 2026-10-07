import type { Hex, TallyCandidate, ResultAttestation } from '@critter-crumbs/shared';
import { createCloseRecord, participantSetHash, tally, feastBytes32 } from '@critter-crumbs/core';
import { canonicalJSON, parseAllocationPayload, parseAddress } from '@critter-crumbs/shared';
import type { OpenedFeast } from '../app/feast-session.js';
import { isResultState, type GameScreenState, type MemberFeast } from '../app/feast-view.js';
import members from './game-members.js';
export const screenStates:GameScreenState[]=['reveal','scatter','reading','done','scattered','signing','saving','rejected','failed','closed','waiting','key','feast','results','nobody','tie','givers','recording','recorded','public'];
export function fixtureFeast(count:number,state:GameScreenState='scatter'):MemberFeast {
 const people=members.slice(0,count),targets=people.map((p,index)=>({id:('0x'+p.address.toLowerCase().slice(2).padStart(64,'0')) as Hex,ownerAddress:parseAddress(p.address),name:p.name,position:index,kind:'person' as const}));
 return {id:'00000000-0000-4000-8000-000000000026',burrowId:'rehearsal',burrowName:'Rehearsal burrow',title:'Our shared work',context:'',kind:'people',status:'open',phase:isResultState(state)||state==='feast'?'feast':'scattering',serverNow:1791388800000,createdBy:targets[0]!.ownerAddress!,crumbsPerCritter:100,gatheringEndsAt:1791302400000,scatteringEndsAt:1791820800000,aggregatePublic:false,individualOpen:false,gatheringExtended:false,openedAt:1791200000000,cancelledAt:null,participantsFrozenAt:1791302400000,registration:null,closeRecord:null,resultAttestation:null,aggregate:null,targets,participants:targets.map(t=>t.ownerAddress!),portraits:targets.map(t=>({targetId:t.id,variant:0})),statements:targets.map((t,i)=>({targetId:t.id,authorAddress:t.ownerAddress!,body:people[i]!.statement,updatedAt:1791200000000})),participation:{written:targets.map(t=>t.id),scattered:[]},ownBallotUids:[],ownReceipts:[]};
}
export const emptyScatterStates=['reveal','scatter','reading'];
export const noticeIds={reveal:'reveal.title',rejected:'scatter.sign.rejected',failed:'err.saveFailed',closed:'scatter.closed',waiting:'feast.waiting.title',key:'feast.keyNotYet',feast:'feast.sequence'} as const;
export const galleryModes=Object.fromEntries(screenStates.map(state=>[state,state])) as Record<GameScreenState,GameScreenState>;
export const fixturePaused='paused' as const;
export const fixtureReadable='Readable' as const;
export const galleryQuery={state:'state',count:'count',scene:'scene',capture:'capture'};

/** Valid fixture allocations go through the same deterministic tally as a live feast. */
export function fixtureOpened(feast:MemberFeast,state:GameScreenState):OpenedFeast {
 const ballots:TallyCandidate[]=[],givers:OpenedFeast['givers']=[];
 const participants=participantSetHash(feast.participants),people=state==='nobody'?[]:state==='tie'?[feast.participants[1]!]:feast.participants.filter((_,i)=>i!==4);
 people.forEach((attester,i)=>{
  const amounts=feast.targets.map(()=>0),eligible=feast.targets.map((t,index)=>({t,index})).filter(({t})=>t.ownerAddress!==attester);
  if(state==='tie'){amounts[0]=50;amounts[3]=50;}else{let left=100;eligible.forEach(({index},j)=>{const amount=j===eligible.length-1?left:Math.min(left,Math.floor(100/(eligible.length+1))+(index*3+i)%7);amounts[index]=amount;left-=amount;});}
  const seq=String(i+1),uid=('0x'+(i+1).toString(16).padStart(64,'0')) as Hex;
  ballots.push({seq,uid,attester,plaintext:canonicalJSON(parseAllocationPayload({v:1,feast:feast.id,scatterer:attester,participants,allocation:feast.targets.map((t,j)=>[t.id,amounts[j]]),nonce:'0000000000000026'}))});givers.push({seq,uid,attester,amounts});
 });
 const closeRecord=createCloseRecord(feast.id,ballots,feast.scatteringEndsAt);
 return {closeRecord,missingUids:[],givers,result:tally({feastId:feast.id,publishedSetHash:closeRecord.publishedSetHash,crumbsIssued:100,targets:feast.targets,participants:feast.participants,ballots})};
}
export function fixtureRecord(feast:MemberFeast,opened:OpenedFeast):ResultAttestation {return {chainId:84532,txHash:('0x'+'1'.repeat(64)) as Hex,uid:('0x'+'2'.repeat(64)) as Hex,attester:feast.participants[1]!,postedAt:feast.scatteringEndsAt,aggregate:{feastId:feastBytes32(feast.id),publishedSetHash:opened.closeRecord.publishedSetHash,crumbsIssued:100,scatterers:opened.result.counted.length,targetIds:feast.targets.map(t=>t.id),owners:feast.participants,crumbs:opened.result.totals.map(t=>t.crumbs)}};}

export function fixturePublic(feast:MemberFeast,opened:OpenedFeast){const record=fixtureRecord(feast,opened);return {id:feast.id,burrowName:feast.burrowName,title:feast.title,context:feast.context,kind:feast.kind,status:feast.status,gatheringEndsAt:feast.gatheringEndsAt,scatteringEndsAt:feast.scatteringEndsAt,aggregatePublic:true,targets:feast.targets,portraits:feast.portraits,phase:feast.phase,serverNow:feast.serverNow,aggregate:record.aggregate,resultAttestation:record};}
