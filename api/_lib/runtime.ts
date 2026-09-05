import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApi } from './api.js';
import { createNeonDatabase } from './database.js';
import { nodeHandler, responseHeaders } from './http.js';
import { serverTimelock } from './timelock.js';
import { mainnetEns } from './ens.js';
import { serverNow } from './clock.js';
let handler: ReturnType<typeof nodeHandler> | undefined;
export default async function runtime(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    if (!handler) {
      const { DATABASE_URL, SESSION_SECRET, APP_ORIGIN, BASE_RPC_URL, SHUTTER_API_BASE, MAINNET_RPC_URL, SHUTTER_MODE, MOCK_SECRET, NODE_ENV } = process.env;
      if (!DATABASE_URL || !SESSION_SECRET || !APP_ORIGIN) throw new Error('Missing server configuration');
      const connectOrigins = [BASE_RPC_URL, SHUTTER_API_BASE].filter((value): value is string => Boolean(value));
      const db = createNeonDatabase(DATABASE_URL);
      const timelock = serverTimelock(db, serverNow, { mode: SHUTTER_MODE || 'mock', production: NODE_ENV === 'production', ...(MOCK_SECRET ? { mockSecret: MOCK_SECRET } : {}) });
      handler = nodeHandler(createApi({ db, timelock, sessionSecret: SESSION_SECRET, origin: APP_ORIGIN, clock: serverNow, connectOrigins, ...(MAINNET_RPC_URL ? { ens: mainnetEns(MAINNET_RPC_URL) } : {}) }), serverNow);
    }
    await handler(request, response);
  } catch {
    response.writeHead(503, responseHeaders()); response.end(JSON.stringify({ error: 'err.storeUnreachable', serverNow: serverNow() }));
  }
}
