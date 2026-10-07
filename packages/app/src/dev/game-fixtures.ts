import type { Address } from '@critter-crumbs/shared';
import type { GameScreenState, MemberFeast } from '../app/feast-view.js';
import members from './game-members.js';
export const screenStates:GameScreenState[]=['reveal','scatter','reading','done','scattered','signing','saving','rejected','failed','closed','waiting','key','feast','results','nobody','tie','givers','recording','recorded'];
export function fixtureFeast(count:number):MemberFeast {
 const people=members.slice(0,count),targets=people.map((p,index)=>({id:p.address as Address,ownerAddress:p.address as Address,name:p.name,position:index,kind:'person' as const}));
 return {id:'october',burrowId:'rehearsal',burrowName:'Rehearsal burrow',title:'Our shared work',context:'',kind:'people',status:'open',phase:'scattering',serverNow:1791388800000,createdBy:targets[0]!.id,crumbsPerCritter:100,gatheringEndsAt:1791302400000,scatteringEndsAt:1791820800000,aggregatePublic:false,individualOpen:false,gatheringExtended:false,openedAt:1791200000000,cancelledAt:null,participantsFrozenAt:1791302400000,registration:null,closeRecord:null,resultAttestation:null,aggregate:null,targets,participants:targets.map(t=>t.id),portraits:targets.map(t=>({targetId:t.id,variant:0})),statements:targets.map((t,i)=>({targetId:t.id,authorAddress:t.id,body:people[i]!.statement,updatedAt:1791200000000})),participation:{written:targets.map(t=>t.id),scattered:[]},ownBallotUids:[],ownReceipts:[]};
}
export const emptyScatterStates=['reveal','scatter','reading'];
export const noticeIds={reveal:'reveal.title',rejected:'scatter.sign.rejected',failed:'err.saveFailed',closed:'scatter.closed',waiting:'feast.waiting.title',key:'feast.keyNotYet',feast:'feast.sequence'} as const;
export const galleryQuery={state:'state',count:'count',scene:'scene',capture:'capture'};
