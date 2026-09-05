import { readFileSync } from 'node:fs';
import { createChiadoTimelock, createMainnetTimelock } from '@critter-crumbs/core';
import { expect, test } from 'vitest';
import { registrationFixture } from './shutter-registration-support.js';
const feastId = '00000000-0000-4000-8000-000000000001';
test('timelock registration opens only with finalized registry, original eon key and matching publication evidence', async () => {
  const fixture = registrationFixture();
  const timelock = createChiadoTimelock({ fetch: fixture.fetch, server: fixture.server });
  expect(await timelock.register(feastId, fixture.deadline, fixture.prefix)).toEqual(fixture.expected);
  expect(fixture.posts).toHaveLength(1);
  expect(fixture.posts[0]!.body).toEqual({ decryptionTimestamp: 1788644707, identityPrefix: fixture.prefix });
  expect(fixture.posts[0]!.headers.get('Authorization')).toBe('Bearer fixture-server-key');
});

test('timelock registration recovers a lost POST response after restart without repeating the registration', async () => {
  const fixture = registrationFixture();
  const failing: typeof fetch = async (url, init) => { const response = await fixture.fetch(url, init); if (String(url).endsWith('/register_identity')) throw new Error('Response lost'); return response; };
  await expect(createChiadoTimelock({ fetch: failing, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'upstream' });
  const restarted = createChiadoTimelock({ fetch: fixture.fetch, server: fixture.server });
  expect(await restarted.register(feastId, fixture.deadline, fixture.prefix)).toEqual(fixture.expected);
  expect(fixture.posts).toHaveLength(1);
});

test('timelock registration rejects changed deadline or prefix when resuming a saved attempt', async () => {
  const fixture = registrationFixture(), timelock = createChiadoTimelock({ fetch: fixture.fetch, server: fixture.server });
  await timelock.register(feastId, fixture.deadline, fixture.prefix);
  await expect(timelock.register(feastId, fixture.deadline + 2000, fixture.prefix)).rejects.toMatchObject({ reason: 'configuration' });
  await expect(timelock.register(feastId, fixture.deadline, `0x${'ff'.repeat(32)}`)).rejects.toMatchObject({ reason: 'configuration' });
  expect(fixture.posts).toHaveLength(1);
});

test('timelock registration bounds log recovery to ten-thousand-block pages', async () => {
  const fixture = registrationFixture(); let pages = 0;
  const fetch: typeof globalThis.fetch = async (url, init) => {
    if (String(url).startsWith(fixture.server.rpcUrl)) {
      const request = JSON.parse(String(init?.body)) as { id: number; method: string; params: { fromBlock: string; toBlock: string }[] };
      if (request.method === 'eth_blockNumber') return Response.json({ jsonrpc: '2.0', id: request.id, result: '0x1' });
      if (request.method === 'eth_getLogs') {
        const range = request.params[0]!;
        expect(BigInt(range.toBlock) - BigInt(range.fromBlock)).toBeLessThan(10000n);
        pages++;
        return Response.json({ jsonrpc: '2.0', id: request.id, result: [] });
      }
    }
    return fixture.fetch(url, init);
  };
  await expect(createChiadoTimelock({ fetch, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'pending' });
  expect(pages).toBe(3);
});

test('timelock registration never repeats an uncertain request while the identity remains absent', async () => {
  const fixture = registrationFixture(); let submissions = 0;
  const lost: typeof fetch = async (url, init) => { if (String(url).endsWith('/register_identity')) { submissions++; throw new Error('Unknown submission outcome'); } return fixture.fetch(url, init); };
  await expect(createChiadoTimelock({ fetch: lost, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'upstream' });
  await expect(createChiadoTimelock({ fetch: lost, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'pending' });
  expect(submissions).toBe(1);
});

test('timelock registration rejects a submitted key that disagrees with the finalized original eon key', async () => {
  const fixture = registrationFixture();
  const fetch: typeof globalThis.fetch = async (url, init) => {
    const response = await fixture.fetch(url, init);
    if (!String(url).endsWith('/register_identity')) return response;
    const body = await response.json() as { message: { eon_key: string } }; body.message.eon_key = `0x${'ff'.repeat(96)}`;
    return Response.json(body);
  };
  await expect(createChiadoTimelock({ fetch, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'configuration' });
});

test('timelock registration requires the configured RPC chain before any registration POST', async () => {
  const fixture = registrationFixture();
  const fetch: typeof globalThis.fetch = async (url, init) => {
    if (String(url).startsWith(fixture.server.rpcUrl)) {
      const request = JSON.parse(String(init?.body)) as { id: number; method: string };
      if (request.method === 'eth_chainId') return Response.json({ jsonrpc: '2.0', id: request.id, result: '0x64' });
    }
    return fixture.fetch(url, init);
  };
  await expect(createChiadoTimelock({ fetch, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'configuration' });
  expect(fixture.posts).toHaveLength(0);
});

test('timelock registration resumes against its persisted deployment after configuration changes', async () => {
  const fixture = registrationFixture({ pending: true });
  await expect(createChiadoTimelock({ fetch: fixture.fetch, server: fixture.server }).register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'pending' });
  fixture.confirm();
  const fetch: typeof globalThis.fetch = async (url, init) => {
    if (String(url).includes('/get_data_for_encryption')) throw new Error('Current eon must not replace original metadata');
    if (String(url).startsWith(fixture.server.rpcUrl)) {
      const request = JSON.parse(String(init?.body)) as { method: string; params: { to?: string; address?: string }[] };
      if (request.method === 'eth_call') expect([fixture.server.registry.toLowerCase(), fixture.server.keyBroadcast.toLowerCase()]).toContain(request.params[0]!.to?.toLowerCase());
      if (request.method === 'eth_getLogs') expect(request.params[0]!.address?.toLowerCase()).toBe(fixture.server.registry.toLowerCase());
    }
    return fixture.fetch(url, init);
  };
  const restarted = createChiadoTimelock({ fetch, server: { ...fixture.server, registry: `0x${'ff'.repeat(20)}`, keyBroadcast: `0x${'ee'.repeat(20)}` } });
  expect(await restarted.register(feastId, fixture.deadline, fixture.prefix)).toEqual(fixture.expected);
  expect(fixture.posts).toHaveLength(1);
});

test('timelock server key reads use the configured bearer key without browser credentials', async () => {
  const fixture = registrationFixture();
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    expect(init?.credentials).toBe('omit');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer fixture-server-key');
    return Response.json({ description: 'timestamp not reached yet, decryption key requested too early', statusCode: 400 }, { status: 400 });
  };
  expect(await createChiadoTimelock({ fetch, server: fixture.server }).getKey(fixture.expected.identity)).toBeNull();
});

test('timelock mainnet fails closed on the recorded deployment-key mismatch', async () => {
  const fixture = registrationFixture();
  const api = JSON.parse(readFileSync(new URL('./fixtures/shutter-api.json', import.meta.url), 'utf8')).mainnet;
  const rpc = JSON.parse(readFileSync(new URL('./fixtures/shutter-mainnet-keys.json', import.meta.url), 'utf8'));
  let posts = 0;
  const fetch: typeof globalThis.fetch = async (url, init) => {
    if (String(url).includes('/get_data_for_encryption')) return Response.json(api);
    if (String(url).endsWith('/register_identity')) { posts++; throw new Error('Mismatched deployment must not register'); }
    const request = JSON.parse(String(init?.body)) as { id: number; method: string };
    return Response.json({ jsonrpc: '2.0', id: request.id, result: request.method === 'eth_chainId' ? '0x64' : rpc.responses[1].result });
  };
  const adapter = createMainnetTimelock({ fetch, server: { ...fixture.server, registry: '0x6dB13B149C29A6488AeC991673F04193603640aa', keyBroadcast: '0x70bD6A075e8664c9c7Cd15d29Ac6C35dA7D0e41b', registrant: '0x228DefCF37Da29475F0EE2B9E4dfAeDc3b0746bc' } });
  await expect(adapter.register(feastId, fixture.deadline, api.message.identity_prefix)).rejects.toMatchObject({ reason: 'configuration' });
  expect(posts).toBe(0);
});

test('timelock registration retries a completed empty log search when historical evidence becomes available', async () => {
  const fixture = registrationFixture(); let logsAvailable = false;
  const fetch: typeof globalThis.fetch = async (url, init) => {
    if (String(url).startsWith(fixture.server.rpcUrl)) {
      const request = JSON.parse(String(init?.body)) as { id: number; method: string };
      if (request.method === 'eth_getLogs' && !logsAvailable) return Response.json({ jsonrpc: '2.0', id: request.id, result: [] });
    }
    return fixture.fetch(url, init);
  };
  const adapter = createChiadoTimelock({ fetch, server: fixture.server });
  await expect(adapter.register(feastId, fixture.deadline, fixture.prefix)).rejects.toMatchObject({ reason: 'pending' });
  logsAvailable = true;
  expect(await adapter.register(feastId, fixture.deadline, fixture.prefix)).toEqual(fixture.expected);
  expect(fixture.posts).toHaveLength(1);
});
