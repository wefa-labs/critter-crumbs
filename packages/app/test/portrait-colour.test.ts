import { expect, test } from 'vitest';
import { generate } from '@critter-crumbs/core';
import { colour, palette } from '../src/portraits/colour.js';

test('sRGB conversion matches independent neutral and red Oklab vectors', () => {
  expect(colour(0, 0, 0).css).toBe('#000000');
  expect(colour(1, 0, 0).css).toBe('#ffffff');
  expect(colour(0.5, 0, 0).css).toBe('#636363');
  expect(colour(0.62795536, 0.25768331, 29.233885).css).toBe('#ff0000');
});
test('generated identities keep a deterministic in-gamut palette', () => {
  for (let index = 0; index < 100; index++) {
    const params = generate(`0x${index.toString(16).padStart(40, '0')}`, index % 5);
    const paints = palette(params);
    expect(palette(params)).toEqual(paints);
    for (const paint of Object.values(paints)) for (const channel of paint.linear) {
      expect(channel).toBeGreaterThanOrEqual(0); expect(channel).toBeLessThanOrEqual(1);
    }
  }
});
