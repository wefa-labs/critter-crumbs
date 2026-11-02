import { expect, test } from 'vitest';
import { critterLook } from '../src/portraits/look.js';
import { generate2 } from '@critter-crumbs/core';
import { gardenDraw } from '../src/portraits/garden/species.js';
import { CLOVER, FERN, JUNIPER, MOSS, openingVariant } from '../src/app/painted-scene.js';

test('every build draws Garden Spirits unless a page asks for version 1 (decision of 2 November 2026)', () => {
  for (const development of [false, true]) {
    expect(critterLook(development, '')).toBe('garden');
    // links shared while the art was under review keep working
    expect(critterLook(development, '?critters=garden')).toBe('garden');
    expect(critterLook(development, '?critters=1')).toBe('baseline');
    expect(critterLook(development, '?critters=nonsense')).toBe('garden');
  }
  // the October inked drawing stays on the development server only
  expect(critterLook(true, '?critters=2')).toBe('inked');
  expect(critterLook(false, '?critters=2')).toBe('garden');
});

test('the opening screens show one critter of each element under Garden Spirits, and every first drawing elsewhere', () => {
  const cast = [MOSS, CLOVER, JUNIPER, FERN];
  const review = cast.map(address => gardenDraw(generate2(address, openingVariant(address, true))));
  expect(new Set(review.map(draw => draw.species)).size).toBe(4);
  expect(new Set(review.map(draw => draw.element)).size).toBe(4);
  // without the choice, Moss and Juniper would both be lichen moths
  expect(cast.map(address => gardenDraw(generate2(address, 0)).species)).toEqual(['moth', 'koi', 'moth', 'lamb']);
  expect(cast.map(address => openingVariant(address, false))).toEqual([0, 0, 0, 0]);
});
