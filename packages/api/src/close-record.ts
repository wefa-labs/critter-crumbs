import { createCloseRecord, phaseAt } from '@critter-crumbs/core';
import type { Address } from '@critter-crumbs/shared';
import type { BurrowSnapshot } from './burrow-transactions.js';
import { dbHex, feastClock } from './feast-rows.js';
import { timestamp } from './store.js';
export function pendingCloses(snapshot: BurrowSnapshot, now: number, bind: (value: unknown) => string): string[] {
  return snapshot.feasts.filter(row => row.close_record === null && phaseAt(feastClock(row), now) === 'feast').map(row => {
    const record = createCloseRecord(String(row.id), snapshot.ballots.filter(ballot => ballot.feast_id === row.id)
      .map(ballot => ({ seq: String(ballot.seq), uid: dbHex(ballot.uid), attester: String(ballot.attester) as Address })), now);
    return `update feasts set close_record=${bind(JSON.stringify(record))}::jsonb,closed_at=${bind(timestamp(now))}::timestamptz,published_set_hash=${bind(Buffer.from(record.publishedSetHash.slice(2), 'hex'))}::bytea
      where id=${bind(row.id)}::uuid and close_record is null and exists(select 1 from gate)`;
  });
}
