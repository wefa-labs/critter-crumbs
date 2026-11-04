import { phaseAt } from '@critter-crumbs/core';
import type { CopyId, FeastClock, MemberRemoval, Phase, Profile } from '@critter-crumbs/shared';
import type { MemberFeast } from './feast-view.js';

/** A member as the burrow's view gives them: their profile, and when they joined and left. A pre-added member has not joined. */
export interface BurrowMember extends Profile { membershipVersion: number; joinedAt: number | null; leftAt: number | null }
/** A feast as the burrow's view lists it. `participants` is empty until scattering opens and freezes them. */
export interface BurrowFeast extends FeastClock { id: string; title: string; participantsFrozenAt: number | null; participants: string[] }
/** The burrow as `GET /api/burrows/:id` gives it to a member. Drafts are listed only to the member who made them. */
export interface BurrowView { id: string; name: string; createdBy: string; removals: MemberRemoval[]; serverNow: number; members: BurrowMember[]; feasts: BurrowFeast[] }

export const sameAddress = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
/** The members a burrow has now, pre-added ones among them; those who left or were removed are its past members. */
export const activeMembers = (view: BurrowView) => view.members.filter(member => member.leftAt === null);
/** The burrow's members in its own order, with you last, so that on its floor you stand at the right of the front row (burrow-scenes.ts). */
export const youLast = (members: readonly BurrowMember[], you: string) => [...members.filter(member => !sameAddress(member.address, you)), ...members.filter(member => sameAddress(member.address, you))];

export type OpenPhase = 'gathering' | 'scattering';
const isOpen = (phase: Phase): phase is OpenPhase => phase === 'gathering' || phase === 'scattering';
export interface UnderWay { feast: BurrowFeast; phase: OpenPhase; closes: number }
/** The burrow's feasts under way at `now`, gathering or scattering, the one that closes next first. */
export function feastsUnderWay(feasts: readonly BurrowFeast[], now: number): UnderWay[] {
  return feasts.flatMap(feast => {
    const phase = phaseAt(feast, now);
    return isOpen(phase) ? [{ feast, phase, closes: phase === 'gathering' ? feast.gatheringEndsAt : feast.scatteringEndsAt }] : [];
  }).sort((a, b) => a.closes - b.closes);
}
/** The burrow's other feasts, the latest first: a creator's drafts, and those that have feasted, been cancelled or ended. */
export const otherFeasts = (feasts: readonly BurrowFeast[], now: number) => feasts.filter(feast => !isOpen(phaseAt(feast, now))).sort((a, b) => b.scatteringEndsAt - a.scatteringEndsAt);
/** The day a feast's row gives: when scattering closed, for one that feasted; else when its gathering closed, or would. */
export const feastDay = (feast: FeastClock, phase: Phase) => phase === 'feast' ? feast.scatteringEndsAt : feast.gatheringEndsAt;
/** "Sat 12 Apr" and "2 Sep", in the viewer's own way of writing a day. Formatting reads no clock. */
export const dayLabel = (at: number) => new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(at);
export const dateLabel = (at: number) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(at);

/** One critter in a feast's progress: whose, and whether they have done this phase's part. */
export interface Progress { address: string; done: boolean }
/**
 * Who has done the feast's work so far, as the burrow sees it (PRD R5 and P3). While scattering, everyone taking part,
 * in the order the feast froze them, and whether they have scattered. While gathering a people feast, everyone it has
 * a critter for, and whether their statement is written. An options feast's statements are its creator's to write, so
 * while it gathers there is nobody's progress to show.
 */
export function feastProgress(feast: Pick<MemberFeast, 'kind' | 'participants' | 'participation' | 'targets'>, phase: OpenPhase): Progress[] | null {
  if (phase === 'scattering') return feast.participants.map(address => ({ address, done: feast.participation.scattered.some(scatterer => sameAddress(scatterer, address)) }));
  if (feast.kind !== 'people') return null;
  return feast.targets.flatMap(target => target.ownerAddress ? [{ address: target.ownerAddress, done: feast.participation.written.includes(target.id) }] : []);
}
/**
 * The one gold action on a feast's card, which leads to the feast's page: Scatter crumbs while scattering; while
 * gathering, your statement in a people feast, and the option statements for the creator of an options feast, whose
 * other members have nothing to do until scattering opens. Until the feast's own view arrives its kind is not known,
 * and a gathering feast is taken to be a people feast.
 */
export function feastAction(phase: OpenPhase, feast: Pick<MemberFeast, 'kind' | 'createdBy'> | null, you: string): CopyId | null {
  if (phase === 'scattering') return 'scatter.title';
  if (!feast || feast.kind === 'people') return 'gathering.yours.title';
  return sameAddress(feast.createdBy, you) ? 'gathering.options.title' : null;
}
