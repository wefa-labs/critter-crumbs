import { expect, test } from 'vitest';
import * as core from '@critter-crumbs/core';

test('the core public entry resolves through the workspace', () => {
  expect(Object.keys(core)).toEqual([]);
});
