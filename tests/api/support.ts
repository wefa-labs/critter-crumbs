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
export async function apiHarness(options: Partial<Omit<ApiDependencies, 'db' | 'clock'>> = {}) {
  const db = await openTestDatabase(); let now = 1800000000123;
  const api = createApi({ db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173', ...options });
  async function connect(n = 1) {
    const account = testAccount(n), challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
    const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
    const response = await api({ method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } });
    if (response.status !== 200) throw new Error(`Sign-in failed: ${JSON.stringify(response.body)}`);
    return { account, headers: { cookie: response.headers['Set-Cookie']!.split(';')[0]! } };
  }
  return { api, connect, clock: () => now, advance: (ms: number) => { now += ms; }, close: () => db.close() };
}
