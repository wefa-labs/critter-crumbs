import { hex, type Feast } from '@critter-crumbs/shared';
import { hexToBytes } from 'viem';
import { ApiClientError, type createApiClient } from '../api-client/index.js';
import type { Timelock } from './index.js';
/** Use the member-protected store first; only an outage triggers public Shutter fallback. */
export async function readFeastKey(api: Pick<ReturnType<typeof createApiClient>, 'get'>, feast: Pick<Feast, 'id' | 'registration'>, fallback: Timelock): Promise<Uint8Array | null> {
  try {
    const response = await api.get(`/api/feasts/${feast.id}/key`);
    const key = hexToBytes(hex(response.key));
    if (![32, 48].includes(key.length)) throw new ApiClientError('err.keyUnreachable', 200);
    return key;
  } catch (error) {
    if (!(error instanceof ApiClientError) || (error.status !== 0 && error.status < 500) || !feast.registration) throw error;
    return fallback.getKey(feast.registration.identity);
  }
}
