import { participantSetHash, personTargetId, tally } from '@critter-crumbs/core';
import { canonicalJSON, hex, parseAddress, type CopyId } from '@critter-crumbs/shared';
import { CLOVER, FERN, JUNIPER, MOSS } from './painted-scene.js';

/** Public practice data only. Three complete scatters, no self-scattering; Fern gives none and still receives. */
const participants = [MOSS, CLOVER, JUNIPER, FERN].map(parseAddress);
const targets = participants.map((address, position) => ({ id: personTargetId(address), ownerAddress: address, position }));
const feastId = '00000000-0000-4000-8000-000000000001', set = participantSetHash(participants);
const allocations = [[0, 60, 30, 10], [60, 0, 30, 10], [60, 30, 0, 10]];
export const LEARN_RESULT = tally({
  feastId, publishedSetHash: hex(`0x${'00'.repeat(32)}`, 32), crumbsIssued: 100, participants, targets,
  ballots: allocations.map((amounts, i) => ({ attester: participants[i]!, seq: String(i + 1), uid: hex(`0x${String(i + 1).padStart(64, '0')}`, 32),
    plaintext: canonicalJSON({ v: 1, feast: feastId, scatterer: participants[i]!, participants: set, nonce: '0000000000000001', allocation: targets.map((target, j) => [target.id, amounts[j]!]) }) })),
});
const names: CopyId[] = ['learn.example.moss', 'learn.example.clover', 'learn.example.juniper', 'learn.example.fern'];
export const LEARN_RESULT_ROWS = LEARN_RESULT.totals.map((row, i) => ({ ...row, address: participants[i]!, name: names[i]! }));
