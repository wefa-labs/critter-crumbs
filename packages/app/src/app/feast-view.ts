import type { Feast, FeastClock, FeastKind, Phase, ResultView, Statement, Target } from '@critter-crumbs/shared';
export interface PublicFeast extends FeastClock, Partial<ResultView> { id: string; burrowName: string; title: string; context: string; kind: FeastKind; aggregatePublic: boolean; targets: Target[]; portraits: { targetId: string; variant: number }[]; phase: Phase; serverNow: number }
export interface MemberFeast extends Feast, ResultView { burrowName: string; portraits: PublicFeast['portraits']; phase: Phase; serverNow: number; statements: Statement[]; participation: { written: string[]; scattered: string[] }; ownBallotUids: string[]; ownReceipts: { uid: string; seq: string }[] }
export const isMemberFeast = (feast: PublicFeast | MemberFeast): feast is MemberFeast => 'participants' in feast;
export const portraitVariant = (feast: PublicFeast, target: Target) => feast.portraits.find(portrait => portrait.targetId === target.id)?.variant ?? 0;

/** Presentation state only; the scatter session still owns signing, receipts and replacement. */
export type GameScreenState = 'reveal'|'scatter'|'reading'|'done'|'scattered'|'signing'|'saving'|'rejected'|'failed'|'closed'|'waiting'|'key'|'feast'|'feasted'|'results'|'nobody'|'tie'|'givers'|'recording'|'recorded'|'public';
export interface GameViewInput { phase: Phase; remaining:number; receipt?:boolean; dirty?:boolean; reveal?:boolean; reading?:boolean; signing?:boolean; saving?:boolean; failure?:'rejected'|'failed'|'closed'; opened?:boolean; playing?:boolean; keyPending?:boolean; resultState?:'nobody'|'tie'|'givers'|'recording'|'recorded'; resultsOpen?:boolean }
export function gameView(input:GameViewInput) {
 const editable=input.phase==='scattering'&&input.failure!=='closed';
 const state:GameScreenState=!editable ? input.failure==='closed'?'closed':input.opened ? input.playing ? 'feast' : input.resultsOpen===false&&input.resultState!=='nobody' ? 'feasted' : input.resultState??'results' : input.keyPending?'key':'waiting' : input.saving?'saving':input.signing?'signing':input.failure??(input.reveal?'reveal':input.reading?'reading':input.receipt&&!input.dirty?'scattered':input.remaining===0?'done':'scatter');
 return {state,editable,reading:state==='reading',results:['results','nobody','tie','givers','recording','recorded','public'].includes(state),remaining:input.remaining};
}

export const isResultState=(state:GameScreenState)=>['results','nobody','tie','givers','recording','recorded','public'].includes(state);
/** The circle's moment: the feast grows everyone. The surface and scene come from the state's composition (game/composition.ts). */
export const layoutMomentFor=(state:GameScreenState):'feast'|'scatter'=>state==='feast'||state==='feasted'?'feast':'scatter';

export const scatterFailure={closed:'closed',rejected:'rejected',failed:'failed'} as const;

export const resultStates={nobody:'nobody',givers:'givers'} as const;

/** Each state by name, for the screens that pick one. */
export const gameStates = { reveal: 'reveal', scatter: 'scatter', reading: 'reading', done: 'done', scattered: 'scattered', signing: 'signing', saving: 'saving', rejected: 'rejected', failed: 'failed', closed: 'closed', waiting: 'waiting', key: 'key', feast: 'feast', feasted: 'feasted', results: 'results', nobody: 'nobody', tie: 'tie', givers: 'givers', recording: 'recording', recorded: 'recorded', public: 'public' } as const satisfies Record<GameScreenState, GameScreenState>;
/** After the feast: the results open, who gave what, or the results folded back into the bar. */
export const resultsViews = { results: 'results', givers: 'givers', closed: 'closed' } as const;
export type ResultsView = keyof typeof resultsViews;

/** Reading from the reveal: a bubble opens its own critter's statement (`?at=`), Start reading the first. */
export const readPath = (feastId: string, at?: number) => `/feasts/${feastId}/read${at === undefined ? '' : `?at=${at}`}`;
export function readingAt(search: string, count: number) {
  const at = Number(new URLSearchParams(search).get('at'));
  return Number.isInteger(at) && at >= 0 && at < count ? at : 0;
}
