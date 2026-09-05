import { fileURLToPath } from 'node:url';
import { createPGliteDatabase } from '../../db/pglite.js';
import { migrateDatabase } from '../../db/migrate.js';
export async function openTestDatabase() {
  const db = await createPGliteDatabase();
  await migrateDatabase(db, fileURLToPath(new URL('../../db/migrations', import.meta.url)));
  return db;
}

import { buildSignInMessage, createLocalAccount, type SignInChallenge } from '@critter-crumbs/core';
import { createApi, type ApiDependencies } from '../../api/_lib/api.js';
export const testAccount = (n: number) => createLocalAccount(`0x${n.toString(16).padStart(64, '0')}`);
export async function apiHarness(options: Partial<Omit<ApiDependencies, 'db'>> = {}) {
  const db = await openTestDatabase(); let now = 1800000000123;
  const api = createApi({ db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173', ...options });
  async function signedRequest(n = 1) {
    const account = testAccount(n), challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
    const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
    return { method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } };
  }
  async function connect(n = 1) {
    const request = await signedRequest(n), account = testAccount(n);
    const response = await api(request);
    if (response.status !== 200) throw new Error(`Sign-in failed: ${JSON.stringify(response.body)}`);
    return { account, request, connected: response, headers: { cookie: response.headers['Set-Cookie']!.split(';')[0]! } };
  }
  // Arrange an external database state until the feast-creation route arrives in ticket 05.
  async function openFeastFixture(burrowId: string, creator: string, status = 'open') {
    const id = '10000000-0000-4000-8000-000000000001';
    await db.batch([{ text: `insert into feasts (id,burrow_id,created_by,kind,title,crumbs_per_critter,gathering_ends_at,scattering_ends_at,aggregate_public,individual_open,status,opened_at)
      values ($1,$2,$3,'people','Fixture',100,$4,$5,false,false,$7,$6)`, values: [id,burrowId,creator.toLowerCase(),new Date(now+1000).toISOString(),new Date(now+2000).toISOString(),status === 'open' ? new Date(now).toISOString() : null,status] }]);
    return id;
  }
  return { api, connect, signedRequest, openFeastFixture, clock: () => now, advance: (ms: number) => { now += ms; }, close: () => db.close() };
}
