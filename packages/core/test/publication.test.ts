import { createCloseRecord, publishedSetHash } from '@critter-crumbs/core';
import type { PublishedEntry } from '@critter-crumbs/shared';
import { expect, test } from 'vitest';
const feastId = '00000000-0000-4000-8000-000000000001';
const entries: PublishedEntry[] = ['1', '2'].map(seq => ({ seq, uid: `0x${'01'.repeat(32)}`, attester: '0x0000000000000000000000000000000000001abc' }));
test('close record publication matches an independently encoded hash and retains identical UID retries', () => {
  const record = createCloseRecord(feastId, [...entries].reverse(), 2000);
  expect(record).toEqual({ published: entries, counted: [entries[1]], closedAt: 2000,
    publishedSetHash: '0x720124d4051f15d48173da943d51458b78c00853a7ee31fbf1958bb06ced5980' });
  expect(createCloseRecord(feastId, entries, 9999).publishedSetHash).toBe(record.publishedSetHash);
  expect(publishedSetHash(feastId, [entries[1]!], [entries[1]!])).not.toBe(record.publishedSetHash);
});
test('close record rejects duplicate or coercible sequences', () => {
  expect(() => createCloseRecord(feastId, [entries[0]!, entries[0]!], 2000)).toThrow();
  expect(() => createCloseRecord(feastId, [{ ...entries[0]!, seq: 1 as unknown as string }], 2000)).toThrow();
});
