import { getAddress } from 'viem';
import type { Address, CritterIdentity, Profile } from '@critter-crumbs/shared';
import type { Database, Row } from './database.js';
export const timestamp = (now: number) => new Date(now).toISOString();
const milliseconds = (value: unknown) => value === null || value === undefined ? null : new Date(value as string | number).getTime();
export function identityFromRow(row: Row): CritterIdentity {
  const generatorVersion = row.generator_version, rendererVersion = row.renderer_version;
  if ((generatorVersion !== '1' && generatorVersion !== '2') || (rendererVersion !== '1' && rendererVersion !== '2') || rendererVersion !== generatorVersion) throw new Error('Unsupported critter identity versions');
  return { generatorVersion, rendererVersion, variant: Number(row.variant) };
}
export function profileFromRow(row: Row): Profile {
  return { address: getAddress(String(row.address)), ...identityFromRow(row), rerollsUsed: Number(row.rerolls_used), critterLocked: Boolean(row.critter_locked),
    displayName: row.display_name as string | null, ensName: row.ens_name as string | null,
    ensCheckedAt: milliseconds(row.ens_checked_at), createdAt: milliseconds(row.created_at)! };
}
export function createStore(db: Database) {
  return {
    async createNonce(nonce: string, now: number) {
      await db.batch([{ text: 'insert into sign_in_nonces (nonce, issued_at, expires_at) values ($1,$2,$3)', values: [nonce, timestamp(now), timestamp(now + 600000)] }]);
    },
    async nonce(nonce: string) {
      const [row] = await db.query('select * from sign_in_nonces where nonce=$1', [nonce]);
      return row ? { nonce: String(row.nonce), issuedAt: milliseconds(row.issued_at)!, expiresAt: milliseconds(row.expires_at)! } : null;
    },
    async consumeNonce(nonce: string, address: Address, now: number) {
      const [rows] = await db.batch([{ text: `with consumed as (
        delete from sign_in_nonces where nonce=$1 and expires_at>$3::timestamptz returning nonce
      ) insert into profiles (address, created_at) select $2,$3::timestamptz from consumed
        on conflict (address) do update set address=excluded.address returning *`, values: [nonce, address, timestamp(now)] }]);
      return rows?.[0] ? profileFromRow(rows[0]) : null;
    },
    async profile(address: Address) {
      const [row] = await db.query('select * from profiles where address=$1', [address]);
      return row ? profileFromRow(row) : null;
    },
    async updateProfile(address: Address, update: { displayName?: string; variant?: number; keepCritter?: true }) {
      const [rows] = await db.batch([{ text: `update profiles set
        display_name=coalesce($2,display_name), variant=coalesce($3,variant),
        critter_locked=critter_locked or $4 or coalesce($3=4,false),
        rerolls_used=rerolls_used+case when $3::int>variant then 1 else 0 end
        where address=$1 and ($3::int is null or $3=variant or ($3=variant+1 and rerolls_used<4 and not critter_locked)) returning *`,
        values: [address, update.displayName ?? null, update.variant ?? null, update.keepCritter ?? false] }]);
      return rows?.[0] ? profileFromRow(rows[0]) : null;
    },
    async cacheEns(address: Address, name: string | null, now: number) {
      const [rows] = await db.batch([{ text: `update profiles set ens_name=$2,ens_checked_at=$3
        where address=$1 and (ens_checked_at is null or ens_checked_at<=$3::timestamptz) returning *`, values: [address, name, timestamp(now)] }]);
      return rows?.[0] ? profileFromRow(rows[0]) : this.profile(address);
    },
    async burrows(address: Address) {
      return db.query(`select b.id,b.name from burrows b join burrow_members m on m.burrow_id=b.id where m.address=$1 and m.left_at is null order by b.created_at,b.id`, [address]);
    },
    async createBurrow(id: string, name: string, address: Address, now: number) {
      await db.batch([{ text: `with created as (
        insert into burrows (id,name,created_by,created_at) values ($1,$2,$3,$4) returning id
      ) insert into burrow_members (burrow_id,address,added_by,joined_at) select id,$3,$3,$4 from created`, values: [id, name, address, timestamp(now)] }]);
    },

  };
}
