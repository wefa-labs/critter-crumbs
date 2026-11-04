import { describe, expect, it } from 'vitest';
import { MAX_NAME_LENGTH, parseProfileUpdate } from '@critter-crumbs/shared';
import { fitName, nameFits } from '../src/app/name-field.js';

/* Names are 16 characters, counted as the server counts them (decision D10 of the November UI audit). */
describe('a name field', () => {
  it('stops a typed or pasted name at 16 code points', () => {
    expect(MAX_NAME_LENGTH).toBe(16);
    expect(fitName('Bartholomew Brambleworth', '')).toBe('Bartholomew Bram');
    expect(fitName('🦊'.repeat(20), '')).toBe('🦊'.repeat(16));
    expect(fitName('Juniper', 'Junipe')).toBe('Juniper');
  });

  it('lets a longer name saved before the limit be shortened, never lengthened', () => {
    const saved = 'Hazel Montgomery-Smythe';
    expect(fitName(saved.slice(0, -1), saved)).toBe(saved.slice(0, -1));
    expect(fitName(`${saved}!`, saved)).toBe(saved);
  });

  it('saves only what the server takes: something besides spaces, up to 16 once trimmed', () => {
    for (const name of ['Juniper', ` ${'a'.repeat(16)} `, '🦊'.repeat(16)]) {
      expect(nameFits(name)).toBe(true);
      expect(() => parseProfileUpdate({ displayName: name })).not.toThrow();
    }
    for (const name of ['', '   ', 'a'.repeat(17), '🦊'.repeat(17)]) {
      expect(nameFits(name)).toBe(false);
      expect(() => parseProfileUpdate({ displayName: name })).toThrow('name.limit');
    }
  });
});
