import { expect, test } from 'vitest';
import { distribute, fixtureFeast, fixtureOpened, referenceCast } from '../src/dev/game-fixtures.js';

/* The gallery's seed is the scatter page's own (castFor), so a reference-versus-app capture compares like with like. */
test('scattering, eight critters: 88 given and 12 left, nothing to your own critter or to Acorn', () => {
  const cast = referenceCast(8);
  expect(cast.scattering).toEqual([24, 20, 0, 14, 0, 12, 10, 8]);
  expect(cast.scattering.reduce((sum, n) => sum + n, 0)).toBe(88);
});

test('all given, eight critters: every crumb out, Acorn given a little, still nothing to your own critter', () => {
  const cast = referenceCast(8);
  expect(cast.given).toEqual([25, 21, 0, 15, 8, 13, 10, 8]);
  expect(cast.given.reduce((sum, n) => sum + n, 0)).toBe(100);
});

test('without Acorn in the burrow, the last critter that is not yours is the one left out', () => {
  expect(referenceCast(4).zero).toBe(3);
  expect(referenceCast(4).scattering[3]).toBe(0);
});

test('largest remainder always adds up and leaves the weightless at zero', () => {
  expect(distribute([1, 1, 1], 100)).toEqual([34, 33, 33]);
  expect(distribute([0, 0], 10)).toEqual([0, 0]);
  expect(distribute([3, 0, 1], 7)).toEqual([5, 0, 2]);
});

test('the feast opens seven valid scatters through the real tally: Acorn did not scatter, 700 crumbs in all', () => {
  const feast = fixtureFeast(8, 'results'), { result, givers } = fixtureOpened(feast, 'results');
  expect(result.counted).toHaveLength(7);
  expect(result.didNotScatter).toEqual([feast.participants[4]]);
  expect(result.totalScattered).toBe(700);
  for (const giver of givers) {
    expect(giver.amounts.reduce((sum, n) => sum + n, 0)).toBe(100);
    expect(giver.amounts[feast.participants.indexOf(giver.attester)]).toBe(0);
  }
});

test('one scatterer splitting evenly is a tie between the two it gave to; nobody scattering opens nothing', () => {
  const feast = fixtureFeast(8, 'tie'), tie = fixtureOpened(feast, 'tie').result;
  expect(tie.counted.map(entry => entry.attester)).toEqual([feast.participants[1]]);
  expect(tie.ties).toContainEqual([feast.targets[0]!.id, feast.targets[3]!.id]);
  expect(fixtureOpened(fixtureFeast(8, 'nobody'), 'nobody').result.totalScattered).toBe(0);
});
