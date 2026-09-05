import { canonicalJSON, type Address, type AllocationPayload, type Hex } from '@critter-crumbs/shared';
import { tally, participantSetHash, type TallyInput } from '@critter-crumbs/core';
import { expect, test } from 'vitest';
const hash = (byte: string) => `0x${byte.repeat(32)}` as Hex;
const addresses = [1, 2, 3, 4].map(n => `0x${`${n.toString(16)}abc`.padStart(40, '0')}` as Address);
const feastId = '00000000-0000-4000-8000-000000000001';
function fixture(): TallyInput {
  return { feastId, publishedSetHash: hash('99'), crumbsIssued: 100, participants: [...addresses], ballots: [],
    targets: ['11', '22', '33', '44'].map((byte, position) => ({ id: hash(byte), ownerAddress: addresses[position]!, position })) };
}
function candidate(input: TallyInput, n: number, amounts: number[], seq = String(n + 1), change: Partial<AllocationPayload> = {}) {
  return { seq, uid: hash(Number(seq).toString(16).padStart(2, '0')), attester: addresses[n]!, plaintext: canonicalJSON({
    v: 1, feast: feastId, scatterer: addresses[n]!, participants: participantSetHash(input.participants),
    allocation: input.targets.map((target, i) => [target.id, amounts[i]!]), nonce: '0123456789abcdef', ...change,
  }) };
}

test('tally: must-scatter-all rejected', () => {
  const input = fixture(); input.ballots = [candidate(input, 0, [0, 30, 30, 39])];
  const result = tally(input);
  expect(result.counted).toEqual([]);
  expect(result.rejected).toEqual([{ attester: addresses[0], seq: '1', reason: 'invalid_payload' }]);
  expect(result.didNotScatter).toEqual(addresses);
});

test('tally: self-scatter rejected', () => {
  const input = fixture(); input.ballots = [candidate(input, 0, [1, 33, 33, 33])];
  expect(tally(input).rejected).toEqual([{ attester: addresses[0], seq: '1', reason: 'invalid_payload' }]);
});

function workedExample() {
  const input = fixture();
  input.ballots = [candidate(input, 0, [0, 30, 30, 40]), candidate(input, 1, [50, 0, 25, 25]), candidate(input, 2, [20, 40, 0, 40])];
  return input;
}
test('tally: proportions of scattered not issued (one of four never scatters)', () => {
  const input = workedExample(), result = tally(input);
  expect(result.totalScattered).toBe(300);
  expect(result.totals).toEqual([
    { targetId: hash('11'), crumbs: 70, share: [7, 30] }, { targetId: hash('22'), crumbs: 70, share: [7, 30] },
    { targetId: hash('33'), crumbs: 55, share: [11, 60] }, { targetId: hash('44'), crumbs: 105, share: [7, 20] },
  ]);
  expect(result.didNotScatter).toEqual([addresses[3]]);
  expect(result.counted).toEqual(input.ballots.map(({ attester, seq, uid }) => ({ attester, seq, uid })));
});

test('tally: latest `seq` wins over an earlier valid one', () => {
  const input = fixture(); input.ballots = [candidate(input, 0, [0, 100, 0, 0]), candidate(input, 0, [0, 0, 100, 0], '10')];
  const result = tally(input);
  expect(result.counted).toEqual([{ attester: addresses[0], seq: '10', uid: hash('0a') }]);
  expect(result.totals.map(target => target.crumbs)).toEqual([0, 0, 100, 0]);
  expect(result.rejected).toEqual([]);
});

test('tally: an invalid latest does not fall back', () => {
  const input = fixture(); input.ballots = [candidate(input, 0, [0, 100, 0, 0]), candidate(input, 0, [0, 0, 99, 0], '2')];
  const result = tally(input);
  expect(result.counted).toEqual([]); expect(result.totalScattered).toBe(0);
  expect(result.rejected).toEqual([{ attester: addresses[0], seq: '2', reason: 'invalid_payload' }]);
  expect(result.didNotScatter).toEqual(addresses);
});

test('tally: a non-participant is rejected', () => {
  const input = fixture(), outsider: Address = '0x0000000000000000000000000000000000000005';
  input.ballots = ['1', '2'].map(seq => ({ ...candidate(input, 0, [0, 100, 0, 0], seq, { scatterer: outsider }), attester: outsider }));
  const result = tally(input);
  expect(result.counted).toEqual([]);
  expect(result.rejected).toEqual(['1', '2'].map(seq => ({ attester: outsider, seq, reason: 'not_participant' })));
  expect(result.didNotScatter).toEqual(addresses);
});

test('tally: nobody scatters', () => {
  const result = tally(fixture());
  expect(result.totalScattered).toBe(0); expect(result.counted).toEqual([]); expect(result.rejected).toEqual([]);
  expect(result.didNotScatter).toEqual(addresses); expect(result.ties).toEqual([]);
  expect(result.totals.map(target => target.share)).toEqual([[0, 1], [0, 1], [0, 1], [0, 1]]);
});
test('tally: exactly one scatters', () => {
  const input = fixture(); input.ballots = [candidate(input, 0, [0, 100, 0, 0])];
  const result = tally(input);
  expect(result.totalScattered).toBe(100); expect(result.didNotScatter).toEqual(addresses.slice(1));
  expect(result.totals.map(target => target.share)).toEqual([[0, 1], [1, 1], [0, 1], [0, 1]]);
  expect(result.ties).toEqual([]);
});
test('tally: a three-way tie', () => {
  const input = fixture(); input.crumbsIssued = 99; input.ballots = [candidate(input, 3, [33, 33, 33, 0])];
  const result = tally(input);
  expect(result.ties).toEqual([[hash('11'), hash('22'), hash('33')]]);
  expect(result.totals.map(target => target.share)).toEqual([[1, 3], [1, 3], [1, 3], [0, 1]]);
});

test('tally: an option feast has no self-rule', () => {
  const input = fixture(); input.targets = input.targets.map(target => ({ ...target, ownerAddress: null }));
  input.ballots = [candidate(input, 0, [100, 0, 0, 0])];
  const result = tally(input);
  expect(result.rejected).toEqual([]); expect(result.totalScattered).toBe(100);
  expect(result.totals[0]).toEqual({ targetId: hash('11'), crumbs: 100, share: [1, 1] });
});
test('tally: `resultHash` is stable across input orderings that the spec normalises', () => {
  const input = workedExample(), expected = tally(input);
  expect(expected.resultHash).toBe('0xae57bad0d2e6c788dc19d3569d141209700afbd529e33d4e99b5f9719fb45e7b');
  const upper = (address: Address): Address => `0x${address.slice(2).toUpperCase()}`;
  const shuffled: TallyInput = { ...input, participants: input.participants.map(upper).reverse(),
    targets: input.targets.map(target => ({ ...target, ownerAddress: upper(target.ownerAddress!) })).reverse(),
    ballots: input.ballots.map(ballot => ({ ...ballot, attester: upper(ballot.attester) })).reverse() };
  const before = canonicalJSON(shuffled);
  expect(tally(shuffled)).toEqual(expected);
  expect(canonicalJSON(shuffled)).toBe(before);
  expect(tally({ ...input, publishedSetHash: hash('98') }).resultHash).not.toBe(expected.resultHash);
  expect(tally({ ...input, ballots: input.ballots.map((ballot, i) => i === 0 ? { ...ballot, uid: hash('ff') } : ballot) }).resultHash).not.toBe(expected.resultHash);
});

test.each([
  ['version', (payload: AllocationPayload) => ({ ...payload, v: 2 })],
  ['feast', (payload: AllocationPayload) => ({ ...payload, feast: '00000000-0000-4000-8000-000000000002' })],
  ['scatterer', (payload: AllocationPayload) => ({ ...payload, scatterer: addresses[1] })],
  ['participant hash', (payload: AllocationPayload) => ({ ...payload, participants: hash('ff') })],
  ['missing target', (payload: AllocationPayload) => ({ ...payload, allocation: payload.allocation.slice(0, 3) })],
  ['duplicate target', (payload: AllocationPayload) => ({ ...payload, allocation: payload.allocation.map(([id, amount], i) => [i === 2 ? payload.allocation[1]![0] : id, amount]) })],
  ['target order', (payload: AllocationPayload) => ({ ...payload, allocation: [...payload.allocation].reverse() })],
  ['unknown target', (payload: AllocationPayload) => ({ ...payload, allocation: payload.allocation.map(([id, amount], i) => [i === 2 ? hash('ff') : id, amount]) })],
  ['fractional amount', (payload: AllocationPayload) => ({ ...payload, allocation: payload.allocation.map(([id, amount], i) => [id, i === 1 ? 99.5 : amount]) })],
  ['negative amount', (payload: AllocationPayload) => ({ ...payload, allocation: payload.allocation.map(([id, amount], i) => [id, i === 0 ? -1 : amount]) })],
  ['overspend', (payload: AllocationPayload) => ({ ...payload, allocation: payload.allocation.map(([id, amount], i) => [id, i === 1 ? 101 : amount]) })],
  ['extra field', (payload: AllocationPayload) => ({ ...payload, seq: 2 })],
  ['noncanonical address', (payload: AllocationPayload) => ({ ...payload, scatterer: `0x${payload.scatterer.slice(2).toUpperCase()}` })],
])('tally rejects invalid %s before counting any crumbs', (_, change) => {
  const input = fixture(), valid = candidate(input, 0, [0, 100, 0, 0]);
  input.ballots = [{ ...valid, plaintext: canonicalJSON(change(JSON.parse(valid.plaintext) as AllocationPayload)) }];
  const result = tally(input);
  expect(result.counted).toEqual([]); expect(result.totalScattered).toBe(0);
  expect(result.totals.map(target => target.crumbs)).toEqual([0, 0, 0, 0]);
  expect(result.rejected).toEqual([{ attester: addresses[0], seq: '1', reason: 'invalid_payload' }]);
});
test.each(['malformed JSON', 'whitespace', 'duplicate JSON keys', 'failed decryption'])('tally rejects %s in the latest candidate without fallback', kind => {
  const input = fixture(), valid = candidate(input, 0, [0, 100, 0, 0]);
  const plaintext = kind === 'failed decryption' ? null : kind === 'whitespace' ? ` ${valid.plaintext}` : kind === 'duplicate JSON keys' ? valid.plaintext.replace('"v":1', '"v":1,"v":1') : '{';
  input.ballots = [valid, { ...valid, seq: '2', plaintext }];
  const result = tally(input);
  expect(result.counted).toEqual([]); expect(result.totalScattered).toBe(0);
  expect(result.rejected).toEqual([{ attester: addresses[0], seq: '2', reason: kind === 'failed decryption' ? 'unreadable' : 'invalid_payload' }]);
});

test.each([
  ['participant', (input: TallyInput) => { input.participants.push(input.participants[0]!); }],
  ['target ID', (input: TallyInput) => { input.targets[1]!.id = input.targets[0]!.id; }],
  ['position', (input: TallyInput) => { input.targets[1]!.position = input.targets[0]!.position; }],
  ['sequence', (input: TallyInput) => { input.ballots.push({ ...input.ballots[0]! }); }],
])('tally rejects ambiguous duplicate %s metadata', (_, change) => {
  const input = workedExample(); change(input); expect(() => tally(input)).toThrow();
});
test.each(['0', '-1', '1.5', '01', '1e3', '9223372036854775808'])('tally rejects invalid sequence %s', seq => {
  const input = workedExample(); input.ballots[0]!.seq = seq; expect(() => tally(input)).toThrow();
});
test.each([10.5, 9, 1001])('tally rejects invalid issued crumbs %s', crumbsIssued => {
  expect(() => tally({ ...fixture(), crumbsIssued })).toThrow();
});
test('tally orders sequences above the JavaScript safe-integer range without rounding', () => {
  const input = fixture(), valid = candidate(input, 0, [0, 100, 0, 0]);
  input.ballots = [{ ...valid, seq: '9007199254740993', plaintext: null }, { ...valid, seq: '9007199254740992' }];
  expect(tally(input).rejected).toEqual([{ attester: addresses[0], seq: '9007199254740993', reason: 'unreadable' }]);
  expect(tally(input).totalScattered).toBe(0);
});

test('tally participant hash matches the independent sorted-address vector', () => {
  expect(participantSetHash([...addresses].reverse())).toBe('0x24cc7572e55798da348c9f57fb9e956316454d202033d117bb9b9a98adf64a89');
});
