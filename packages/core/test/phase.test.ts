import { expect, test } from 'vitest';
import { phaseAt } from '@critter-crumbs/core';

test('phaseAt uses injected time at exact deadlines and honors terminal status', () => {
  const feast = { status: 'open' as const, gatheringEndsAt: 1000, scatteringEndsAt: 2000 };
  expect([999, 1000, 1999, 2000].map(now => phaseAt(feast, now)))
    .toEqual(['gathering', 'scattering', 'scattering', 'feast']);
  for (const status of ['draft', 'cancelled', 'void'] as const) {
    expect(phaseAt({ ...feast, status }, 3000)).toBe(status);
  }
});

test('phaseAt rejects an invalid clock instead of claiming the feast has opened', () => {
  const feast = { status: 'open' as const, gatheringEndsAt: 1000, scatteringEndsAt: 2000 };
  expect(() => phaseAt(feast, NaN)).toThrow(RangeError);
  expect(() => phaseAt({ ...feast, scatteringEndsAt: 500 }, 0)).toThrow(RangeError);
});
