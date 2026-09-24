import { MAX_FEAST_TARGETS, integer, parseAddress, parseUuid, record, type Address } from '@critter-crumbs/shared';
import { randomUUID } from 'node:crypto';
import { phaseAt } from '@critter-crumbs/core';
import { feastClock } from './feast-rows.js';
import type { Database } from './database.js';
import type { EnsResolver } from './ens.js';
import { HttpError } from './errors.js';
import { activeMember, burrowView, createBurrowTransactions, requireMember, removalFromRow, timestamp } from './burrow-transactions.js';
export function createBurrows(db: Database, clock: () => number, ens?: EnsResolver) {
  const transactions = createBurrowTransactions(db, clock);
  return {
    async read(id: string, address: Address) {
      const snapshot = await transactions.read(id); requireMember(snapshot, address); return burrowView(snapshot, address);
    },
    async add(id: string, actor: Address, input: string) {
      requireMember(await transactions.read(id), actor);
      let address: Address;
      if (input.startsWith('0x')) address = parseAddress(input);
      else {
        try { const resolved = await ens?.resolveAddress(input); if (!resolved) throw new Error('Unresolved ENS name'); address = parseAddress(resolved); }
        catch { throw new HttpError(503, 'err.ensUnavailable'); }
      }
      await transactions.write(id, (snapshot, now, bind) => {
        requireMember(snapshot, actor);
        if (!activeMember(snapshot, address) && snapshot.members.filter(member => member.left_at === null).length >= MAX_FEAST_TARGETS
          && snapshot.feasts.some(feast => feast.kind === 'people' && ['draft', 'gathering'].includes(phaseAt(feastClock(feast), now)))) {
          throw new HttpError(400, 'err.feastCapacity');
        }
        const member = bind(address), actorParam = bind(actor), at = bind(timestamp(now));
        return { result: undefined, sql: [
          `insert into profiles (address,created_at) select ${member},${at}::timestamptz from gate on conflict (address) do nothing`,
          `insert into burrow_members (burrow_id,address,added_by) select id,${member},${actorParam} from gate on conflict (burrow_id,address) do update set left_at=null,membership_version=burrow_members.membership_version+case when burrow_members.left_at is null then 0 else 1 end`,
        ] };
      });
      return this.read(id, actor);
    },
    async remove(id: string, actor: Address, input: unknown) {
      const body = record(input), address = parseAddress(body.address), operationId = parseUuid(body.operationId);
      const version = integer(body.membershipVersion, 1, 2147483647), receiptId = randomUUID();
      return transactions.write(id, (snapshot, now, bind) => {
        requireMember(snapshot, actor);
        if (snapshot.burrow.created_by !== actor) throw new HttpError(403, 'err.removeAuthority');
        if (address === actor) throw new HttpError(400, 'err.removeSelf');
        const receipt = snapshot.removals.find(row => row.actor_address === actor && row.operation_id === operationId);
        if (receipt) {
          if (receipt.member_address !== address || Number(receipt.membership_version) !== version) throw new HttpError(409, 'err.membershipChanged');
          return { sql: [], result: { removal: removalFromRow(receipt) } };
        }
        const member = activeMember(snapshot, address), creator = activeMember(snapshot, actor)!;
        if (!member || Number(member.membership_version) !== version) throw new HttpError(409, 'err.membershipChanged');
        const name = (row: typeof member) => String(row!.ens_name || row!.display_name || row!.address);
        const row = { id: receiptId, sequence: String(BigInt(String(snapshot.burrow.revision)) + 1n), operation_id: operationId, actor_address: actor, member_address: address, membership_version: version, actor_name: name(creator), member_name: name(member), removed_at: timestamp(now) };
        return { result: { removal: removalFromRow(row) }, sql: [
          `update burrow_members set left_at=${bind(row.removed_at)}::timestamptz where burrow_id=$1 and address=${bind(address)} and membership_version=${bind(version)}::int and exists(select 1 from gate)`,
          `insert into member_removals (id,burrow_id,sequence,operation_id,actor_address,member_address,membership_version,actor_name,member_name,removed_at)
            select ${bind(receiptId)}::uuid,id,${bind(row.sequence)}::bigint,${bind(operationId)}::uuid,${bind(actor)},${bind(address)},${bind(version)}::int,${bind(row.actor_name)},${bind(row.member_name)},${bind(row.removed_at)}::timestamptz from gate`,
        ] };
      });
    },
    async leave(id: string, actor: Address) {
      await transactions.write(id, (snapshot, now, bind) => {
        requireMember(snapshot, actor);
        return { result: undefined, sql: [`update burrow_members set left_at=${bind(timestamp(now))}::timestamptz where burrow_id=$1 and address=${bind(actor)} and exists(select 1 from gate)`] };
      });
      return {};
    },
    async join(id: string, actor: Address) {
      await transactions.write(id, (snapshot, now, bind) => {
        requireMember(snapshot, actor);
        return { result: undefined, sql: [`update burrow_members set joined_at=coalesce(joined_at,${bind(timestamp(now))}::timestamptz) where burrow_id=$1 and address=${bind(actor)} and exists(select 1 from gate)`] };
      });
      return this.read(id, actor);
    },
  };
}
