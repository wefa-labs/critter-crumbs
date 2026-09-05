import { randomBytes, randomUUID } from 'node:crypto';
import { verifySignInMessage } from '@critter-crumbs/core';
import { hex, parseAddress, parseProfileUpdate, parseUuid, record, text, ValidationError, type CopyId } from '@critter-crumbs/shared';
import type { Database } from './database.js';
import { createStore } from './store.js';
import { sessionCookies } from './session.js';
import { createProfiles } from './profiles.js';
import type { EnsResolver } from './ens.js';
import { responseHeaders } from './http.js';
export interface ApiRequest { method: string; path: string; headers?: Record<string, string | undefined>; body?: unknown }
export interface ApiReply { status: number; headers: Record<string, string>; body: Record<string, unknown> }
export interface ApiDependencies { db: Database; clock: () => number; sessionSecret: string; origin: string; connectOrigins?: string[]; ens?: EnsResolver }
class HttpError extends Error {
  constructor(readonly status: number, readonly copyId: CopyId) { super(copyId); }
}
export function createApi(deps: ApiDependencies): (request: ApiRequest) => Promise<ApiReply> {
  const store = createStore(deps.db), cookies = sessionCookies(deps.sessionSecret);
  const profiles = createProfiles(deps.db, deps.clock, deps.ens);
  return async request => {
    const now = deps.clock();
    const headers = responseHeaders(deps.connectOrigins);
    const reply = (status: number, body: Record<string, unknown>): ApiReply => ({ status, headers, body: { ...body, serverNow: deps.clock() } });
    try {
      const incoming = Object.fromEntries(Object.entries(request.headers ?? {}).map(([name, value]) => [name.toLowerCase(), value]));
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && incoming.origin && incoming.origin !== deps.origin) throw new HttpError(403, 'err.generic');
      const path = request.path.split('?')[0]!;
      if (path === '/api/session/nonce' && request.method === 'GET') {
        const nonce = randomBytes(16).toString('hex'); await store.createNonce(nonce, now);
        return reply(200, { nonce, issuedAt: now, expiresAt: now + 600000 });
      }
      if (path === '/api/session' && request.method === 'POST') {
        const body = record(request.body), address = parseAddress(body.address), nonce = text(body.nonce, 32, 32);
        const challenge = await store.nonce(nonce);
        if (!challenge || !await verifySignInMessage(address, challenge, hex(body.signature, 65), deps.clock())) throw new HttpError(401, 'err.generic');
        const profile = await store.consumeNonce(nonce, address, deps.clock());
        if (!profile) throw new HttpError(401, 'err.generic');
        headers['Set-Cookie'] = cookies.issue(address, deps.clock());
        return reply(200, { ...await profiles.read(address) });
      }
      const address = cookies.read(incoming.cookie, now);
      if (!address) throw new HttpError(401, 'err.generic');
      if (path === '/api/session' && request.method === 'DELETE') {
        headers['Set-Cookie'] = cookies.clear(); headers['Clear-Site-Data'] = '"cookies"'; return reply(200, {});
      }
      if (path === '/api/me' && request.method === 'GET') {
        const profile = await profiles.read(address); if (!profile) throw new HttpError(401, 'err.generic');
        return reply(200, { ...profile, burrows: await store.burrows(address) });
      }
      if (path === '/api/me' && request.method === 'PUT') {
        const profile = await store.updateProfile(address, parseProfileUpdate(request.body));
        if (!profile) throw new HttpError(400, 'err.generic');
        return reply(200, { ...await profiles.read(address) });
      }
      if (path === '/api/burrows' && request.method === 'POST') {
        const name = text(record(request.body).name, 1, 60, 'burrow.name.label', true), id = randomUUID();
        await store.createBurrow(id, name, address, deps.clock()); return reply(201, { id, name });
      }
      const burrowMatch = /^\/api\/burrows\/([^/]+)$/.exec(path);
      if (burrowMatch && request.method === 'GET') {
        const burrow = await store.burrow(parseUuid(burrowMatch[1]), address);
        if (!burrow) throw new HttpError(403, 'burrow.unknown.title');
        return reply(200, burrow);
      }
      throw new HttpError(404, 'err.generic');
    } catch (error) {
      if (error instanceof HttpError) return reply(error.status, { error: error.copyId });
      if (error instanceof ValidationError) return reply(400, { error: error.copyId });
      return reply(503, { error: 'err.storeUnreachable' });
    }
  };
}
