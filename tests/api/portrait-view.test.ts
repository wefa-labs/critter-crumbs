import { expect, test } from 'vitest';
import { apiHarness } from './support.js';

test('feast portraits reuse current identities without leaking hidden statements or changing targets', async () => {
  const h = await apiHarness();
  try {
    const { owner, members, path } = await h.createFeast({ open: true });
    await h.api({ method: 'PUT', path: '/api/me', headers: members[0]!.headers, body: { variant: 1 } });
    const member = await h.api({ method: 'GET', path, headers: owner.headers });
    const arrival = await h.api({ method: 'GET', path });
    expect(arrival.body.portraits).toContainEqual(expect.objectContaining({ targetId: (arrival.body.targets as { id: string; ownerAddress: string }[]).find(t => t.ownerAddress === members[0]!.account.address)!.id, variant: 1, generatorVersion: '1', rendererVersion: '1' }));
    expect(arrival.body).not.toHaveProperty('statements');
    expect(arrival.body.targets).toEqual(member.body.targets);
    expect(member.body.burrowName).toBe('Oak');
  } finally { await h.close(); }
});

test('feast appearance freezes with participants and survives later profile changes and reconnects', async () => {
  const h = await apiHarness();
  try {
    const { owner, members, path } = await h.createFeast({ open: true });
    const member = members[0]!;
    await h.api({ method: 'PUT', path: '/api/me', headers: member.headers, body: { variant: 1 } });
    const gathering = await h.api({ method: 'GET', path, headers: owner.headers });
    const targetId = (gathering.body.targets as { id: string; ownerAddress: string }[]).find(t => t.ownerAddress === member.account.address)!.id;
    expect(gathering.body.portraits).toContainEqual({ targetId, generatorVersion: '1', rendererVersion: '1', variant: 1, source: 'profile', capturedAt: null });
    h.advance(1000);
    const [frozen, concurrent] = await Promise.all([
      h.api({ method: 'GET', path, headers: owner.headers }),
      h.anotherApi()({ method: 'GET', path }),
    ]);
    expect(concurrent.body.portraits).toEqual(frozen.body.portraits);
    expect(frozen.body.portraits).toContainEqual({ targetId, generatorVersion: '1', rendererVersion: '1', variant: 1, source: 'freeze', capturedAt: h.clock() });
    await h.api({ method: 'PUT', path: '/api/me', headers: member.headers, body: { variant: 2 } });
    h.advance(1000);
    const arrival = await h.anotherApi()({ method: 'GET', path });
    expect(arrival.body.portraits).toEqual(frozen.body.portraits);
    expect(arrival.body.targets).toEqual(frozen.body.targets);
    expect(arrival.body).not.toHaveProperty('statements');
    expect((await h.api({ method: 'GET', path: '/api/me', headers: member.headers })).body.variant).toBe(2);
  } finally { await h.close(); }
});

test('option appearances are stored at creation and do not follow the creator profile', async () => {
  const h = await apiHarness();
  try {
    const { owner, path, created } = await h.createFeast({ kind: 'options', open: true });
    const portraits = created.body.portraits as { targetId: string }[];
    expect(portraits).toHaveLength(2);
    for (const portrait of portraits) expect(portrait).toMatchObject({ generatorVersion: '1', rendererVersion: '1', variant: 0, source: 'creation', capturedAt: h.clock() });
    await h.api({ method: 'PUT', path: '/api/me', headers: owner.headers, body: { variant: 1 } });
    h.advance(2000);
    const member = await h.api({ method: 'GET', path, headers: owner.headers });
    const arrival = await h.api({ method: 'GET', path });
    expect(member.body.portraits).toEqual(portraits);
    expect(arrival.body.portraits).toEqual(portraits);
  } finally { await h.close(); }
});
