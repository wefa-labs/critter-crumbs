import { expect, test } from 'vitest';
import * as shared from '@critter-crumbs/shared';

test('the shared public entry resolves through the workspace', () => {
  expect(Object.keys(shared)).toEqual([]);
});
