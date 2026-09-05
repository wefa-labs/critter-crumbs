import { expect, test } from 'vitest';
import { generate, layout, GEN_VERSION } from '@critter-crumbs/core';
import { generatorFixtures } from './fixtures/generator.js';

test('generator version 1 matches independent fixed-seed parameters and layout', () => {
  expect(GEN_VERSION).toBe('1');
  for (const fixture of generatorFixtures) {
    expect(generate(fixture.input, fixture.variant)).toEqual(fixture.params);
    expect(layout(fixture.params)).toEqual(fixture.layout);
  }
});
