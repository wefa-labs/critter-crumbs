import { describe, expect, it } from 'vitest';
import type { Target } from '@critter-crumbs/shared';
import { scatterSummary } from '../src/game/sheets.js';

const target = (name: string, position: number, ownerAddress: string | null = null) =>
  ({ id: `0x${String(position + 1).padStart(64, '0')}`, ownerAddress, name, position, kind: 'person' }) as Target;
const burrow = [target('Moss', 0), target('Fern', 1), target('Juniper', 2), target('Clover', 3)];

/* QA accessibility-03: the confirmation says what is being scattered, and is described by it (Design System §12.6). */
describe('what the confirmation says it scatters', () => {
  it('names what each critter is given, in the burrow’s order, leaving out those given nothing', () => {
    expect(scatterSummary(burrow, [24, 20, 0, 56])).toBe('Your crumbs: 24 to Moss, 20 to Fern and 56 to Clover.');
    expect(scatterSummary(burrow, [1, 0, 0, 99])).toBe('Your crumbs: 1 to Moss and 99 to Clover.');
    expect(scatterSummary(burrow, [0, 100, 0, 0])).toBe('Your crumbs: 100 to Fern.');
  });
  it('names a critter whose name is only its address by the short form, as every list does', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(scatterSummary([target(address, 0, address), target('Fern', 1)], [60, 40])).toBe('Your crumbs: 60 to 0x1234…5678 and 40 to Fern.');
  });
});
