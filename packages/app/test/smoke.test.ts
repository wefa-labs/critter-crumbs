import { expect, test } from 'vitest';
import * as app from '@critter-crumbs/app';

test('the app public entry resolves through the workspace', () => {
  expect(Object.keys(app)).toEqual([]);
});
