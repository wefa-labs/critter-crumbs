import { expect, test } from 'vitest';
import type { FeastClock } from '@critter-crumbs/shared';
import { deadlineLines } from '../src/app/deadline-lines.js';

const HOUR = 3600000, now = Date.UTC(2026, 9, 16, 12);
const open = (gathering: number, scattering: number): FeastClock => ({ status: 'open', gatheringEndsAt: now + gathering, scatteringEndsAt: now + scattering });

// Design System §8: "Closing soon" (< 6 h) changes the item's text; it is not said a second time beside it (QA copy-08).
test('the next deadline inside six hours reads Closing soon, once, and the later one keeps its name', () => {
  const [gathering, scattering] = deadlineLines(open(HOUR, 2 * HOUR), now);
  expect(gathering).toMatch(/^Closing soon — /);
  expect(gathering).not.toContain('Gathering closes');
  expect(scattering).toMatch(/^Scattering closes /);
  expect(scattering).not.toContain('Closing soon');
});

test('once gathering has closed, scattering is the deadline closing soon', () => {
  const [gathering, scattering] = deadlineLines(open(-HOUR, HOUR), now);
  expect(gathering).toMatch(/^Gathering closed /);
  expect(scattering).toMatch(/^Closing soon — /);
});

test('deadlines more than six hours away keep their own lines', () => {
  expect(deadlineLines(open(7 * HOUR, 30 * HOUR), now).map(line => line.split(' ')[0])).toEqual(['Gathering', 'Scattering']);
});

test('a cancelled or void feast shows no deadlines to count down to', () => {
  for (const status of ['cancelled', 'void'] as const) expect(deadlineLines({ ...open(HOUR, 2 * HOUR), status }, now)).toEqual([]);
});
