import { canonicalJSON } from '@critter-crumbs/shared';
import type { RegistrationJournal, ShutterAttempt } from '@critter-crumbs/core';
import { createBurrowTransactions } from './burrow-transactions.js';
import { dbHex } from './feast-rows.js';
import type { Database } from './database.js';
export function registrationJournal(db: Database, clock: () => number): RegistrationJournal {
  const transactions = createBurrowTransactions(db, clock);
  return {
    async read(id) { const [row] = await db.query('select shutter_registration_state from feasts where id=$1', [id]); return (row?.shutter_registration_state ?? null) as ShutterAttempt | null; },
    async compareAndSet(id, previous, next) {
      const [location] = await db.query('select burrow_id from feasts where id=$1', [id]);
      if (!location) return false;
      return transactions.write(String(location.burrow_id), (snapshot, _now, bind) => {
        const row = snapshot.feasts.find(row => row.id === id)!;
        if (!row.shutter_identity_prefix || dbHex(row.shutter_identity_prefix) !== next.identityPrefix || canonicalJSON(row.shutter_registration_state ?? null) !== canonicalJSON(previous)) return { sql: [], result: false };
        return { sql: [`update feasts set shutter_registration_state=${bind(canonicalJSON(next))}::jsonb where id=${bind(id)}::uuid and exists(select 1 from gate)`], result: true };
      });
    },
  };
}
