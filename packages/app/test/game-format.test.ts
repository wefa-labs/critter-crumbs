import { expect, test } from 'vitest';
import { absoluteDeadline, closingLine, joinNames } from '../src/app/time.js';

/* The review pages' words for the scattering deadline: "Scattering closes in 2 days · Wed 7 Oct, 18:00 (PDT)". */
const closes = Date.UTC(2026, 9, 8, 1);

test('a deadline reads as Design System §8 writes it, in the viewer’s zone and on a 24-hour clock', () => {
  expect(absoluteDeadline(closes, { locale: 'en-US', timeZone: 'America/Los_Angeles' })).toBe('Wed 7 Oct, 18:00 (PDT)');
  expect(absoluteDeadline(closes, { locale: 'en-GB', timeZone: 'Europe/London' })).toBe('Thu 8 Oct, 02:00 (BST)');
});

test('the closing line counts down from trusted time, a minute at a time', () => {
  expect(closingLine(closes, closes - 2 * 86400000)).toBe('Scattering closes in 2 days');
  expect(closingLine(closes, closes - 3 * 3600000 - 59000)).toBe('Scattering closes in 3 hours');
});

test('names join as the review pages write them, without a serial comma', () => {
  expect(joinNames(['Acorn'])).toBe('Acorn');
  expect(joinNames(['Moss', 'Clover'])).toBe('Moss and Clover');
  expect(joinNames(['Acorn', 'Pebble', 'Willow'])).toBe('Acorn, Pebble and Willow');
});
