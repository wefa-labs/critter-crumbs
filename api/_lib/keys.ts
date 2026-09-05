import { randomUUID } from 'node:crypto';
import { phaseAt, type Timelock } from '@critter-crumbs/core';
import type { Address } from '@critter-crumbs/shared';
import { createBurrowTransactions, requireMember, timestamp } from './burrow-transactions.js';
import { dbHex, feastClock, milliseconds } from './feast-rows.js';
import type { Database, Row } from './database.js';
import { HttpError } from './errors.js';
const unavailable = (retryAfter = 5) => new HttpError(503, 'err.keyUnreachable', undefined, { 'Retry-After': String(retryAfter) });
function requireFeast(row: Row, now: number) {
  if (phaseAt(feastClock(row), now) !== 'feast') throw new HttpError(400, 'scatter.closed');
}
export function createKeys(db: Database, clock: () => number, timelock?: Timelock) {
  const transactions = createBurrowTransactions(db, clock), inFlight = new Map<string, Promise<void>>();
  async function retrieve(id: string, burrowId: string): Promise<void> {
    if (!timelock) throw unavailable();
    const token = randomUUID();
    const identity = await transactions.write(burrowId, (snapshot, now, bind) => {
      const row = snapshot.feasts.find(row => row.id === id)!; requireFeast(row, now);
      if (row.shutter_decryption_key) return { sql: [], result: null };
      if (row.shutter_key_started_at !== null && now - milliseconds(row.shutter_key_started_at) < 30000) throw unavailable(Math.ceil((30000 - now + milliseconds(row.shutter_key_started_at)) / 1000));
      return { sql: [`update feasts set shutter_key_started_at=${bind(timestamp(now))}::timestamptz,shutter_key_token=${bind(token)}::uuid where id=${bind(id)}::uuid and exists(select 1 from gate)`], result: dbHex(row.shutter_identity) };
    });
    if (!identity) return;
    try {
      const key = await timelock.getKey(identity);
      if (!(key instanceof Uint8Array) || key.length === 0) throw unavailable();
      await transactions.write(burrowId, (snapshot, now, bind) => {
        const row = snapshot.feasts.find(row => row.id === id)!; requireFeast(row, now);
        if (row.shutter_decryption_key) return { sql: [], result: undefined };
        if (row.shutter_key_token !== token) throw unavailable();
        return { sql: [`update feasts set shutter_decryption_key=${bind(Buffer.from(key))}::bytea,shutter_key_started_at=null,shutter_key_token=null
          where id=${bind(id)}::uuid and shutter_key_token=${bind(token)}::uuid and shutter_decryption_key is null and exists(select 1 from gate)`], result: undefined };
      });
    } catch (error) {
      await transactions.write(burrowId, (_, _now, bind) => ({ sql: [`update feasts set shutter_key_started_at=null,shutter_key_token=null where id=${bind(id)}::uuid and shutter_key_token=${bind(token)}::uuid and exists(select 1 from gate)`], result: undefined }));
      if (error instanceof HttpError) throw error;
      throw unavailable();
    }
  }
  return {
    async read(id: string, actor: Address) {
      const [location] = await db.query('select burrow_id from feasts where id=$1', [id]);
      if (!location) throw new HttpError(404, 'err.generic');
      const burrowId = String(location.burrow_id);
      let snapshot = await transactions.read(burrowId); requireMember(snapshot, actor);
      let row = snapshot.feasts.find(row => row.id === id)!; requireFeast(row, snapshot.now);
      if (!row.shutter_decryption_key) {
        let pending = inFlight.get(id);
        if (!pending) { pending = retrieve(id, burrowId); inFlight.set(id, pending); }
        try { await pending; } finally { if (inFlight.get(id) === pending) inFlight.delete(id); }
        snapshot = await transactions.read(burrowId); requireMember(snapshot, actor);
        row = snapshot.feasts.find(row => row.id === id)!; requireFeast(row, snapshot.now);
      }
      if (!row.shutter_decryption_key) throw unavailable();
      return { key: dbHex(row.shutter_decryption_key), serverNow: snapshot.now };
    },
  };
}
