import { expect, test } from 'vitest';
import { canReviewGarden } from '../src/portraits/review.js';
import { generate2 } from '@critter-crumbs/core';
import { gardenDraw } from '../src/portraits/garden/species.js';
import { CLOVER, FERN, JUNIPER, MOSS, openingVariant } from '../src/app/painted-scene.js';

test('garden art requires an explicit review choice and an enabled review build', () => {
  expect(canReviewGarden(false, undefined, '?critters=garden')).toBe(false);
  expect(canReviewGarden(false, 'false', '?critters=garden')).toBe(false);
  expect(canReviewGarden(false, 'true', '')).toBe(false);
  expect(canReviewGarden(false, 'true', '?critters=1')).toBe(false);
  expect(canReviewGarden(false, 'true', '?critters=garden')).toBe(true);
  expect(canReviewGarden(true, undefined, '?critters=garden')).toBe(true);
});

test('the opening screens show one critter of each element under the review art, and every first drawing elsewhere', () => {
  const cast = [MOSS, CLOVER, JUNIPER, FERN];
  const review = cast.map(address => gardenDraw(generate2(address, openingVariant(address, true))));
  expect(new Set(review.map(draw => draw.species)).size).toBe(4);
  expect(new Set(review.map(draw => draw.element)).size).toBe(4);
  // without the choice, Moss and Juniper would both be lichen moths
  expect(cast.map(address => gardenDraw(generate2(address, 0)).species)).toEqual(['moth', 'koi', 'moth', 'lamb']);
  expect(cast.map(address => openingVariant(address, false))).toEqual([0, 0, 0, 0]);
});
