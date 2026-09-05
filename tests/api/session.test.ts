import { afterEach, expect, test } from 'vitest';
import { createLocalAccount, buildSignInMessage, type SignInChallenge } from '@critter-crumbs/core';
import { createApi } from '../../api/_lib/api.js';
import { openTestDatabase } from './support.js';

const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('API lifecycle signs in locally, creates a burrow, and reads it with the session cookie', async () => {
  const db = await openTestDatabase(); disposals.push(() => db.close());
  const now = 1800000000123;
  const api = createApi({ db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173' });
  const account = createLocalAccount(`0x${'0'.repeat(63)}1`);
  const nonceResponse = await api({ method: 'GET', path: '/api/session/nonce' });
  const challenge = nonceResponse.body;
  const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
  const connected = await api({ method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } });
  expect(connected.status).toBe(200);
  expect(connected.body.serverNow).toBe(now);
  expect(connected.headers['Set-Cookie']).toContain('__Host-cc_session=');
  expect(connected.headers['Set-Cookie']).toContain('Secure; HttpOnly; SameSite=Lax; Path=/');
  const headers = { cookie: connected.headers['Set-Cookie']!.split(';')[0]! };
  const created = await api({ method: 'POST', path: '/api/burrows', headers, body: { name: 'Oak' } });
  expect(created.status).toBe(201);
  const read = await api({ method: 'GET', path: `/api/burrows/${created.body.id}`, headers });
  expect(read.status).toBe(200);
  expect(read.body.name).toBe('Oak');
  expect(read.body.members).toEqual([expect.objectContaining({ address: account.address })]);
  expect((await api({ method: 'GET', path: '/api/me', headers })).body.burrows).toEqual([expect.objectContaining({ name: 'Oak' })]);
});

test('API session nonce is consumed once under concurrent sign-ins', async () => {
  const db = await openTestDatabase(); disposals.push(() => db.close());
  const api = createApi({ db, clock: () => 1800000000000, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173' });
  const account = createLocalAccount(`0x${'0'.repeat(63)}1`);
  const challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
  const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
  const request = { method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } };
  expect((await Promise.all([api(request), api(request)])).map(result => result.status).sort()).toEqual([200, 401]);
});

test('API rejects replay and tampered or expired session cookies', async () => {
  const db = await openTestDatabase(); disposals.push(() => db.close());
  let now = 1800000000000;
  const api = createApi({ db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173' });
  const account = createLocalAccount(`0x${'0'.repeat(63)}1`);
  const challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
  const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
  const request = { method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } };
  const connected = await api(request);
  const cookie = connected.headers['Set-Cookie']!.split(';')[0]!;
  expect((await api({ method: 'GET', path: '/api/me', headers: { cookie: `${cookie}x` } })).status).toBe(401);
  now += 7 * 86400000;
  expect((await api({ method: 'GET', path: '/api/me', headers: { cookie } })).status).toBe(401);
  const late = await api(request);
  expect(late.status).toBe(401);
  expect(late.body.serverNow).toBe(now);
});

test('API rejects an unconsumed nonce at its exact expiry and a signature from another address', async () => {
  const db = await openTestDatabase(); disposals.push(() => db.close());
  let now = 1800000000123;
  const api = createApi({ db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173' });
  const account = createLocalAccount(`0x${'0'.repeat(63)}1`);
  const other = createLocalAccount(`0x${'0'.repeat(63)}2`);
  const challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
  const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
  expect((await api({ method: 'POST', path: '/api/session', body: { address: other.address, nonce: challenge.nonce, signature } })).status).toBe(401);
  now += 600000;
  expect((await api({ method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } })).status).toBe(401);
});

test('API protects burrow reads, rejects cross-origin writes, and clears the host cookie', async () => {
  const db = await openTestDatabase(); disposals.push(() => db.close());
  const now = 1800000000000;
  const api = createApi({ db, clock: () => now, sessionSecret: 'local-session-secret-for-tests-only', origin: 'http://localhost:5173' });
  async function connect(key: string) {
    const account = createLocalAccount(`0x${key.padStart(64, '0')}`);
    const challenge = (await api({ method: 'GET', path: '/api/session/nonce' })).body;
    const signature = await account.signMessage(buildSignInMessage(account.address, challenge as unknown as SignInChallenge));
    const result = await api({ method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } });
    return { cookie: result.headers['Set-Cookie']!.split(';')[0]! };
  }
  const headers = await connect('1'), stranger = await connect('2');
  const created = await api({ method: 'POST', path: '/api/burrows', headers, body: { name: 'Oak' } });
  expect((await api({ method: 'GET', path: `/api/burrows/${created.body.id}` })).status).toBe(401);
  expect((await api({ method: 'GET', path: `/api/burrows/${created.body.id}`, headers: stranger })).status).toBe(403);
  expect((await api({ method: 'POST', path: '/api/burrows', headers: { ...headers, origin: 'https://other.example' }, body: { name: 'Oak' } })).status).toBe(403);
  const deleted = await api({ method: 'DELETE', path: '/api/session', headers });
  expect(deleted.headers['Set-Cookie']).toContain('Max-Age=0; Secure; HttpOnly; SameSite=Lax; Path=/');
  expect(deleted.headers['Clear-Site-Data']).toBe('"cookies"');
  expect(deleted.headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(deleted.headers['Cache-Control']).toBe('no-store');
  expect(deleted.body.serverNow).toBe(now);
});
