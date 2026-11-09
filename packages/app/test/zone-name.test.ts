import { expect, test } from 'vitest';
import { zoneName } from '../src/app/time.js';

const october = Date.UTC(2026, 9, 4, 12), november = Date.UTC(2026, 10, 4, 12);

// The flow page's setup form: "Everyone sees these in their own time zone. Yours is Pacific Time (PDT)."
test('names the viewer’s time zone and its short form at the given moment, as the setup form says it', () => {
  expect(zoneName(october, { locale: 'en-US', timeZone: 'America/Los_Angeles' })).toBe('Pacific Time (PDT)');
  expect(zoneName(november, { locale: 'en-US', timeZone: 'America/Los_Angeles' })).toBe('Pacific Time (PST)');
  expect(zoneName(november, { locale: 'en-US', timeZone: 'Europe/Berlin' })).toBe('Central European Time (GMT+1)');
});

test('says the short form alone for a zone whose only name is its offset', () => {
  expect(zoneName(november, { locale: 'en-US', timeZone: 'UTC' })).toBe('UTC');
  expect(zoneName(november, { locale: 'en-US', timeZone: 'Etc/GMT-3' })).toBe('GMT+3');
});
