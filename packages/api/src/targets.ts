import { personTargetId } from '@critter-crumbs/core';
import { getAddress } from 'viem';
import type { Address, Target } from '@critter-crumbs/shared';
import type { Row } from './database.js';
export function peopleTargets(members: Row[]): Target[] {
  return members.filter(member => member.left_at === null).map((member, position) => {
    const address = getAddress(String(member.address));
    return { id: personTargetId(address), ownerAddress: address, name: String(member.ens_name ?? member.display_name ?? address), position, kind: 'person' };
  });
}
export function insertTarget(target: Target, feastId: string, bind: (value: unknown) => string): string {
  return `insert into targets (feast_id,target_id,kind,owner_address,name,position)
    select ${bind(feastId)}::uuid,${bind(Buffer.from(target.id.slice(2), 'hex'))}::bytea,${bind(target.kind)},${bind(target.ownerAddress?.toLowerCase() ?? null)},${bind(target.name)},${bind(target.position)}::smallint from gate
    on conflict (feast_id,target_id) do update set name=excluded.name,position=excluded.position`;
}
export const sameAddress = (a: Address | string, b: Address | string) => a.toLowerCase() === b.toLowerCase();
export function freezePeopleTargets(members: Row[], feastId: string, bind: (value: unknown) => string): string[] {
  const targets = peopleTargets(members);
  return [`delete from targets where feast_id=${bind(feastId)}::uuid and owner_address not in (select jsonb_array_elements_text(${bind(JSON.stringify(targets.map(target => target.ownerAddress!.toLowerCase())))}::jsonb)) and exists(select 1 from gate)`, ...targets.map(target => insertTarget(target, feastId, bind))];
}
