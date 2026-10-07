import type { Feast, FeastClock, FeastKind, Phase, ResultView, Statement, Target } from '@critter-crumbs/shared';
export interface PublicFeast extends FeastClock, Partial<ResultView> { id: string; burrowName: string; title: string; context: string; kind: FeastKind; aggregatePublic: boolean; targets: Target[]; portraits: { targetId: string; variant: number }[]; phase: Phase; serverNow: number }
export interface MemberFeast extends Feast, ResultView { burrowName: string; portraits: PublicFeast['portraits']; phase: Phase; serverNow: number; statements: Statement[]; participation: { written: string[]; scattered: string[] }; ownBallotUids: string[]; ownReceipts: { uid: string; seq: string }[] }
export const isMemberFeast = (feast: PublicFeast | MemberFeast): feast is MemberFeast => 'participants' in feast;
export const portraitVariant = (feast: PublicFeast, target: Target) => feast.portraits.find(portrait => portrait.targetId === target.id)?.variant ?? 0;

/** Presentation state only; the scatter session still owns signing, receipts and replacement. */
export type GameScreenState = 'reveal'|'scatter'|'reading'|'done'|'scattered'|'signing'|'saving'|'rejected'|'failed'|'closed'|'waiting'|'key'|'feast'|'results'|'nobody'|'tie'|'givers'|'recording'|'recorded';
export interface GameViewInput { phase: Phase; remaining:number; receipt?:boolean; dirty?:boolean; reveal?:boolean; reading?:boolean; signing?:boolean; saving?:boolean; failure?:'rejected'|'failed'|'closed'; opened?:boolean; playing?:boolean; keyPending?:boolean; resultState?:'nobody'|'tie'|'givers'|'recording'|'recorded' }
export function gameView(input:GameViewInput) {
 const editable=input.phase==='scattering'&&input.failure!=='closed';
 const state:GameScreenState=!editable ? input.failure==='closed'?'closed':input.opened ? input.playing ? 'feast' : input.resultState??'results' : input.keyPending?'key':'waiting' : input.saving?'saving':input.signing?'signing':input.failure??(input.reveal?'reveal':input.reading?'reading':input.receipt&&!input.dirty?'scattered':input.remaining===0?'done':'scatter');
 return {state,editable,reading:state==='reading',results:['results','nobody','tie','givers','recording','recorded'].includes(state),remaining:input.remaining};
}

export const isResultState=(state:GameScreenState)=>['results','nobody','tie','givers','recording','recorded'].includes(state);
export const layoutStateFor=(state:GameScreenState,reading:boolean):'results'|'reading'|'feast'|'scatter'=>isResultState(state)?'results':reading?'reading':state==='feast'?'feast':'scatter';

export const scatterFailure={closed:'closed',rejected:'rejected',failed:'failed'} as const;
