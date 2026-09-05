import { createMockTimelock, type Timelock } from '@critter-crumbs/core';
import type { Database } from './database.js';
import { milliseconds } from './feast-rows.js';
export function serverTimelock(db: Database, clock: () => number, config: { mode: string; production: boolean; mockSecret?: string }): Timelock {
  if (config.mode !== 'mock' || config.production) throw new Error('Unsupported timelock configuration');
  if (!config.mockSecret) throw new Error('MOCK_SECRET is required');
  return createMockTimelock({ secret: config.mockSecret, clock, async lookup(identity) {
    const [row] = await db.query('select id,scattering_ends_at from feasts where shutter_identity=$1', [Buffer.from(identity.slice(2), 'hex')]);
    return row ? { feastId: String(row.id), decryptionTimestamp: milliseconds(row.scattering_ends_at) } : null;
  } });
}
