import { easDomain, type EasConfig } from '@critter-crumbs/core';
import { hex, parseAddress, parseDevEndpointsEnabled } from '@critter-crumbs/shared';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApi } from './api.js';
import { createNeonDatabase } from './database.js';
import { nodeHandler, responseHeaders } from './http.js';
import { serverTimelock } from './timelock.js';
import { mainnetEns } from './ens.js';
import { createServerClock } from './clock.js';
const clock = createServerClock();
let handler: ReturnType<typeof nodeHandler> | undefined;
export default async function runtime(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    if (!handler) {
      const { DATABASE_URL, SESSION_SECRET, APP_ORIGIN, BASE_RPC_URL, SHUTTER_API_BASE, MAINNET_RPC_URL, SHUTTER_MODE, MOCK_SECRET, NODE_ENV, EAS_CHAIN_ID, EAS_ADDRESS, EAS_BALLOT_SCHEMA_UID, DEV_ENDPOINTS_ENABLED, SHUTTER_API_KEY, SHUTTER_RPC_URL, SHUTTER_REGISTRY_ADDRESS, SHUTTER_KEY_BROADCAST_ADDRESS, SHUTTER_REGISTRANT_ADDRESS } = process.env;
      if (!DATABASE_URL || !SESSION_SECRET || !APP_ORIGIN) throw new Error('Missing server configuration');
      const connectOrigins = [BASE_RPC_URL, SHUTTER_API_BASE].filter((value): value is string => Boolean(value));
      const eas: EasConfig | undefined = EAS_CHAIN_ID && EAS_ADDRESS && EAS_BALLOT_SCHEMA_UID ? { chainId: Number(EAS_CHAIN_ID) as EasConfig['chainId'], address: parseAddress(EAS_ADDRESS), ballotSchemaUid: hex(EAS_BALLOT_SCHEMA_UID, 32) } : undefined;
      if (eas) easDomain(eas);
      const db = createNeonDatabase(DATABASE_URL);
      const timelock = serverTimelock(db, clock.now, { mode: SHUTTER_MODE || 'mock', production: NODE_ENV === 'production', ...(MOCK_SECRET ? { mockSecret: MOCK_SECRET } : {}), ...(SHUTTER_API_KEY ? { apiKey: SHUTTER_API_KEY } : {}), ...(SHUTTER_API_BASE ? { apiBase: SHUTTER_API_BASE } : {}), ...(SHUTTER_RPC_URL ? { rpcUrl: SHUTTER_RPC_URL } : {}), ...(SHUTTER_REGISTRY_ADDRESS ? { registry: SHUTTER_REGISTRY_ADDRESS } : {}), ...(SHUTTER_KEY_BROADCAST_ADDRESS ? { keyBroadcast: SHUTTER_KEY_BROADCAST_ADDRESS } : {}), ...(SHUTTER_REGISTRANT_ADDRESS ? { registrant: SHUTTER_REGISTRANT_ADDRESS } : {}) });
      handler = nodeHandler(createApi({ db, timelock, ...(eas ? { eas } : {}), sessionSecret: SESSION_SECRET, origin: APP_ORIGIN, clock: clock.now, connectOrigins, ...(MAINNET_RPC_URL ? { ens: mainnetEns(MAINNET_RPC_URL) } : {}),
        dev: { enabled: parseDevEndpointsEnabled(DEV_ENDPOINTS_ENABLED), production: NODE_ENV === 'production', mode: SHUTTER_MODE || 'mock', setTime: clock.setTime, releaseKey(identity) { if ('release' in timelock && typeof timelock.release === 'function') timelock.release(identity); else throw new Error('Mock release is unavailable'); } } }), clock.now);
    }
    await handler(request, response);
  } catch {
    response.writeHead(503, responseHeaders()); response.end(JSON.stringify({ error: 'err.storeUnreachable', serverNow: clock.now() }));
  }
}
