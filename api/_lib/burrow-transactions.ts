import { phaseAt } from '@critter-crumbs/core';
import { getAddress } from 'viem';
import { feastClock, milliseconds } from './feast-rows.js';
import { pendingFreezes } from './freeze.js';
import { profileFromRow, timestamp } from './store.js';
import type { Database, Row } from './database.js';
import { HttpError } from './errors.js';
export interface BurrowSnapshot { burrow: Row; members: Row[]; feasts: Row[]; participants: Row[] }
/** One consistent snapshot, followed by a single revision-guarded SQL statement. */
export function createBurrowTransactions(db: Database, clock: () => number) {
  async function readSnapshot(id: string): Promise<BurrowSnapshot> {
    const [burrows, members, feasts, participants] = await db.batch([
      { text: 'select * from burrows where id=$1', values: [id] },
      { text: `select p.*,m.joined_at,m.left_at,m.added_by from burrow_members m join profiles p on p.address=m.address where m.burrow_id=$1 order by m.address`, values: [id] },
      { text: 'select * from feasts where burrow_id=$1 order by id', values: [id] },
      { text: 'select p.* from feast_participants p join feasts f on f.id=p.feast_id where f.burrow_id=$1 order by p.address', values: [id] },
    ], { readOnly: true, isolationLevel: 'RepeatableRead' });
    if (!burrows?.[0]) throw new HttpError(404, 'burrow.unknown.title');
    return { burrow: burrows[0], members: members!, feasts: feasts!, participants: participants! };
  }
  type Choose<T> = (snapshot: BurrowSnapshot, now: number, bind: (value: unknown) => string) => { sql: string[]; result: T };
  async function run<T>(id: string, choose?: Choose<T>): Promise<T | BurrowSnapshot> {
    for (let attempt = 0; attempt < 32; attempt++) {
      const snapshot = await readSnapshot(id), values: unknown[] = [id, String(snapshot.burrow.revision)];
      const bind = (value: unknown) => { values.push(value); return `$${values.length}`; };
      const now = clock(), effects = pendingFreezes(snapshot, now, bind);
      if (!effects.length && !choose) return snapshot;
      const plan = effects.length ? { sql: effects, result: undefined } : choose!(snapshot, now, bind);
      const [rows] = await db.batch([{ text: `with gate as (
        update burrows set revision=revision+1 where id=$1 and revision=$2 returning id
      )${plan.sql.map((text, index) => `, change_${index} as (${text})`).join('')}
      select count(*)::int as committed from gate`, values }]);
      if (rows?.[0]?.committed === 1 && !effects.length) return plan.result as T;
    }
    throw new HttpError(503, 'err.storeUnreachable');
  }
  return { read: (id: string) => run(id) as Promise<BurrowSnapshot>, write: <T>(id: string, choose: Choose<T>) => run(id, choose) as Promise<T> };
}

export const activeMember = (snapshot: BurrowSnapshot, address: string) => snapshot.members.find(row => row.address === address && row.left_at === null);
export function requireMember(snapshot: BurrowSnapshot, address: string): void {
  if (!activeMember(snapshot, address)) throw new HttpError(403, 'burrow.unknown.title', { burrowName: snapshot.burrow.name });
}
export function burrowView(snapshot: BurrowSnapshot, now: number) {
  return { id: snapshot.burrow.id, name: snapshot.burrow.name,
    members: snapshot.members.map(row => ({ ...profileFromRow(row), joinedAt: row.joined_at === null ? null : new Date(row.joined_at as string).getTime(), leftAt: row.left_at === null ? null : new Date(row.left_at as string).getTime() })), feasts: snapshot.feasts.map(row => ({ id: row.id, title: row.title, ...feastClock(row), phase: phaseAt(feastClock(row), now), participantsFrozenAt: row.participants_frozen_at === null ? null : milliseconds(row.participants_frozen_at), participants: snapshot.participants.filter(participant => participant.feast_id === row.id).map(participant => getAddress(String(participant.address))) })) };
}
export { timestamp };
