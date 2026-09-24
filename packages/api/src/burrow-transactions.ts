import { phaseAt } from '@critter-crumbs/core';
import { getAddress } from 'viem';
import { feastClock, milliseconds } from './feast-rows.js';
import { pendingCloses } from './close-record.js';
import { pendingFreezes } from './freeze.js';
import { profileFromRow, timestamp } from './store.js';
import type { Database, Row } from './database.js';
import { HttpError } from './errors.js';
export interface BurrowSnapshot { burrow: Row; members: Row[]; feasts: Row[]; participants: Row[]; targets: Row[]; statements: Row[]; ballots: Row[]; removals: Row[]; now: number }
/** One consistent snapshot, followed by a single revision-guarded SQL statement. */
export function createBurrowTransactions(db: Database, clock: () => number) {
  async function readSnapshot(id: string): Promise<Omit<BurrowSnapshot, 'now'>> {
    const [burrows, members, feasts, participants, targets, statements, ballots, removals] = await db.batch([
      { text: 'select * from burrows where id=$1', values: [id] },
      { text: `select p.*,m.joined_at,m.left_at,m.added_by,m.membership_version from burrow_members m join profiles p on p.address=m.address where m.burrow_id=$1 order by m.address`, values: [id] },
      { text: 'select * from feasts where burrow_id=$1 order by id', values: [id] },
      { text: 'select p.* from feast_participants p join feasts f on f.id=p.feast_id where f.burrow_id=$1 order by p.address', values: [id] },
      { text: 'select t.* from targets t join feasts f on f.id=t.feast_id where f.burrow_id=$1 order by t.position', values: [id] },
      { text: 'select s.* from statements s join feasts f on f.id=s.feast_id where f.burrow_id=$1 order by s.target_id', values: [id] },
      { text: 'select b.feast_id,b.seq,b.uid,b.attester from ballots b join feasts f on f.id=b.feast_id where f.burrow_id=$1 order by b.seq', values: [id] },
      { text: 'select * from member_removals where burrow_id=$1 order by sequence', values: [id] },
    ], { readOnly: true, isolationLevel: 'RepeatableRead' });
    if (!burrows?.[0]) throw new HttpError(404, 'burrow.unknown.title');
    return { burrow: burrows[0], members: members!, feasts: feasts!, participants: participants!, targets: targets!, statements: statements!, ballots: ballots!, removals: removals! };
  }
  type Choose<T> = (snapshot: BurrowSnapshot, now: number, bind: (value: unknown) => string) => { sql: string[]; result: T };
  async function run<T>(id: string, choose?: Choose<T>): Promise<T | BurrowSnapshot> {
    for (let attempt = 0; attempt < 32; attempt++) {
      const snapshot = { ...await readSnapshot(id), now: clock() }, values: unknown[] = [id, String(snapshot.burrow.revision)];
      const bind = (value: unknown) => { values.push(value); return `$${values.length}`; };
      const now = snapshot.now, freezes = pendingFreezes(snapshot, now, bind);
      const effects = freezes.length ? freezes : pendingCloses(snapshot, now, bind);
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
export function burrowView(snapshot: BurrowSnapshot, actor: string) {
  return { serverNow: snapshot.now, id: snapshot.burrow.id, name: snapshot.burrow.name, createdBy: getAddress(String(snapshot.burrow.created_by)), removals: snapshot.removals.map(removalFromRow),
    members: snapshot.members.map(row => ({ ...profileFromRow(row), membershipVersion: Number(row.membership_version), joinedAt: row.joined_at === null ? null : new Date(row.joined_at as string).getTime(), leftAt: row.left_at === null ? null : new Date(row.left_at as string).getTime() })), feasts: snapshot.feasts.filter(row => row.status !== 'draft' || row.created_by === actor).map(row => ({ id: row.id, title: row.title, ...feastClock(row), phase: phaseAt(feastClock(row), snapshot.now), participantsFrozenAt: row.participants_frozen_at === null ? null : milliseconds(row.participants_frozen_at), participants: snapshot.participants.filter(participant => participant.feast_id === row.id).map(participant => getAddress(String(participant.address))) })) };
}
export function removalFromRow(row: Row): import('@critter-crumbs/shared').MemberRemoval {
  return { id: String(row.id), sequence: String(row.sequence), operationId: String(row.operation_id), action: 'remove', actorAddress: getAddress(String(row.actor_address)), address: getAddress(String(row.member_address)), membershipVersion: Number(row.membership_version), actorName: String(row.actor_name), memberName: String(row.member_name), removedAt: milliseconds(row.removed_at) };
}
export { timestamp };
