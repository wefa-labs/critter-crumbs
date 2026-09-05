import { canonicalJSON, hex, integer, parseAddress, parseSequence, parseUuid, type CloseRecord, type Hex, type PublishedEntry } from '@critter-crumbs/shared';
import { keccak256, stringToHex } from 'viem';
function ordered(entries: readonly PublishedEntry[]): PublishedEntry[] {
  const result = entries.map(entry => ({ seq: parseSequence(entry.seq), uid: hex(entry.uid, 32), attester: parseAddress(entry.attester) }))
    .sort((a, b) => BigInt(a.seq) < BigInt(b.seq) ? -1 : BigInt(a.seq) > BigInt(b.seq) ? 1 : 0);
  if (new Set(result.map(entry => entry.seq)).size !== result.length) throw new TypeError('Duplicate publication sequence');
  return result;
}
export function publishedSetHash(feastId: string, published: readonly PublishedEntry[], counted: readonly PublishedEntry[]): Hex {
  return keccak256(stringToHex(canonicalJSON({ feastId: parseUuid(feastId), published: ordered(published), counted: ordered(counted) })));
}
/** Select ciphertext candidates only. Decryption and validity belong to each client's tally. */
export function createCloseRecord(feastId: string, entries: readonly PublishedEntry[], now: number): CloseRecord {
  const published = ordered(entries), latest = new Map<string, PublishedEntry>();
  for (const entry of published) latest.set(entry.attester, entry);
  const counted = published.filter(entry => latest.get(entry.attester) === entry);
  return { published, counted, publishedSetHash: publishedSetHash(feastId, published, counted), closedAt: integer(now, 0, 8640000000000000) };
}
