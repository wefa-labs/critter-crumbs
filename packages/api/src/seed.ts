import { readFile } from 'node:fs/promises';
import { buildSignInMessage, createLocalAccount, personTargetId, type SignInChallenge } from '@critter-crumbs/core';
import { record, type Feast } from '@critter-crumbs/shared';
import type { ApiReply, ApiRequest } from './api.js';
import { HttpError } from './errors.js';
/** Public test keys only. Seeding exercises ordinary handlers and never inserts allocations. */
export async function seedFixtures(api: (request: ApiRequest) => Promise<ApiReply>, clock: () => number, input: unknown, setTime?: (now: number) => void | Promise<void>) {
  const options = record(input ?? {}), phase = options.phase ?? 'gathering';
  const kind = options.kind ?? 'both';
  if (typeof phase !== 'string' || typeof kind !== 'string' || !['draft', 'gathering', 'scattering', 'feast', 'cancelled', 'void'].includes(String(phase)) || !['both', 'people', 'options'].includes(String(kind)) || (phase === 'void' && kind === 'options')) throw new HttpError(400, 'err.generic');
  if (['scattering', 'feast', 'void'].includes(String(phase)) && !setTime) throw new HttpError(400, 'err.generic');
  const fixtures = JSON.parse(await readFile('fixtures/statements.json', 'utf8')) as { name: string; body: string }[];
  async function call(request: ApiRequest) {
    const response = await api(request);
    if (response.status >= 400) throw new HttpError(response.status, 'err.generic');
    return response;
  }
  const accounts = [];
  for (let index = 1; index <= 8; index++) {
    const account = createLocalAccount(`0x${index.toString(16).padStart(64, '0')}`), fixture = fixtures[index - 1]!;
    const challenge = (await call({ method: 'GET', path: '/api/session/nonce' })).body as unknown as SignInChallenge;
    const signature = await account.signMessage(buildSignInMessage(account.address, challenge));
    const signed = await call({ method: 'POST', path: '/api/session', body: { address: account.address, nonce: challenge.nonce, signature } });
    const headers = { cookie: signed.headers['Set-Cookie']!.split(';')[0]! };
    await call({ method: 'PUT', path: '/api/me', headers, body: { displayName: fixture.name } });
    accounts.push({ index, account, headers, fixture });
  }
  const owner = accounts[0]!, headers = owner.headers;
  const burrowId = String((await call({ method: 'POST', path: '/api/burrows', headers, body: { name: 'Rehearsal burrow' } })).body.id);
  for (const member of accounts.slice(1)) {
    await call({ method: 'POST', path: `/api/burrows/${burrowId}/members`, headers, body: { address: member.account.address } });
    await call({ method: 'POST', path: `/api/burrows/${burrowId}/join`, headers: member.headers });
  }
  const now = clock(), paths: string[] = [], feasts: Feast[] = [];
  const kinds = kind === 'people' || phase === 'void' ? ['people'] : kind === 'options' ? ['options'] : ['people', 'options'];
  for (const kind of kinds) {
    const created = await call({ method: 'POST', path: `/api/burrows/${burrowId}/feasts`, headers, body: {
      kind, title: kind === 'people' ? 'Our shared work' : 'Our next projects', crumbsPerCritter: 100,
      gatheringEndsAt: now + 3600000, scatteringEndsAt: now + 7200000, aggregatePublic: false, individualOpen: false,
      options: [{ name: 'Community garden', statement: fixtures[0]!.body }, { name: 'Shared library', statement: fixtures[1]!.body }, { name: 'Repair workshop', statement: fixtures[5]!.body }],
    } });
    const path = `/api/feasts/${created.body.id}`;
    paths.push(path);
    if (phase !== 'draft') {
      await call({ method: 'POST', path: `${path}/open`, headers });
      if (kind === 'people') for (const member of accounts) await call({ method: 'PUT', path: `${path}/statements/${personTargetId(member.account.address)}`, headers: member.headers, body: { body: member.fixture.body } });
      if (phase === 'cancelled') await call({ method: 'POST', path: `${path}/cancel`, headers });
    }
  }
  if (phase === 'void') for (const member of accounts.slice(2)) await call({ method: 'POST', path: `/api/burrows/${burrowId}/leave`, headers: member.headers });
  if (['scattering', 'feast', 'void'].includes(String(phase))) await setTime!(now + (phase === 'feast' ? 7200000 : 3600000));
  for (const path of paths) feasts.push((await call({ method: 'GET', path, headers })).body as unknown as Feast);
  return { burrowId, accounts: accounts.map(({ index, account, fixture }) => ({ index, address: account.address, name: fixture.name })), feasts };
}
