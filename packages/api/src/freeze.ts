import { phaseAt } from '@critter-crumbs/core';
import { freezePeopleTargets } from './targets.js';
import { feastClock } from './feast-rows.js';
import { timestamp } from './store.js';
import type { BurrowSnapshot } from './burrow-transactions.js';
/** Materialize R7 from the still-current membership snapshot; never read an allocation. */
export function pendingFreezes(snapshot: BurrowSnapshot, now: number, bind: (value: unknown) => string): string[] {
  const sql: string[] = [], members = snapshot.members.filter(member => member.left_at === null);
  for (const feast of snapshot.feasts) {
    const phase = phaseAt(feastClock(feast), now);
    if (feast.participants_frozen_at !== null || !['scattering', 'feast'].includes(phase)) continue;
    const id = bind(feast.id), at = bind(timestamp(now)), tooFew = feast.kind === 'people' && members.length < 3;
    sql.push(`update feasts set participants_frozen_at=${at}::timestamptz,status=${bind(tooFew ? 'void' : 'open')}::feast_status where id=${id} and participants_frozen_at is null and exists(select 1 from gate)`);
    const addresses = bind(JSON.stringify(members.map(member => member.address)));
    sql.push(`insert into feast_participants (feast_id,address) select ${id},member.address from gate cross join jsonb_array_elements_text(${addresses}::jsonb) member(address) on conflict do nothing`);
    if (feast.kind !== 'people') continue;
    sql.push(...freezePeopleTargets(members, String(feast.id), bind));
  }
  return sql;
}
