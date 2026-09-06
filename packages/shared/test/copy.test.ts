import { expect, test } from 'vitest';
import { copy, formatCopy } from '@critter-crumbs/shared';

test('copy IDs interpolate exact slots and preserve plural wording', () => {
  expect(formatCopy('critter.meet.body', { max: 4 })).toBe("Made from your address. Re-roll up to 4 times, then it's yours.");
  expect(formatCopy('pile.remaining', { n: 1 })).toBe('1 to go');
  expect(formatCopy('results.unreadable', { names: 'A and B' })).toContain('A and B scattered');
  expect(copy['scatter.statement.hide']).toBe('Hide statement');
  expect(copy['phase.scattering']).toBe('Scattering');
});

test('copy uses singular forms when the interpolated count is one', () => {
  expect(formatCopy('arrive.burrow', { burrowName: 'Oak', n: 1 })).toBe('Oak · 1 critter');
  expect(formatCopy('arrive.burrow', { burrowName: 'Oak', n: 2 })).toBe('Oak · 2 critters');
  expect(formatCopy('reveal.announce', { n: 1 })).toBe('Statements are open. 1 statement to read.');
});
