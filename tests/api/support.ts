import { isolatedTestDatabase } from '../../db/test-database.js';
import { createNeonDatabase, type Database } from '../../api/_lib/database.js';
import { fileURLToPath } from 'node:url';
import { createPGliteDatabase } from '../../db/pglite.js';
import { migrateDatabase } from '../../db/migrate.js';
export async function openTestDatabase(factory?: () => Promise<Database>) {
  if (!factory && process.env.CC_API_DATABASE === 'neon' && !process.env.DATABASE_URL) throw new Error('Set DATABASE_URL for opt-in Neon tests');
  const db = factory ? await factory() : process.env.CC_API_DATABASE === 'neon' ? await isolatedTestDatabase(createNeonDatabase(process.env.DATABASE_URL!)) : await createPGliteDatabase();
  try { await migrateDatabase(db, fileURLToPath(new URL('../../db/migrations', import.meta.url))); return db; }
  catch (error) { await db.close(); throw error; }
}

import { buildSignInMessage, createLocalAccount, createMockTimelock, type SignInChallenge, type Timelock } from '@critter-crumbs/core';
import { createApi, type ApiDependencies } from '../../api/_lib/api.js';
export const apiTestTimeout = process.env.CC_API_DATABASE === 'neon' ? 180000 : 30000;
export const testAccount = (n: number) => createLocalAccount(`0x${n.toString(16).padStart(64, '0')}`);
export async function apiHarness(options: Partial<Omit<ApiDependencies, 'db'>> & { databaseFactory?: () => Promise<Database>; timelockFactory?: (db: ApiDependencies['db'], clock: () => number) => Timelock } = {}) {
  const db = await openTestDatabase(options.databaseFactory); const sessions = new Map<string, { cookie: string }>(); let now = 1800000000123;
  const dependencies = { db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173', timelock: options.timelockFactory?.(db, options.clock ?? (() => now)) ?? createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: options.clock ?? (() => now) }), ...options };
  const api = createApi(dependencies);
  async function signedRequest(n = 1) {
    const account = testAccount(n), challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
    const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
    return { method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } };
  }
  async function connect(n = 1) {
    const request = await signedRequest(n), account = testAccount(n);
    const response = await api(request);
    if (response.status !== 200) throw new Error(`Sign-in failed: ${JSON.stringify(response.body)}`);
    const headers = { cookie: response.headers['Set-Cookie']!.split(';')[0]! }; sessions.set(account.address.toLowerCase(), headers);
    return { account, request, connected: response, headers };
  }
  async function openFeastFixture(burrowId: string, creator: string, status = 'open') {
    const headers = sessions.get(creator.toLowerCase())!;
    const burrow = await api({ method: 'GET', path: `/api/burrows/${burrowId}`, headers });
    const kind = (burrow.body.members as unknown[]).length >= 3 ? 'people' : 'options';
    const created = await api({ method: 'POST', path: `/api/burrows/${burrowId}/feasts`, headers, body: {
      title: 'Fixture', kind, crumbsPerCritter: 100, gatheringEndsAt: now+1000, scatteringEndsAt: now+2000,
      aggregatePublic: false, individualOpen: false, options: [{ name: 'Garden', statement: '' }],
    } });
    if (created.status !== 201) throw new Error(`Draft creation failed: ${JSON.stringify(created.body)}`);
    const id = String(created.body.id);
    if (status === 'open') {
      const opened = await api({ method: 'POST', path: `/api/feasts/${id}/open`, headers });
      if (opened.status !== 200) throw new Error(`Opening failed: ${JSON.stringify(opened.body)}`);
    }
    return id;
  }
  async function createFeast(options: { kind?: 'people' | 'options'; open?: boolean; aggregatePublic?: boolean } = {}) {
    const owner = await connect(), members = [await connect(2), await connect(3)];
    const burrow = await api({ method: 'POST', path: '/api/burrows', headers: owner.headers, body: { name: 'Oak' } });
    const burrowId = String(burrow.body.id);
    for (const member of members) await api({ method: 'POST', path: `/api/burrows/${burrowId}/members`, headers: owner.headers, body: { address: member.account.address } });
    const created = await api({ method: 'POST', path: `/api/burrows/${burrowId}/feasts`, headers: owner.headers, body: {
      title: 'Fixture', kind: options.kind ?? 'people', crumbsPerCritter: 100, gatheringEndsAt: now+1000, scatteringEndsAt: now+2000,
      aggregatePublic: options.aggregatePublic ?? false, individualOpen: false, options: [{ name: 'Garden', statement: 'Plant trees.' }, { name: 'Library', statement: 'Buy books.' }],
    } });
    if (created.status !== 201) throw new Error(`Draft creation failed: ${JSON.stringify(created.body)}`);
    const feastId = String(created.body.id), path = `/api/feasts/${feastId}`;
    if (options.open) {
      const opened = await api({ method: 'POST', path: `${path}/open`, headers: owner.headers });
      if (opened.status !== 200) throw new Error(`Opening failed: ${JSON.stringify(opened.body)}`);
    }
    return { owner, members, burrowId, feastId, path, created };
  }

  return { api, anotherApi: () => createApi({ ...dependencies, ...(options.timelockFactory ? { timelock: options.timelockFactory(db, dependencies.clock) } : {}) }), connect, signedRequest, openFeastFixture, createFeast, clock: () => now, advance: (ms: number) => { now += ms; }, close: () => db.close() };
}
