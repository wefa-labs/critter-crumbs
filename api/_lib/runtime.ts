import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApi } from './api.js';
import { createNeonDatabase } from './database.js';
import { nodeHandler, responseHeaders } from './http.js';
import { serverNow } from './clock.js';
let handler: ReturnType<typeof nodeHandler> | undefined;
export default async function runtime(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    if (!handler) {
      const { DATABASE_URL, SESSION_SECRET, APP_ORIGIN, BASE_RPC_URL, SHUTTER_API_BASE } = process.env;
      if (!DATABASE_URL || !SESSION_SECRET || !APP_ORIGIN) throw new Error('Missing server configuration');
      const connectOrigins = [BASE_RPC_URL, SHUTTER_API_BASE].filter((value): value is string => Boolean(value));
      handler = nodeHandler(createApi({ db: createNeonDatabase(DATABASE_URL), sessionSecret: SESSION_SECRET, origin: APP_ORIGIN, clock: serverNow, connectOrigins }), serverNow);
    }
    await handler(request, response);
  } catch {
    response.writeHead(503, responseHeaders()); response.end(JSON.stringify({ error: 'err.storeUnreachable', serverNow: serverNow() }));
  }
}
