import { expect, test } from 'vitest';
import { canonicalJSON } from '@critter-crumbs/shared';

test('canonical JSON sorts nested keys without changing array order', () => {
  expect(canonicalJSON({ z: [3, { y: true, a: null }], a: 'line\n"' }))
    .toBe('{"a":"line\\n\\\"","z":[3,{"a":null,"y":true}]}');
});

test('canonical JSON rejects ambiguous values instead of silently losing data', () => {
  for (const value of [undefined, NaN, Infinity, 1n, () => 1, Symbol('x'), { x: undefined }, new Date(0), [, 1]]) {
    expect(() => canonicalJSON(value)).toThrow(TypeError);
  }
  const cycle: unknown[] = []; cycle.push(cycle);
  expect(() => canonicalJSON(cycle)).toThrow(TypeError);
  expect(canonicalJSON({ '2': 2, '10': 10 })).toBe('{"10":10,"2":2}');
});
