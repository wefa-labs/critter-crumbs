import { parseAddress, type Address } from '@critter-crumbs/shared';
import type { Database } from './database.js';
import type { EnsResolver } from './ens.js';
import { HttpError } from './errors.js';
import { burrowView, createBurrowTransactions, requireMember, timestamp } from './burrow-transactions.js';
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
        const member = bind(address), actorParam = bind(actor), at = bind(timestamp(now));
        return { result: undefined, sql: [
          `insert into profiles (address,created_at) select ${member},${at}::timestamptz from gate on conflict (address) do nothing`,
          `insert into burrow_members (burrow_id,address,added_by) select id,${member},${actorParam} from gate on conflict (burrow_id,address) do update set left_at=null`,
        ] };
      });
      return this.read(id, actor);
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
