import { expect, test } from 'vitest';
import type { ApiReply } from '@critter-crumbs/api';
import { routeFileFor, routeFileCheck } from './route-files.js';
import { apiHarness, apiTestTimeout } from './support.js';

const id = '00000000-0000-4000-8000-000000000001';
const answering = (status: number) => async (): Promise<ApiReply> => ({ status, headers: {}, body: {} });

test.each([
  ['/api/me', 'api/me.ts'],
  ['/api/burrows', 'api/burrows/index.ts'],
  [`/api/burrows/${id}`, 'api/burrows/[id]/index.ts'],
  [`/api/burrows/${id}/removals`, 'api/burrows/[id]/removals.ts'],
  [`/api/feasts/${id}/statements/0x${'11'.repeat(32)}`, 'api/feasts/[id]/statements/[targetId].ts'],
  ['/api/dev/config', 'api/dev/config.ts'],
])('Vercel serves %s from %s', (path, file) => {
  expect(routeFileFor(path)).toBe(file);
});

test.each(['/api', '/api/burrows/', `/api/burrows/${id}/removals/again`, `/api/burrows/${id}/unfiled`, '/api/tsconfig', '/api/dev/result-transaction'])('no route file serves %s', path => {
  expect(routeFileFor(path)).toBeUndefined();
});

test('an answer from a path with no route file is reported when the test closes, and a refusal is left to the test', async () => {
  const served = routeFileCheck();
  await served.through(answering(201))({ method: 'POST', path: `/api/burrows/${id}/removals?retry=1` });
  await served.through(answering(404))({ method: 'GET', path: '/api/unfiled' });
  expect(() => served.verify()).not.toThrow();

  const unserved = routeFileCheck(), unfiled = { method: 'POST', path: `/api/burrows/${id}/unfiled` };
  await expect(unserved.through(answering(200))(unfiled)).resolves.toMatchObject({ status: 200 });
  await unserved.through(answering(200))(unfiled);
  expect(() => unserved.verify()).toThrow(`Vercel would answer with a 404 of its own: POST /api/burrows/${id}/unfiled. Add the route file`);
});

test('the rehearsal result fixture is not a route unless recordTransaction is supplied, as only the local API does', async () => {
  const h = await apiHarness({ dev: { enabled: true, production: false, mode: 'mock', setTime() {}, releaseKey() {} } });
  try {
    const { headers } = await h.connect();
    const reply = await h.api({ method: 'POST', path: '/api/dev/result-transaction', headers, body: {} });
    expect(reply.status).toBe(404); expect(reply.body).toMatchObject({ error: 'err.generic' });
  } finally { await h.close(); }
}, apiTestTimeout);
