import { describe, expect, it } from 'vitest';
import { sceneCircle } from '../src/app/invite-circle.js';
import { LEARN_SHEET_HEIGHT, LEARN_STEPS } from '../src/app/learn-steps.js';
import { INVITE_SCENE, LAUNCHER_SCENE, sheetScreenStyle } from '../src/app/painted-scene.js';

/* Expected values are read off the flow page, never off the app (docs/explorations/app-screens/index.html):
   launcherScene(), circle(), and SCREENS.invite, ['learn-handful'], ['learn-tap'] and ['learn-private']. */
const place = ({ x, y, size }: { x: number; y: number; size: number }) => [x, y, size];

describe('the launcher', () => {
  it('stands four critters around a heap of ten crumbs on the phone, the outer two asleep', () => {
    expect(LAUNCHER_SCENE.painting).toBe('window');
    expect(LAUNCHER_SCENE.critters.map(place)).toEqual([[26, 90, 88], [41, 94, 98], [61, 93, 100], [77, 89, 84]]);
    expect(LAUNCHER_SCENE.critters.map(critter => critter.asleep)).toEqual([true, false, false, true]);
    expect(LAUNCHER_SCENE.critters.map(critter => critter.face)).toEqual(['right', null, 'left', 'left']);
    expect([place(LAUNCHER_SCENE.heap), LAUNCHER_SCENE.heap.crumbs]).toEqual([[51, 95, 70], 10]);
  });

  it('gathers them either side of the 420 px card on desktop, where the 1280 px frame draws them at 12, 24, 76 and 88 percent', () => {
    const across = LAUNCHER_SCENE.critters.map(critter => 640 + critter.side * (210 + critter.beside));
    for (const [index, percent] of [12, 24, 76, 88].entries()) expect(Math.abs(across[index]! - percent * 12.8)).toBeLessThan(1.5);
  });

  it('keeps the whole heap clear of the card on desktop, where the frame hides half of it', () => {
    const heap = LAUNCHER_SCENE.heap, centre = 640 + heap.side * (210 + heap.beside), halfWidth = heap.size * 1.5 / 2;
    expect(centre + halfWidth).toBeLessThanOrEqual(640 - 210);
  });
});

describe('arriving by a link', () => {
  it('rings eight critters as the frame does: the first at the front, smaller at the back, each turned to the middle', () => {
    const spots = sceneCircle(8), at = (index: number) => spots.find(spot => spot.index === index)!;
    const rounded = (index: number) => place(at(index)).map(value => Math.round(value * 10) / 10);
    expect(rounded(0)).toEqual([50, 86, 98]);
    expect(rounded(2)).toEqual([86, 67, 82]);
    expect(rounded(4)).toEqual([50, 48, 66]);
    expect(rounded(6)).toEqual([14, 67, 82]);
    expect([at(0).face, at(2).face, at(4).face, at(6).face]).toEqual([null, 'left', null, 'right']);
  });

  it('draws from the back of the floor to the front, whatever the size of the burrow', () => {
    for (const count of [3, 8, 10, 49]) {
      const spots = sceneCircle(count);
      expect(spots.map(spot => spot.index).sort((a, b) => a - b)).toEqual(Array.from({ length: count }, (_, index) => index));
      for (const [index, spot] of spots.entries()) if (index) expect(spot.y).toBeGreaterThanOrEqual(spots[index - 1]!.y);
    }
  });

  it('shrinks the critters of a burrow larger than the eight the frame draws, so the ring still holds them', () => {
    const largest = (count: number) => Math.max(...sceneCircle(count).map(spot => spot.size));
    expect(largest(3)).toBeLessThanOrEqual(98);
    expect(largest(10)).toBeLessThan(98);
    expect(largest(49)).toBeLessThan(98 / 2);
  });

  it('leaves the floor 372 px over a 400 px sheet on the 812 px phone', () => {
    expect(INVITE_SCENE).toEqual({ painting: 'window', sheetHeight: 400 });
    expect(sheetScreenStyle(INVITE_SCENE.sheetHeight)).toEqual({ '--sheet-h': '400px', '--floor-h': 372 });
  });
});

describe('the first steps', () => {
  const [handful, tap, hidden] = LEARN_STEPS;

  it('shows the same handful at each of four critters’ feet', () => {
    expect(handful!.painting).toBe('window');
    expect(handful!.critters.map(place)).toEqual([[18, 78, 95], [40, 84, 105], [62, 84, 105], [83, 78, 95]]);
    expect(handful!.heaps.map(heap => [...place(heap), heap.crumbs])).toEqual([[27, 81, 34, 6], [50, 87, 34, 6], [72, 87, 34, 6], [92, 81, 34, 6]]);
  });

  it('gives ten practice crumbs to three critters on the second step, and only there', () => {
    expect(tap!.critters.map(place)).toEqual([[24, 80, 110], [50, 64, 95], [76, 80, 110]]);
    expect([place(tap!.practice!), tap!.practice!.crumbs]).toEqual([[50, 90, 64], 10]);
    expect([handful!.practice, hidden!.practice]).toEqual([undefined, undefined]);
  });

  it('ends at dusk with everyone asleep and a closed pod where each handful was', () => {
    expect(hidden!.painting).toBe('dusk');
    expect(hidden!.critters.every(critter => critter.asleep)).toBe(true);
    expect(hidden!.pods.map(place)).toEqual([[27, 80, 26], [50, 86, 26], [72, 86, 26], [92, 80, 26]]);
  });

  it('keeps one sheet height for all three, so the floor does not move between steps', () => {
    expect(sheetScreenStyle(LEARN_SHEET_HEIGHT)).toEqual({ '--sheet-h': '300px', '--floor-h': 472 });
  });
});
