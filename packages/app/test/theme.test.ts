import { expect, test } from 'vitest';
import { DARK_SETTING_KEY } from '@critter-crumbs/shared';
import { readDarkChoice, saveDarkChoice, showDarkChoice } from '../src/app/theme.js';

const store = (initial: Record<string, string> = {}) => { const data = new Map(Object.entries(initial)); return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } }; };
const root = () => ({ dataset: {} as Record<string, string> }) as unknown as HTMLElement;

test('with nothing chosen the look follows the device: no choice is read and none is written on the page', () => {
  expect(readDarkChoice(store())).toBeNull();
  expect(readDarkChoice(undefined)).toBeNull();
  const page = root(); page.dataset.theme = 'dark';
  showDarkChoice(page, null);
  expect(page.dataset.theme).toBeUndefined();
});

test('a choice is kept and overrides the device either way', () => {
  const storage = store();
  saveDarkChoice(storage, true);
  expect(storage.data.get(DARK_SETTING_KEY)).toBe('1');
  expect(readDarkChoice(storage)).toBe(true);
  saveDarkChoice(storage, false);
  expect(readDarkChoice(storage)).toBe(false);
  const page = root();
  showDarkChoice(page, true); expect(page.dataset.theme).toBe('dark');
  showDarkChoice(page, false); expect(page.dataset.theme).toBe('light');
});

test('an unreadable or unexpected stored value counts as no choice, and storage that refuses a write does not throw', () => {
  expect(readDarkChoice(store({ [DARK_SETTING_KEY]: 'yes' }))).toBeNull();
  expect(readDarkChoice({ getItem: () => { throw new Error('unavailable'); } })).toBeNull();
  expect(() => saveDarkChoice({ setItem: () => { throw new Error('unavailable'); } }, true)).not.toThrow();
});
