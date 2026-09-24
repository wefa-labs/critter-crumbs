import { randomBytes, randomUUID } from 'node:crypto';
import { verifySignInMessage, type Timelock, type EasConfig, type EasReader } from '@critter-crumbs/core';
import { hex, integer, parseAddress, parseProfileUpdate, parseUuid, record, text, ValidationError, type Hex, type Address } from '@critter-crumbs/shared';
import type { Database } from './database.js';
import { createStore } from './store.js';
import { sessionCookies } from './session.js';
import { createProfiles } from './profiles.js';
import type { EnsResolver } from './ens.js';
import { createResults } from './results.js';
import { createKeys } from './keys.js';
import { createBallots } from './ballots.js';
import { createFeasts } from './feasts.js';
import { createBurrows } from './burrows.js';
import { HttpError } from './errors.js';
import { responseHeaders } from './http.js';
import { seedFixtures } from './seed.js';
export interface ApiRequest { method: string; path: string; headers?: Record<string, string | undefined>; body?: unknown }
export interface ApiReply { status: number; headers: Record<string, string>; body: Record<string, unknown> }
export interface DevControls { recordTransaction?: (actor: Address, input: unknown) => Promise<{txHash:Hex}>; enabled: boolean; production: boolean; mode: string; setTime: (now: number) => void | Promise<void>; releaseKey: (identity: Hex) => void | Promise<void> }
export interface ApiDependencies { db: Database; clock: () => number; sessionSecret: string; origin: string; connectOrigins?: string[]; ens?: EnsResolver; timelock?: Timelock; eas?: EasConfig; dev?: DevControls; resultReader?: EasReader }
export function createApi(deps: ApiDependencies): (request: ApiRequest) => Promise<ApiReply> {
  const store = createStore(deps.db), cookies = sessionCookies(deps.sessionSecret);
  const profiles = createProfiles(deps.db, deps.clock, deps.ens);
  const burrows = createBurrows(deps.db, deps.clock, deps.ens);
  const results = createResults(deps.db, deps.clock, deps.resultReader);
  const keys = createKeys(deps.db, deps.clock, deps.timelock);
  const ballots = createBallots(deps.db, deps.clock, deps.eas);
  const feasts = createFeasts(deps.db, deps.clock, deps.timelock);
  const handle = async (request: ApiRequest): Promise<ApiReply> => {
    const now = deps.clock();
    const headers = responseHeaders(deps.connectOrigins);
    const reply = (status: number, body: Record<string, unknown>): ApiReply => ({ status, headers, body: { ...body, serverNow: body.serverNow ?? deps.clock() } });
    try {
      const incoming = Object.fromEntries(Object.entries(request.headers ?? {}).map(([name, value]) => [name.toLowerCase(), value]));
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && incoming.origin && incoming.origin !== deps.origin) throw new HttpError(403, 'err.generic');
      const path = request.path.split('?')[0]!;
      if (path.startsWith('/api/dev/')) {
        const dev = deps.dev;
        if (!dev?.enabled || dev.production || dev.mode !== 'mock') throw new HttpError(404, 'err.generic');
        if (path === '/api/dev/config' && request.method === 'GET') return reply(200, { enabled: true, mode: 'mock', production: false });
        if (request.method !== 'POST') throw new HttpError(404, 'err.generic');
        if (path === '/api/dev/result-transaction' && dev.recordTransaction) { const actor=cookies.read(incoming.cookie,now); if(!actor)throw new HttpError(401,'err.generic'); try { return reply(200,await dev.recordTransaction(actor,request.body)); } catch(error) { if(error instanceof TypeError)throw new HttpError(400,'err.generic'); throw error; } }
        if (path === '/api/dev/seed') return reply(201, await seedFixtures(handle, deps.clock, request.body, dev.setTime));
        if (path === '/api/dev/time') { await dev.setTime(integer(record(request.body).now, 0, 8640000000000000)); return reply(200, {}); }
        if (path === '/api/dev/release-key') { await dev.releaseKey(hex(record(request.body).identity, 32)); return reply(200, {}); }
        throw new HttpError(404, 'err.generic');
      }
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
      const feastMatch = /^\/api\/feasts\/([^/]+)$/.exec(path);
      if (feastMatch && request.method === 'GET') return reply(200, await feasts.read(parseUuid(feastMatch[1]), address));
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
        const burrow = await burrows.read(parseUuid(burrowMatch[1]), address);
        if (!burrow) throw new HttpError(403, 'burrow.unknown.title');
        return reply(200, burrow);
      }
      const removalMatch = /^\/api\/burrows\/([^/]+)\/removals$/.exec(path);
      if (removalMatch && request.method === 'POST') return reply(200, await burrows.remove(parseUuid(removalMatch[1]), address, request.body));
      const memberMatch = /^\/api\/burrows\/([^/]+)\/(members|join|leave)$/.exec(path);
      if (memberMatch && request.method === 'POST') {
        const id = parseUuid(memberMatch[1]);
        const result = memberMatch[2] === 'leave' ? await burrows.leave(id, address) : memberMatch[2] === 'join' ? await burrows.join(id, address)
          : await burrows.add(id, address, text(record(request.body).address, 1, 255, 'burrow.add.label', true));
        return reply(200, result);
      }
      const resultMatch = /^\/api\/feasts\/([^/]+)\/result-attestation$/.exec(path);
      if (resultMatch && request.method === 'POST') return reply(200, await results.record(parseUuid(resultMatch[1]), address, request.body));
      const keyMatch = /^\/api\/feasts\/([^/]+)\/key$/.exec(path);
      if (keyMatch && request.method === 'GET') return reply(200, await keys.read(parseUuid(keyMatch[1]), address));
      const ballotMatch = /^\/api\/feasts\/([^/]+)\/ballots$/.exec(path);
      if (ballotMatch && request.method === 'GET') return reply(200, await ballots.read(parseUuid(ballotMatch[1]), address));
      if (ballotMatch && request.method === 'POST') return reply(200, await ballots.submit(parseUuid(ballotMatch[1]), address, request.body));
      const draftMatch = /^\/api\/burrows\/([^/]+)\/feasts$/.exec(path);
      if (draftMatch && request.method === 'POST') return reply(201, await feasts.create(parseUuid(draftMatch[1]), address, request.body));
      const feastAction = /^\/api\/feasts\/([^/]+)\/(open|cancel)$/.exec(path);
      if (feastAction && request.method === 'POST') return reply(200, await feasts[feastAction[2] as 'open' | 'cancel'](parseUuid(feastAction[1]), address));
      const extensionMatch = /^\/api\/feasts\/([^/]+)\/extend$/.exec(path);
      if (extensionMatch && request.method === 'POST') return reply(200, await feasts.extend(parseUuid(extensionMatch[1]), address, record(request.body).gatheringEndsAt));
      const statementMatch = /^\/api\/feasts\/([^/]+)\/statements\/([^/]+)$/.exec(path);
      if (statementMatch && request.method === 'PUT') return reply(200, await feasts.statement(parseUuid(statementMatch[1]), hex(statementMatch[2], 32), address, record(request.body).body));
      throw new HttpError(404, 'err.generic');
    } catch (error) {
      if (error instanceof HttpError) { Object.assign(headers, error.headers); return reply(error.status, { error: error.copyId, ...(error.detail ? { detail: error.detail } : {}) }); }
      if (error instanceof ValidationError) return reply(400, { error: error.copyId });
      return reply(503, { error: 'err.storeUnreachable' });
    }
  };
  return handle;
}
