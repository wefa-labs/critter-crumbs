import { phaseAt, type EasConfig } from '@critter-crumbs/core';
import type { Address } from '@critter-crumbs/shared';
import { getAddress } from 'viem';
import { createBurrowTransactions, requireMember, timestamp, type BurrowSnapshot } from './burrow-transactions.js';
import { closeRecordFromRow, dbHex, feastClock } from './feast-rows.js';
import type { Database } from './database.js';
import { HttpError } from './errors.js';
import { verifyBallot, type BallotContext } from './ballot-verifier.js';
export function createBallots(db: Database, clock: () => number, config?: EasConfig) {
  const transactions = createBurrowTransactions(db, clock);
  async function location(id: string) {
    const [row] = await db.query('select burrow_id from feasts where id=$1', [id]);
    if (!row) throw new HttpError(404, 'err.generic'); return String(row.burrow_id);
  }
  return {
    async read(id: string, actor: Address) {
      const snapshot = await transactions.read(await location(id)); requireMember(snapshot, actor);
      const row = snapshot.feasts.find(row => row.id === id)!;
      if (phaseAt(feastClock(row), snapshot.now) !== 'feast') throw new HttpError(400, 'scatter.closed');
      const closeRecord = closeRecordFromRow(row)!;
      const rows = await db.query('select seq,uid,attester,ciphertext,attestation from ballots where feast_id=$1 and seq=any($2::bigint[]) order by seq', [id, closeRecord.counted.map(entry => entry.seq)]);
      return { closeRecord, serverNow: snapshot.now, ballots: rows.map(row => ({ seq: String(row.seq), uid: dbHex(row.uid), attester: getAddress(String(row.attester)), ciphertext: dbHex(row.ciphertext), attestation: row.attestation })) };
    },
    async submit(id: string, actor: Address, body: unknown) {
      if (!config) throw new HttpError(503, 'err.storeUnreachable');
      const burrowId = await location(id);
      const verified = await verifyBallot(body, actor, config);
      return transactions.write(burrowId, (snapshot, now, bind) => {
        const accepted = verified.forFeast(context(snapshot, id), now);
        const seq = (snapshot.ballots.filter(ballot => ballot.feast_id === id).reduce((max, ballot) => BigInt(String(ballot.seq)) > max ? BigInt(String(ballot.seq)) : max, 0n) + 1n).toString();
        return { sql: [`insert into ballots (feast_id,seq,uid,attester,attestation,ciphertext,received_at)
          select ${bind(id)}::uuid,${bind(seq)}::bigint,${bind(Buffer.from(accepted.uid.slice(2), 'hex'))}::bytea,${bind(actor)},${bind(JSON.stringify(accepted.attestation))}::jsonb,${bind(Buffer.from(accepted.ciphertext.slice(2), 'hex'))}::bytea,${bind(timestamp(now))}::timestamptz from gate`],
          result: { uid: accepted.uid, seq, serverNow: now } };
      });
    },
  };
}
function context(snapshot: BurrowSnapshot, id: string): BallotContext {
  const row = snapshot.feasts.find(row => row.id === id)!;
  return { ...feastClock(row), id, shutterIdentity: row.shutter_identity ? dbHex(row.shutter_identity) : null,
    participants: snapshot.participants.filter(row => row.feast_id === id).map(row => String(row.address) as Address) };
}
