import type { Feast, FeastClock, FeastKind, Phase, ResultView, Statement, Target } from '@critter-crumbs/shared';
export interface PublicFeast extends FeastClock, Partial<ResultView> { id: string; burrowName: string; title: string; context: string; kind: FeastKind; aggregatePublic: boolean; targets: Target[]; portraits: { targetId: string; variant: number }[]; phase: Phase; serverNow: number }
export interface MemberFeast extends Feast, ResultView { burrowName: string; portraits: PublicFeast['portraits']; phase: Phase; serverNow: number; statements: Statement[]; participation: { written: string[]; scattered: string[] }; ownBallotUids: string[]; ownReceipts: { uid: string; seq: string }[] }
export const isMemberFeast = (feast: PublicFeast | MemberFeast): feast is MemberFeast => 'participants' in feast;
export const portraitVariant = (feast: PublicFeast, target: Target) => feast.portraits.find(portrait => portrait.targetId === target.id)?.variant ?? 0;
