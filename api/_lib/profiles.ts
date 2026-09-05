import type { Address } from '@critter-crumbs/shared';
import type { Database } from './database.js';
import type { EnsResolver } from './ens.js';
import { createStore, profileFromRow, timestamp } from './store.js';
export function createProfiles(db: Database, clock: () => number, ens?: EnsResolver) {
  const store = createStore(db);
  return { async read(address: Address) {
    const profile = await store.profile(address); if (!profile) return null;
    const now = clock();
    if (profile.ensCheckedAt !== null && now >= profile.ensCheckedAt && now - profile.ensCheckedAt < 86400000) return profile;
    let name: string | null;
    try {
      if (!ens) throw new Error('ENS transport unavailable');
      name = await ens.lookupName(address);
    } catch { return { ...profile, ensName: null, warning: 'err.ensUnavailable' as const }; }
      const [rows] = await db.batch([{ text: `update profiles set ens_name=$2,ens_checked_at=$3
        where address=$1 and (ens_checked_at is null or ens_checked_at<=$3::timestamptz) returning *`, values: [address, name, timestamp(now)] }]);
      return rows?.[0] ? profileFromRow(rows[0]) : await store.profile(address);
  } };
}
