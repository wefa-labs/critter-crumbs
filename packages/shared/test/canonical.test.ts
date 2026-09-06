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

test('canonical JSON rejects array accessors without evaluating them', () => {
  let reads = 0;
  const input = Object.defineProperty([], '0', { get: () => ++reads, enumerable: true });
  expect(() => canonicalJSON(input)).toThrow(TypeError);
  expect(reads).toBe(0);
});

test('canonical JSON rejects custom array properties instead of discarding them', () => {
  expect(() => canonicalJSON(Object.assign([1], { note: 'must not disappear' }))).toThrow(TypeError);
});

test('canonical JSON rejects hidden object properties without evaluating getters', () => {
  let reads = 0;
  for (const descriptor of [{ value: undefined }, { value: 42 }, { get: () => ++reads }]) {
    expect(() => canonicalJSON(Object.defineProperty({}, 'hidden', descriptor))).toThrow(TypeError);
  }
  expect(reads).toBe(0);
});
