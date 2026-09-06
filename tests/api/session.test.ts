import { afterEach, expect, test } from 'vitest';
import { createLocalAccount } from '@critter-crumbs/core';
import { apiHarness } from './support.js';

const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });
async function setup() {
  const harness = await apiHarness(); disposals.push(harness.close); return harness;
}
test('API lifecycle signs in locally, creates a burrow, and reads it with the session cookie', async () => {
  const { api, connect } = await setup(); const { headers, connected, request } = await connect();
  expect(connected.body.serverNow).toBe(1800000000123);
  expect(connected.headers['Set-Cookie']).toContain('__Host-cc_session=');
  expect(connected.headers['Set-Cookie']).toContain('Secure; HttpOnly; SameSite=Lax; Path=/');
  const created = await api({ method: 'POST', path: '/api/burrows', headers, body: { name: 'Oak' } });
  expect(created.status).toBe(201);
  const read = await api({ method: 'GET', path: `/api/burrows/${created.body.id}`, headers });
  expect(read.status).toBe(200);
  expect(read.body.name).toBe('Oak');
  expect(read.body.members).toEqual([expect.objectContaining({ address: request.body.address })]);
  expect((await api({ method: 'GET', path: '/api/me', headers })).body.burrows).toEqual([expect.objectContaining({ name: 'Oak' })]);
});
test('API session nonce is consumed once under concurrent sign-ins', async () => {
  const { api, signedRequest } = await setup(); const request = await signedRequest();
  expect((await Promise.all([api(request), api(request)])).map(result => result.status).sort()).toEqual([200, 401]);
});
test('API rejects a replayed nonce', async () => {
  const { api, connect } = await setup(); const { request } = await connect();
  expect((await api(request)).status).toBe(401);
});
test('API rejects a tampered session cookie', async () => {
  const { api, connect } = await setup(); const { headers } = await connect();
  expect((await api({ method: 'GET', path: '/api/me', headers: { cookie: `${headers.cookie}x` } })).status).toBe(401);
});
test('API rejects a session cookie at its exact expiry', async () => {
  const { api, connect, advance } = await setup(); const { headers } = await connect(); advance(7 * 86400000);
  expect((await api({ method: 'GET', path: '/api/me', headers })).status).toBe(401);
});
test('API rejects an unconsumed nonce at its exact expiry', async () => {
  const { api, signedRequest, advance } = await setup(); const request = await signedRequest(); advance(600000);
  expect((await api(request)).status).toBe(401);
});
test('API rejects a signature from another address', async () => {
  const { api, signedRequest } = await setup(); const request = await signedRequest();
  request.body.address = createLocalAccount(`0x${'2'.padStart(64, '0')}`).address;
  expect((await api(request)).status).toBe(401);
});
test.each([['no session', false, 401], ['nonmember session', true, 403]] as const)('API protects burrow reads with %s', async (_, hasSession, status) => {
  const { api, connect } = await setup(); const { headers } = await connect();
  const created = await api({ method: 'POST', path: '/api/burrows', headers, body: { name: 'Oak' } });
  const incoming = hasSession ? (await connect(2)).headers : {};
  expect((await api({ method: 'GET', path: `/api/burrows/${created.body.id}`, headers: incoming })).status).toBe(status);
});
test('API rejects cross-origin writes', async () => {
  const { api, connect } = await setup(); const { headers } = await connect();
  expect((await api({ method: 'POST', path: '/api/burrows', headers: { ...headers, origin: 'https://other.example' }, body: { name: 'Oak' } })).status).toBe(403);
});
test('API deletion clears the host cookie and returns security headers', async () => {
  const { api, connect } = await setup(); const { headers } = await connect();
  const deleted = await api({ method: 'DELETE', path: '/api/session', headers });
  expect(deleted.headers['Set-Cookie']).toContain('Max-Age=0; Secure; HttpOnly; SameSite=Lax; Path=/');
  expect(deleted.headers['Clear-Site-Data']).toBe('"cookies"');
  expect(deleted.headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(deleted.headers['Cache-Control']).toBe('no-store');
  expect(deleted.body.serverNow).toBe(1800000000123);
});
