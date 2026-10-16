import { expect, test } from 'vitest';
import { canReviewGarden } from '../src/portraits/review.js';

test('garden art requires an explicit review choice and an enabled review build', () => {
  expect(canReviewGarden(false, undefined, '?critters=garden')).toBe(false);
  expect(canReviewGarden(false, 'false', '?critters=garden')).toBe(false);
  expect(canReviewGarden(false, 'true', '')).toBe(false);
  expect(canReviewGarden(false, 'true', '?critters=1')).toBe(false);
  expect(canReviewGarden(false, 'true', '?critters=garden')).toBe(true);
  expect(canReviewGarden(true, undefined, '?critters=garden')).toBe(true);
});
