import { createChiadoTimelock, createMainnetTimelock, createMockTimelock, type Timelock } from '@critter-crumbs/core';
import { parseAddress } from '@critter-crumbs/shared';
import type { Database } from './database.js';
import { milliseconds } from './feast-rows.js';
import { registrationJournal } from './registration-journal.js';
export interface ServerTimelockConfig {
  mode: string; production: boolean; mockSecret?: string; apiKey?: string; apiBase?: string;
  rpcUrl?: string; registry?: string; keyBroadcast?: string; registrant?: string; fetch?: typeof fetch;
}
export function mockServerTimelock(db: Database, clock: () => number, secret: string) {
  return createMockTimelock({ secret, clock, async lookup(identity) {
    const [row] = await db.query('select id,scattering_ends_at from feasts where shutter_identity=$1', [Buffer.from(identity.slice(2), 'hex')]);
    return row ? { feastId: String(row.id), decryptionTimestamp: milliseconds(row.scattering_ends_at) } : null;
  } });
}
export function serverTimelock(db: Database, clock: () => number, config: ServerTimelockConfig): Timelock {
  if (config.mode === 'mock') {
    if (config.production || !config.mockSecret) throw new Error('Mock mode requires a non-production server secret');
    return mockServerTimelock(db, clock, config.mockSecret);
  }
  if (!['chiado', 'mainnet'].includes(config.mode) || !config.rpcUrl || !config.registry || !config.keyBroadcast || !config.registrant) throw new Error('Missing real Shutter configuration');
  return (config.mode === 'chiado' ? createChiadoTimelock : createMainnetTimelock)({ ...(config.fetch ? { fetch: config.fetch } : {}), ...(config.apiBase ? { apiBase: config.apiBase } : {}),
    server: { rpcUrl: config.rpcUrl, registry: parseAddress(config.registry), keyBroadcast: parseAddress(config.keyBroadcast), registrant: parseAddress(config.registrant), journal: registrationJournal(db, clock), ...(config.apiKey ? { apiKey: config.apiKey } : {}) } });
}
