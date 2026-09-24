import { parseDevEndpointsEnabled } from '@critter-crumbs/shared';
import { afterEach, expect, test } from 'vitest';
import { apiHarness } from './support.js';
const disposals: (() => Promise<void>)[] = [];
afterEach(async () => { for (const dispose of disposals.splice(0)) await dispose(); });

test('API dev time sets the shared injected clock and release-key uses only the mock adapter', async () => {
  let now = 1800000000000; const released: string[] = [];
  const { api, close } = await apiHarness({ clock: () => now, dev: { enabled: true, production: false, mode: 'mock', setTime: value => { now = value; }, releaseKey: identity => { released.push(identity); } } }); disposals.push(close);
  const changed = await api({ method: 'POST', path: '/api/dev/time', body: { now: 1800000123456 } });
  expect(changed.status).toBe(200); expect(changed.body.serverNow).toBe(1800000123456);
  expect((await api({ method: 'GET', path: '/api/session/nonce' })).body.serverNow).toBe(1800000123456);
  const identity = `0x${'ab'.repeat(32)}`;
  expect((await api({ method: 'POST', path: '/api/dev/release-key', body: { identity } })).status).toBe(200); expect(released).toEqual([identity]);
  expect((await api({ method: 'POST', path: '/api/dev/time', body: { now: -1 } })).status).toBe(400);
  expect((await api({ method: 'POST', path: '/api/dev/release-key', body: { identity: 'bad' } })).status).toBe(400);
});

test.each([undefined, { enabled: false, production: false, mode: 'mock' }, { enabled: true, production: true, mode: 'mock' }, { enabled: true, production: false, mode: 'chiado' }])('API dev controls are hidden when disabled, production or real mode: %j', async config => {
  const { api, close } = await apiHarness(config ? { dev: { ...config, setTime() { throw new Error('Disabled'); }, releaseKey() { throw new Error('Disabled'); } } } : {}); disposals.push(close);
  for (const route of ['seed', 'time', 'release-key']) {
    const response = await api({ method: 'POST', path: `/api/dev/${route}`, body: {} });
    expect(response.status).toBe(404); expect(response.body).toMatchObject({ error: 'err.generic', serverNow: 1800000000123 });
  }
});

test('API dev seed creates eight deterministic critters, both gathering feasts and fixture statements', async () => {
  let now = 1800000000000;
  const { api, close, connect } = await apiHarness({ clock: () => now, dev: { enabled: true, production: false, mode: 'mock', setTime: value => { now = value; }, releaseKey() {} } }); disposals.push(close);
  const seeded = await api({ method: 'POST', path: '/api/dev/seed', body: { phase: 'gathering' } });
  expect(seeded.status).toBe(201);
  expect(seeded.body.accounts).toHaveLength(8);
  const first = await connect(1), eighth = await connect(8);
  expect((seeded.body.accounts as { address: string }[])[0]!.address).toBe(first.account.address);
  const feasts = seeded.body.feasts as { id: string; kind: string; phase: string }[];
  expect(feasts.map(feast => [feast.kind, feast.phase])).toEqual([['people', 'gathering'], ['options', 'gathering']]);
  const people = await api({ method: 'GET', path: `/api/feasts/${feasts[0]!.id}`, headers: eighth.headers });
  expect(people.body.targets).toHaveLength(8);
  expect(people.body.statements).toMatchObject([{ body: 'I welcomed three new neighbours and shared our meeting notes.' }]);
  expect((await api({ method: 'GET', path: `/api/burrows/${seeded.body.burrowId}`, headers: first.headers })).body.members).toHaveLength(8);
});

test.each(['draft', 'scattering', 'feast', 'cancelled', 'void'])('API dev seed reaches %s through ordinary phase rules', async phase => {
  let now = 1800000000000;
  const { api, close } = await apiHarness({ clock: () => now, dev: { enabled: true, production: false, mode: 'mock', setTime: value => { now = value; }, releaseKey() {} } }); disposals.push(close);
  const seeded = await api({ method: 'POST', path: '/api/dev/seed', body: { phase } });
  expect(seeded.status).toBe(201);
  const feasts = seeded.body.feasts as { kind: string; phase: string; participants: string[]; statements: unknown[] }[];
  expect(feasts).toHaveLength(phase === 'void' ? 1 : 2);
  expect(feasts.every(feast => feast.phase === phase)).toBe(true);
  if (['scattering', 'feast'].includes(phase)) {
    expect(feasts.every(feast => feast.participants.length === 8)).toBe(true);
    expect(feasts[0]!.statements).toHaveLength(8); expect(feasts[1]!.statements).toHaveLength(3);
  }
});

test('API dev seed accepts one feast type and rejects coerced phase or kind values', async () => {
  let now = 1800000000000;
  const { api, close } = await apiHarness({ clock: () => now, dev: { enabled: true, production: false, mode: 'mock', setTime: value => { now = value; }, releaseKey() {} } }); disposals.push(close);
  for (const body of [{ phase: ['gathering'] }, { kind: ['people'] }, { phase: 'void', kind: 'options' }]) expect((await api({ method: 'POST', path: '/api/dev/seed', body })).status).toBe(400);
  const seeded = await api({ method: 'POST', path: '/api/dev/seed', body: { phase: 'scattering', kind: 'options' } });
  expect(seeded.status).toBe(201); expect(seeded.body.feasts).toMatchObject([{ kind: 'options', phase: 'scattering' }]); expect(seeded.body.feasts).toHaveLength(1);
});

test.each([['1', 200], ['true', 200], ['0', 404], ['false', 404], [undefined, 404]] as const)('API dev controls parse DEV_ENDPOINTS_ENABLED=%s as status %s', async (enabled, status) => {
  let now = 1800000000000;
  const { api, close } = await apiHarness({ clock: () => now, dev: { enabled: parseDevEndpointsEnabled(enabled), production: false, mode: 'mock', setTime: value => { now = value; }, releaseKey() {} } }); disposals.push(close);
  const response = await api({ method: 'POST', path: '/api/dev/time', body: { now: 1800000001000 } });
  expect(response.status).toBe(status);
});

test.each([
  [{ enabled: true, production: false, mode: 'mock' }, 200],
  [{ enabled: false, production: false, mode: 'mock' }, 404],
  [{ enabled: true, production: true, mode: 'mock' }, 404],
  [{ enabled: true, production: false, mode: 'chiado' }, 404],
] as const)('browser development capability uses the same three gates: %j', async (config, status) => {
  const { api, close } = await apiHarness({ dev: { ...config, setTime() {}, releaseKey() {} } }); disposals.push(close);
  const reply = await api({ method: 'GET', path: '/api/dev/config' });
  expect(reply.status).toBe(status);
  if (status === 200) expect(reply.body).toEqual({ enabled: true, mode: 'mock', production: false, serverNow: 1800000000123 });
  expect((await api({ method: 'GET', path: '/api/dev/time' })).status).toBe(404);
});
