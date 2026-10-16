import { personTargetId } from '@critter-crumbs/core';
import { getAddress } from 'viem';
import type { Address, FeastPortrait, Target } from '@critter-crumbs/shared';
import type { Row } from './database.js';
import { identityFromRow, timestamp } from './store.js';
export function peopleTargets(members: Row[]): Target[] {
  return members.filter(member => member.left_at === null).map((member, position) => {
    const address = getAddress(String(member.address));
    return { id: personTargetId(address), ownerAddress: address, name: String(member.ens_name ?? member.display_name ?? address), position, kind: 'person' };
  });
}
export function currentPortrait(target: Target, members: Row[], source: 'profile' | 'creation' | 'freeze', capturedAt: number | null): FeastPortrait {
  const member = target.ownerAddress ? members.find(member => sameAddress(String(member.address), target.ownerAddress!)) : undefined;
  if (target.ownerAddress && !member) throw new Error('Missing critter profile');
  return { targetId: target.id, ...(member ? identityFromRow(member) : { variant: 0, generatorVersion: '1', rendererVersion: '1' } as const), source, capturedAt };
}
export function insertTarget(target: Target, feastId: string, bind: (value: unknown) => string, portrait: FeastPortrait): string {
  return `insert into targets (feast_id,target_id,kind,owner_address,name,position,portrait_variant,generator_version,renderer_version,portrait_source,portrait_captured_at)
    select ${bind(feastId)}::uuid,${bind(Buffer.from(target.id.slice(2), 'hex'))}::bytea,${bind(target.kind)},${bind(target.ownerAddress?.toLowerCase() ?? null)},${bind(target.name)},${bind(target.position)}::smallint,
      ${bind(portrait.variant)}::smallint,${bind(portrait.generatorVersion)},${bind(portrait.rendererVersion)},${bind(portrait.source)},${bind(portrait.capturedAt === null ? null : timestamp(portrait.capturedAt))}::timestamptz from gate
    on conflict (feast_id,target_id) do update set name=excluded.name,position=excluded.position${portrait.source === 'freeze' ? ',portrait_variant=excluded.portrait_variant,generator_version=excluded.generator_version,renderer_version=excluded.renderer_version,portrait_source=excluded.portrait_source,portrait_captured_at=excluded.portrait_captured_at' : ''}`;
}
export const sameAddress = (a: Address | string, b: Address | string) => a.toLowerCase() === b.toLowerCase();
export function freezePeopleTargets(members: Row[], feastId: string, bind: (value: unknown) => string, now: number): string[] {
  const targets = peopleTargets(members);
  return [`delete from targets where feast_id=${bind(feastId)}::uuid and owner_address not in (select jsonb_array_elements_text(${bind(JSON.stringify(targets.map(target => target.ownerAddress!.toLowerCase())))}::jsonb)) and exists(select 1 from gate)`, ...targets.map(target => insertTarget(target, feastId, bind, currentPortrait(target, members, 'freeze', now)))];
}
