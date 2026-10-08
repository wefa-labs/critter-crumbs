import type { Hex, TallyCandidate, ResultAttestation } from '@critter-crumbs/shared';
import { createCloseRecord, participantSetHash, tally, feastBytes32 } from '@critter-crumbs/core';
import { canonicalJSON, parseAllocationPayload, parseAddress } from '@critter-crumbs/shared';
import type { OpenedFeast } from '../app/feast-session.js';
import { isResultState, type GameScreenState, type MemberFeast } from '../app/feast-view.js';
import members from './game-members.js';
export const screenStates: GameScreenState[] = ['reveal', 'scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed', 'closed', 'waiting', 'key', 'feast', 'feasted', 'results', 'nobody', 'tie', 'givers', 'recording', 'recorded', 'public'];
export const galleryQuery = { state: 'state', count: 'count', scene: 'scene', capture: 'capture' };
/** The scattering moments, drawn over a fixture world rather than the live session. */
export const scatteringStates: GameScreenState[] = ['scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed', 'closed'];
export const galleryUrl = (state: GameScreenState, count: number, scene: string) => `/dev/screens?capture&state=${state}&count=${count}&scene=${scene}`;
/** The feast's still frame stops the world's clock. */
export const stillFrame = 'paused' as const;
/** The gallery shows the viewer's own critter third, as the review pages do. */
export const VIEWER = 2;
/** The review pages' clock: scattering closes in 2 days, on Wed 7 Oct at 18:00 PDT. */
export const CLOSES_AT = Date.UTC(2026, 9, 8, 1), SERVER_NOW = CLOSES_AT - 2 * 86400000;

/** Largest remainder, so a seed always adds up exactly; members with no weight stay at zero (the review pages' distribute). */
export function distribute(weights: readonly number[], total: number) {
  const all = weights.reduce((sum, weight) => sum + weight, 0);
  if (!all) return weights.map(() => 0);
  const raw = weights.map(weight => weight / all * total), out = raw.map(Math.floor);
  const order = raw.map((value, index) => [value - out[index]!, index] as const).filter(([, index]) => weights[index]! > 0).sort((a, b) => b[0] - a[0]);
  for (let j = 0, left = total - out.reduce((sum, value) => sum + value, 0); left > 0; j++, left--) out[order[j % order.length]![1]]!++;
  return out;
}

/**
 * The scatter page's seed (castFor): while scattering, 88 crumbs given and 12 left, with Acorn (or the last critter that
 * is not yours) given nothing; all given, Acorn gets a little; at the feast, Acorn is the one who did not scatter.
 */
export function referenceCast(count: number) {
  const people = members.slice(0, count);
  const acorn = people.findIndex(member => member.name === 'Acorn'), others = people.map((member, index) => member.own ? -1 : index), zero = acorn >= 0 ? acorn : Math.max(...others);
  return {
    zero,
    scattering: distribute(people.map((member, index) => member.own || index === zero ? 0 : member.weight), 88),
    given: distribute(people.map((member, index) => member.own ? 0 : index === zero ? 8 : member.weight), 100),
    received: distribute(people.map(member => member.received), (count - 1) * 100),
  };
}
/** What the circle holds in each scattering state: nothing before reading, 88 of 100 while scattering, all of it after. */
export function fixtureAllocation(state: GameScreenState, count: number) {
  const cast = referenceCast(count);
  return state === 'reveal' ? cast.scattering.map(() => 0) : state === 'scatter' || state === 'reading' ? cast.scattering : cast.given;
}

export function fixtureFeast(count: number, state: GameScreenState = 'scatter'): MemberFeast {
  const people = members.slice(0, count), targets = people.map((p, index) => ({ id: ('0x' + p.address.toLowerCase().slice(2).padStart(64, '0')) as Hex, ownerAddress: parseAddress(p.address), name: p.name, position: index, kind: 'person' as const }));
  return { id: '00000000-0000-4000-8000-000000000026', burrowId: 'rehearsal', burrowName: 'Rehearsal burrow', title: 'Our shared work', context: '', kind: 'people', status: 'open', phase: isResultState(state) || state === 'feast' || state === 'feasted' || state === 'waiting' || state === 'key' ? 'feast' : 'scattering', serverNow: SERVER_NOW, createdBy: (targets[VIEWER] ?? targets[0]!).ownerAddress!, crumbsPerCritter: 100, gatheringEndsAt: SERVER_NOW - 86400000, scatteringEndsAt: CLOSES_AT, aggregatePublic: state === 'recording' || state === 'recorded' || state === 'public', individualOpen: state === 'givers', gatheringExtended: false, openedAt: SERVER_NOW - 5 * 86400000, cancelledAt: null, participantsFrozenAt: SERVER_NOW - 86400000, registration: null, closeRecord: null, resultAttestation: null, aggregate: null, targets, participants: targets.map(t => t.ownerAddress!), portraits: targets.map(t => ({ targetId: t.id, variant: 0 })), statements: targets.map((t, i) => ({ targetId: t.id, authorAddress: t.ownerAddress!, body: people[i]!.statement, updatedAt: SERVER_NOW - 2 * 86400000 })), participation: { written: targets.map(t => t.id), scattered: [] }, ownBallotUids: [], ownReceipts: [] };
}

/**
 * Valid fixture scatters, opened through the same deterministic tally as a live feast. Each giver shares their 100 by
 * what everyone received, varied a little per giver, as the flow page's who-gave-what table does (giversTable); the
 * totals land near the scatter page's. One scatterer splitting evenly makes the tie (flow 46); nobody, no scatters.
 */
export function fixtureOpened(feast: MemberFeast, state: GameScreenState): OpenedFeast {
  const ballots: TallyCandidate[] = [], givers: OpenedFeast['givers'] = [], n = feast.targets.length, cast = referenceCast(n);
  const participants = participantSetHash(feast.participants);
  const scatterers = state === 'nobody' ? [] : state === 'tie' ? [1] : feast.participants.map((_, index) => index).filter(index => index !== cast.zero);
  scatterers.forEach((g, i) => {
    const attester = feast.participants[g]!;
    const amounts = state === 'tie' ? feast.targets.map((_, c) => c === 0 || c === 3 ? 50 : 0) : distribute(feast.targets.map((_, c) => c === g ? 0 : cast.received[c]! * (1 + (((g * 5 + c * 3) % 7) - 3) * 0.08)), 100);
    const seq = String(i + 1), uid = ('0x' + (i + 1).toString(16).padStart(64, '0')) as Hex;
    ballots.push({ seq, uid, attester, plaintext: canonicalJSON(parseAllocationPayload({ v: 1, feast: feast.id, scatterer: attester, participants, allocation: feast.targets.map((t, j) => [t.id, amounts[j]!]), nonce: '0000000000000026' })) });
    givers.push({ seq, uid, attester, amounts });
  });
  const closeRecord = createCloseRecord(feast.id, ballots, feast.scatteringEndsAt);
  return { closeRecord, missingUids: [], givers, result: tally({ feastId: feast.id, publishedSetHash: closeRecord.publishedSetHash, crumbsIssued: 100, targets: feast.targets, participants: feast.participants, ballots }) };
}
export function fixtureRecord(feast: MemberFeast, opened: OpenedFeast): ResultAttestation { return { chainId: 84532, txHash: ('0x' + '1'.repeat(64)) as Hex, uid: ('0x' + '2'.repeat(64)) as Hex, attester: feast.participants[1]!, postedAt: feast.scatteringEndsAt, aggregate: { feastId: feastBytes32(feast.id), publishedSetHash: opened.closeRecord.publishedSetHash, crumbsIssued: 100, scatterers: opened.result.counted.length, targetIds: feast.targets.map(t => t.id), owners: feast.participants, crumbs: opened.result.totals.map(t => t.crumbs) } }; }

export function fixturePublic(feast: MemberFeast, opened: OpenedFeast) { const record = fixtureRecord(feast, opened); return { id: feast.id, burrowName: feast.burrowName, title: feast.title, context: feast.context, kind: feast.kind, status: feast.status, gatheringEndsAt: feast.gatheringEndsAt, scatteringEndsAt: feast.scatteringEndsAt, aggregatePublic: true, targets: feast.targets, portraits: feast.portraits, phase: feast.phase, serverNow: feast.serverNow, aggregate: record.aggregate, resultAttestation: record }; }
