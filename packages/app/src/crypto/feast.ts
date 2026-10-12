import { ApiClientError, ballotSchema, schemaUID } from '@critter-crumbs/core';
import { openFeastResult } from '../app/feast-session.js';
import type { MemberFeast } from '../app/feast-view.js';
import type { AppApi } from '../app/session.js';
import { feastTimelock, type FeastTimelock } from './timelock.js';
/** Opens a finished feast on this device: the key, every counted scatter, then the one reviewed tally. */
export async function openFeast(api: AppApi, feast: MemberFeast, acceptedUids: string[], lock: FeastTimelock = feastTimelock(feast, () => api.now() ?? 0)) {
  // Until the timelock's code is known to work here the feast waits: the screen says so and asks again.
  try { await lock.ready(); } catch { throw new ApiClientError('err.keyUnreachable', 503); }
  return openFeastResult({ api, feast, acceptedUids, eas: { chainId: 84532, address: '0x4200000000000000000000000000000000000021', ballotSchemaUid: schemaUID(ballotSchema) }, timelock: lock.timelock,
    yieldToBrowser: () => new Promise(resolve => setTimeout(resolve, 0)) });
}
