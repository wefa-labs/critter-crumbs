import {
  canonicalJSON, hex, integer, parseUuid, parseSequence, parseAddress, parseAllocationPayload,
  type Address, type Hex, type TallyInput, type TallyCandidate, type TallyResult,
} from '@critter-crumbs/shared';
import { keccak256, stringToHex } from 'viem';
export type { TallyInput, TallyResult, TallyCandidate } from '@critter-crumbs/shared';

const hashJSON = (value: unknown): Hex => keccak256(stringToHex(canonicalJSON(value)));
export function participantSetHash(participants: readonly Address[]): Hex { return hashJSON(orderedParticipants(participants)); }
function orderedParticipants(participants: readonly Address[]): Address[] {
  const addresses = participants.map(parseAddress).sort(); unique(addresses); return addresses;
}
function unique(values: readonly (string | number)[]): void {
  if (new Set(values).size !== values.length) throw new TypeError('Ambiguous tally input');
}
function normalize(raw: TallyInput): TallyInput {
  const input: TallyInput = {
    feastId: parseUuid(raw.feastId), publishedSetHash: hex(raw.publishedSetHash, 32), crumbsIssued: integer(raw.crumbsIssued, 10, 1000),
    participants: orderedParticipants(raw.participants),
    targets: raw.targets.map(target => ({ id: hex(target.id, 32), position: integer(target.position, 0, Number.MAX_SAFE_INTEGER),
      ownerAddress: target.ownerAddress === null ? null : parseAddress(target.ownerAddress) })).sort((a, b) => a.position - b.position),
    ballots: raw.ballots.map(ballot => ({ ...ballot, seq: parseSequence(ballot.seq), attester: parseAddress(ballot.attester), uid: hex(ballot.uid, 32) }))
      .sort((a, b) => BigInt(a.seq) < BigInt(b.seq) ? -1 : BigInt(a.seq) > BigInt(b.seq) ? 1 : 0),
  };
  unique(input.targets.map(target => target.id)); unique(input.targets.map(target => target.position)); unique(input.ballots.map(ballot => ballot.seq));
  return input;
}
function allocation(input: TallyInput, attester: Address, plaintext: string, participantsHash: Hex): number[] {
  const payload = parseAllocationPayload(JSON.parse(plaintext));
  if (canonicalJSON(payload) !== plaintext || payload.feast !== input.feastId || payload.scatterer !== attester || payload.participants !== participantsHash) throw new Error('Invalid scatter context');
  if (payload.allocation.length !== input.targets.length || payload.allocation.some(([id], i) => id !== input.targets[i]!.id)) throw new Error('Incomplete targets');
  if (payload.allocation.some(([, amount], i) => amount > 0 && input.targets[i]!.ownerAddress === attester)) throw new Error('Self scatter');
  const amounts = payload.allocation.map(([, amount]) => amount);
  if (amounts.reduce((sum, amount) => sum + amount, 0) !== input.crumbsIssued) throw new Error('Incomplete scatter');
  return amounts;
}
function share(crumbs: number, total: number): [number, number] {
  if (total === 0) return [0, 1];
  const numerator = BigInt(crumbs), denominator = BigInt(total);
  let a = numerator, b = denominator;
  while (b !== 0n) [a, b] = [b, a % b];
  return [Number(numerator / a), Number(denominator / a)];
}

/** Normalize publication metadata, then validate only the latest candidate per participant. */
export function tally(raw: TallyInput): TallyResult {
  const input = normalize(raw), participantsHash = hashJSON(input.participants);
  const counted: TallyResult['counted'] = [], rejected: TallyResult['rejected'] = [];
  const crumbs = input.targets.map(() => 0), latest = new Map<Address, TallyCandidate>();
  // Candidates are already in numeric sequence order. Replacing a map entry never revives an earlier one.
  for (const ballot of input.ballots) latest.set(ballot.attester, ballot);
  for (const ballot of input.ballots) {
    const { attester, seq, uid, plaintext } = ballot;
    if (!input.participants.includes(attester)) { rejected.push({ attester, seq, reason: 'not_participant' }); continue; }
    if (latest.get(attester) !== ballot) continue;
    if (plaintext === null) { rejected.push({ attester, seq, reason: 'unreadable' }); continue; }
    let amounts: number[];
    try { amounts = allocation(input, attester, plaintext, participantsHash); }
    catch { rejected.push({ attester, seq, reason: 'invalid_payload' }); continue; }
    counted.push({ attester, seq, uid });
    for (let i = 0; i < crumbs.length; i++) crumbs[i]! += amounts[i]!;
  }
  const totalScattered = crumbs.reduce((sum, amount) => sum + amount, 0);
  const totals = input.targets.map((target, i) => ({ targetId: target.id, crumbs: crumbs[i]!, share: share(crumbs[i]!, totalScattered) }));
  const ties: Hex[][] = [], grouped = new Set<number>();
  for (const target of totals) {
    if (target.crumbs === 0 || grouped.has(target.crumbs)) continue;
    grouped.add(target.crumbs);
    const group = totals.filter(other => other.crumbs === target.crumbs).map(other => other.targetId);
    if (group.length > 1) ties.push(group);
  }
  return { counted, rejected, didNotScatter: input.participants.filter(address => !counted.some(ballot => ballot.attester === address)),
    totals, totalScattered, ties,
    resultHash: hashJSON({ feastId: input.feastId, publishedSetHash: input.publishedSetHash, crumbsIssued: input.crumbsIssued, counted: counted.map(ballot => ballot.uid), totals }) };
}
