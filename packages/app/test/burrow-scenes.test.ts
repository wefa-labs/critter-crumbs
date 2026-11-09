import { describe, expect, it } from 'vitest';
import { ASLEEP_SCENE, BURROW_SHEETS, FRESH_BURROW_SCENE, HOME_SCENE, NEW_BURROW_SCENE, UNKNOWN_BURROW_SCENE, burrowFloor, burrowPainting } from '../src/app/burrow-scenes.js';
import { sheetScreenStyle } from '../src/app/painted-scene.js';

/* Expected values are read off the flow page, never off the app (docs/explorations/app-screens/index.html): SCREENS.home,
   ['home-empty'], ['burrow-new'], ['burrow-fresh'], unknown, burrow, ['burrow-quiet'], ['burrow-join'] and members, and
   row(). The one exception is the burrow's floor for a size the flow page does not draw, which only has to hold. */
const place = ({ x, y, size }: { x: number; y: number; size: number }) => [x, y, size];

describe('your critter on home and before a burrow', () => {
  it('stands at the entrance on home, over a 470 px sheet, and asleep with a z over a 250 px one when there are no burrows', () => {
    expect([HOME_SCENE.painting, place(HOME_SCENE.critter), HOME_SCENE.critter.face, HOME_SCENE.sheetHeight]).toEqual(['entrance', [50, 92, 116], null, 470]);
    expect([ASLEEP_SCENE.painting, place(ASLEEP_SCENE.critter), ASLEEP_SCENE.sheetHeight, place(ASLEEP_SCENE.z)]).toEqual(['entrance', [50, 92, 130], 250, [57, 46, 22]]);
  });

  it('turns to the field when a burrow is started, the add field in a burrow of one, and the address in one that does not know you', () => {
    expect([place(NEW_BURROW_SCENE.critter), NEW_BURROW_SCENE.critter.face, NEW_BURROW_SCENE.sheetHeight]).toEqual([[40, 92, 110], 'right', 330]);
    expect([place(FRESH_BURROW_SCENE.critter), FRESH_BURROW_SCENE.critter.face, FRESH_BURROW_SCENE.sheetHeight]).toEqual([[44, 93, 110], 'right', 540]);
    expect([place(UNKNOWN_BURROW_SCENE.critter), UNKNOWN_BURROW_SCENE.critter.face, UNKNOWN_BURROW_SCENE.sheetHeight]).toEqual([[34, 94, 112], 'right', 330]);
    for (const scene of [NEW_BURROW_SCENE, FRESH_BURROW_SCENE, UNKNOWN_BURROW_SCENE]) expect(scene.painting).toBe('entrance');
  });
});

describe("a burrow's own screens", () => {
  it('give the sheet its height on the 812 px phone: 500 with feasts, 400 before any, 280 to join, 700 for the critters', () => {
    expect(BURROW_SHEETS).toEqual({ feasts: 500, quiet: 400, join: 280, critters: 700 });
    expect(sheetScreenStyle(BURROW_SHEETS.critters)).toEqual({ '--sheet-h': '700px', '--floor-h': 72 });
  });

  it('stand at the entrance until the burrow has had a feast, and in the room after', () => {
    expect([burrowPainting(0), burrowPainting(1), burrowPainting(5)]).toEqual(['entrance', 'window', 'window']);
  });
});

describe("the burrow's critters on its floor", () => {
  const seats = (n: number) => burrowFloor(n).sort((a, b) => a.index - b.index);

  it('stands five in one staggered row across the floor, as row() places a burrow with no feasts yet', () => {
    const five = seats(5);
    expect(five.map(place)).toEqual([[8, 80, 74], [29, 90, 80], [50, 80, 74], [71, 90, 80], [92, 80, 74]]);
    expect(five.map(spot => spot.face)).toEqual(['right', 'right', 'right', 'left', 'left']);
  });

  it("stands eight as the burrow draws them: six in a row bowed toward you, two before it", () => {
    const drawn: [x: number, y: number, size: number][] = [[14, 70, 58], [30, 74, 64], [46, 77, 70], [62, 77, 70], [78, 74, 64], [92, 70, 58], [22, 92, 74], [78, 93, 74]];
    for (const [index, spot] of seats(8).entries()) {
      const [x, y, size] = drawn[index]!;
      expect(Math.abs(spot.x - x)).toBeLessThanOrEqual(2);
      expect(Math.abs(spot.y - y)).toBeLessThanOrEqual(1);
      expect(Math.abs(spot.size - size)).toBeLessThanOrEqual(2);
    }
    expect(seats(8).slice(6).map(spot => spot.face)).toEqual(['right', 'left']);
  });

  it('puts the last of the burrow at the right of the front row, where the burrow puts you', () => {
    const last = (count: number) => burrowFloor(count).find(spot => spot.index === count - 1)!;
    for (const count of [2, 5]) expect(last(count).x).toBe(Math.max(...burrowFloor(count).map(spot => spot.x)));
    for (const count of [6, 8, 12, 49]) expect(last(count).x).toBe(Math.max(...burrowFloor(count).filter(spot => spot.y >= 92).map(spot => spot.x)));
  });

  it('draws from the back of the floor to the front, one spot for each critter, whatever the size of the burrow', () => {
    for (let count = 0; count <= 49; count++) {
      const spots = burrowFloor(count);
      expect(spots.map(spot => spot.index).sort((a, b) => a - b)).toEqual(Array.from({ length: count }, (_, index) => index));
      for (const [index, spot] of spots.entries()) {
        if (index) expect(spot.y).toBeGreaterThanOrEqual(spots[index - 1]!.y);
        expect(spot.x).toBeGreaterThanOrEqual(0);
        expect(spot.x).toBeLessThanOrEqual(100);
      }
    }
  });

  it('shrinks the critters of a burrow larger than the eight the flow page draws, so the floor still holds them', () => {
    const largest = (count: number) => Math.max(...burrowFloor(count).map(spot => spot.size));
    expect(largest(8)).toBe(74);
    expect(largest(12)).toBeLessThan(74);
    expect(largest(49)).toBeLessThan(74 / 2);
  });

  it('stands one critter alone in the middle, facing you', () => {
    expect(burrowFloor(1).map(spot => [spot.x, spot.face])).toEqual([[50, null]]);
  });
});
