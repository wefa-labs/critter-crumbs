import { expect, test } from 'vitest';
import { apiHarness } from './support.js';

test('feast portraits reuse current identities without leaking hidden statements or changing targets', async () => {
  const h = await apiHarness();
  try {
    const { owner, members, path } = await h.createFeast({ open: true });
    await h.api({ method: 'PUT', path: '/api/me', headers: members[0]!.headers, body: { variant: 1 } });
    const member = await h.api({ method: 'GET', path, headers: owner.headers });
    const arrival = await h.api({ method: 'GET', path });
    expect(arrival.body.portraits).toContainEqual({ targetId: (arrival.body.targets as { id: string; ownerAddress: string }[]).find(t => t.ownerAddress === members[0]!.account.address)!.id, variant: 1 });
    expect(arrival.body).not.toHaveProperty('statements');
    expect(arrival.body.targets).toEqual(member.body.targets);
    expect(member.body.burrowName).toBe('Oak');
  } finally { await h.close(); }
});
