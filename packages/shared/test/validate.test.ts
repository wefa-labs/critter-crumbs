import { expect, test } from 'vitest';
import { parseFeastSetup, parseAllocationPayload, parseAddress, parseProfileUpdate, ValidationError } from '@critter-crumbs/shared';

test('validators parse feast setup with defaults and enforce deadline privacy and option rules', () => {
  const input = { title: 'October', kind: 'people', gatheringEndsAt: 1000, scatteringEndsAt: 2000, aggregatePublic: false, individualOpen: false };
  expect(parseFeastSetup(input)).toEqual({ ...input, context: '', crumbsPerCritter: 100, options: [] });
  for (const change of [{ crumbsPerCritter: 9 }, { crumbsPerCritter: 1001 }, { crumbsPerCritter: 10.1 }, { gatheringEndsAt: 2000 }, { individualOpen: true }, { kind: 'options', options: [] }, { title: ' ' }]) {
    expect(() => parseFeastSetup({ ...input, ...change })).toThrow(ValidationError);
  }
});

test('validators parse allocation payload and profile edits without coercion or truncation', () => {
  const address = `0x${'ab'.repeat(20)}`;
  const payload = { v: 1, feast: '00000000-0000-4000-8000-000000000001', scatterer: address, participants: `0x${'11'.repeat(32)}`, allocation: [[`0x${'22'.repeat(32)}`, 100]], nonce: '0123456789abcdef' };
  expect(parseAllocationPayload(payload)).toEqual(payload);
  expect(parseAddress(address.toUpperCase().replace('0X', '0x'))).toBe(address);
  expect(parseProfileUpdate({ displayName: ' Ada ', variant: 4 })).toEqual({ displayName: 'Ada', variant: 4 });
  for (const change of [{ v: 2 }, { nonce: 'x' }, { participants: '0x11' }, { allocation: [[`0x${'22'.repeat(32)}`, '100']] }, { extra: true }]) {
    expect(() => parseAllocationPayload({ ...payload, ...change })).toThrow(ValidationError);
  }
  expect(() => parseProfileUpdate({ variant: 5 })).toThrow(ValidationError);
  expect(() => parseFeastSetup({ title: 'x', kind: 'options', gatheringEndsAt: 1, scatteringEndsAt: 2, aggregatePublic: true, individualOpen: true, options: [{ name: 'A' }, { name: 'a' }] })).toThrow(ValidationError);
});
