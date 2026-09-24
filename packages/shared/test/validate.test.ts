import { expect, test } from 'vitest';
import { parseFeastSetup, parseAllocationPayload, parseAddress, parseProfileUpdate, parseStatement, ValidationError } from '@critter-crumbs/shared';
const input = { title: 'October', kind: 'people', gatheringEndsAt: 1000, scatteringEndsAt: 2000, aggregatePublic: false, individualOpen: false };
const address = `0x${'ab'.repeat(20)}`;
const payload = { v: 1, feast: '00000000-0000-4000-8000-000000000001', scatterer: address, participants: `0x${'11'.repeat(32)}`, allocation: [[`0x${'22'.repeat(32)}`, 100]], nonce: '0123456789abcdef' };

test('validators apply feast defaults', () => {
  expect(parseFeastSetup(input)).toEqual({ ...input, context: '', crumbsPerCritter: 100, options: [] });
});
test.each([{ crumbsPerCritter: 9 }, { crumbsPerCritter: 1001 }, { crumbsPerCritter: 10.1 }, { gatheringEndsAt: 2000 }, { individualOpen: true }, { kind: 'options', options: [] }, { title: ' ' }])('validators reject invalid feast setup %j', change => {
  expect(() => parseFeastSetup({ ...input, ...change })).toThrow(ValidationError);
});
test('validators reject duplicate option names', () => {
  expect(() => parseFeastSetup({ ...input, kind: 'options', options: [{ name: 'A' }, { name: 'a' }] })).toThrow(ValidationError);
});
test('validators reject a 50-target setup that cannot fit every complete scatter in 4 KB', () => {
  const options = Array.from({ length: 50 }, (_, i) => ({ name: `Option ${i}` }));
  expect(() => parseFeastSetup({ ...input, kind: 'options', options })).toThrow('err.feastCapacity');
  expect(parseFeastSetup({ ...input, kind: 'options', options: options.slice(0, 49) }).options).toHaveLength(49);
});
test('validators parse the complete allocation payload', () => {
  expect(parseAllocationPayload(payload)).toEqual(payload);
});
test.each([{ v: 2 }, { nonce: 'x' }, { participants: '0x11' }, { allocation: [[`0x${'22'.repeat(32)}`, '100']] }, { extra: true }])('validators reject malformed allocation payload %j', change => {
  expect(() => parseAllocationPayload({ ...payload, ...change })).toThrow(ValidationError);
});
test('validators normalize address case', () => {
  expect(parseAddress(address.toUpperCase().replace('0X', '0x'))).toBe(address);
});
test('validators parse a profile edit without coercion', () => {
  expect(parseProfileUpdate({ displayName: ' Ada ', variant: 4 })).toEqual({ displayName: 'Ada', variant: 4 });
});
test('validators reject more than four re-rolls', () => {
  expect(() => parseProfileUpdate({ variant: 5 })).toThrow(ValidationError);
});
test('validators retain statement whitespace and count Unicode code points', () => {
  expect(parseStatement(` ${'🌱'.repeat(1998)}\n`)).toBe(` ${'🌱'.repeat(1998)}\n`);
  expect(() => parseStatement('🌱'.repeat(2001))).toThrow(ValidationError);
});
