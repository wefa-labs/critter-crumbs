import { describe, expect, it } from 'vitest';
import { DRAFT_SCENE, ENDED_SCENE, GATHERING_SCENE, gatheringRow, LATE_SCENE, NOWHERE_SCENE, optionsRow, type RowSpot } from '../src/app/feast-place.js';

/* Expected values are read off the flow page, never off the app (docs/explorations/app-screens/index.html): row() as
   gatheringScene() calls it, optionCritters(), and SCREENS.gathering, draft, late, unknown and offline. */
const place = ({ x, y, size }: { x: number; y: number; size: number }) => [x, y, size].map(value => Math.round(value * 10) / 10);
const byIndex = (spots: RowSpot[]) => [...spots].sort((a, b) => a.index - b.index);
const drawnFromTheBack = (spots: RowSpot[]) => spots.every((spot, index) => !index || spot.y >= spots[index - 1]!.y);

describe('gathering for people', () => {
  it('stands eight critters in two staggered rows, the second nearer and larger, the first half turned right', () => {
    const spots = byIndex(gatheringRow(8));
    expect(spots.map(place)).toEqual([[8, 72, 58], [20, 82, 64], [32, 72, 58], [44, 82, 64], [56, 72, 58], [68, 82, 64], [80, 72, 58], [92, 82, 64]]);
    expect(spots.map(spot => spot.face)).toEqual(['right', 'right', 'right', 'right', 'left', 'left', 'left', 'left']);
  });

  it('draws them from the back of the floor to the front, whatever the size of the burrow', () => {
    for (const count of [3, 8, 10, 30]) {
      const spots = gatheringRow(count);
      expect(spots.map(spot => spot.index).sort((a, b) => a - b)).toEqual(Array.from({ length: count }, (_, index) => index));
      expect(drawnFromTheBack(spots)).toBe(true);
    }
  });

  it('shrinks the critters of a burrow larger than the eight the flow page draws, so the row still holds them', () => {
    const largest = (count: number) => Math.max(...gatheringRow(count).map(spot => spot.size));
    expect(largest(8)).toBe(64);
    expect(largest(10)).toBeLessThan(64);
    expect(largest(32)).toBeLessThanOrEqual(32);
  });

  it('leaves the floor over a sheet 560 px tall, as for options', () => {
    expect(GATHERING_SCENE).toEqual({ painting: 'window', sheetHeight: 560 });
  });
});

describe('gathering for options', () => {
  it('stands four options across the front of the floor, alternately set back', () => {
    const spots = byIndex(optionsRow(4));
    expect(spots.map(place)).toEqual([[16, 86, 78], [38.6, 78, 70], [61.2, 86, 78], [83.8, 78, 70]]);
    expect(spots.map(spot => spot.face)).toEqual(['right', 'right', 'left', 'left']);
    expect(drawnFromTheBack(optionsRow(4))).toBe(true);
  });

  it('shrinks more than four options so they still fit across the floor', () => {
    expect(Math.max(...optionsRow(9).map(spot => spot.size))).toBeLessThan(78);
  });
});

describe('the pages around gathering', () => {
  it('stands your critter between two of the feast’s on the draft’s strip of floor, over a sheet 610 px tall', () => {
    expect(DRAFT_SCENE.sheetHeight).toBe(610);
    expect([place(DRAFT_SCENE.viewer), DRAFT_SCENE.viewer.face]).toEqual([[50, 98, 70], null]);
    expect(DRAFT_SCENE.beside.map(spot => [place(spot), spot.face])).toEqual([[[32, 96, 64], 'right'], [[68, 96, 64], 'left']]);
  });

  it('puts someone who joined too late at the edge of the floor, watching, over a sheet 250 px tall', () => {
    expect(LATE_SCENE.sheetHeight).toBe(250);
    expect([place(LATE_SCENE.viewer), LATE_SCENE.viewer.face]).toEqual([[91, 97, 62], 'left']);
  });

  it('stands one critter at the left of the floor where a link leads nowhere, over a sheet 330 px tall', () => {
    expect(NOWHERE_SCENE.sheetHeight).toBe(330);
    expect([place(NOWHERE_SCENE.critter), NOWHERE_SCENE.critter.face]).toEqual([[34, 94, 112], 'right']);
  });

  it('stands a void feast’s one or two critters as the flow page draws those left in such a burrow', () => {
    expect(ENDED_SCENE.sheetHeight).toBe(250);
    expect(ENDED_SCENE.one.map(place)).toEqual([[50, 84, 76]]);
    expect(ENDED_SCENE.two.map(spot => [place(spot), spot.face])).toEqual([[[30, 80, 70], 'right'], [[70, 80, 70], 'left']]);
  });
});
