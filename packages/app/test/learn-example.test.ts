import { expect, test } from 'vitest';
import { LEARN_RESULT, LEARN_RESULT_ROWS } from '../src/app/learn-example.js';

test('the practice feast counts only three complete scatters, and a non-scatterer still receives', () => {
  expect(LEARN_RESULT.totalScattered).toBe(300);
  expect(LEARN_RESULT.counted).toHaveLength(3);
  expect(LEARN_RESULT.rejected).toEqual([]);
  expect(LEARN_RESULT.totals.map(row => row.crumbs)).toEqual([120, 90, 60, 30]);
  expect(LEARN_RESULT.totals.map(row => row.share)).toEqual([[2, 5], [3, 10], [1, 5], [1, 10]]);
  expect(LEARN_RESULT.didNotScatter).toEqual([LEARN_RESULT_ROWS[3]!.address.toLowerCase()]);
});
