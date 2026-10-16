import { describe, expect, it } from 'vitest';
import { sceneCircle } from '../src/app/invite-circle.js';
import { LEARN_SHEET_HEIGHT, LEARN_STEPS } from '../src/app/learn-steps.js';
import { INVITE_SCENE, LAUNCHER_SCENE, sheetScreenStyle } from '../src/app/painted-scene.js';

/* Expected values are read off the flow page, never off the app (docs/explorations/app-screens/index.html):
   launcherScene(), circle(), and SCREENS.invite, ['learn-handful'], ['learn-tap'] and ['learn-private']. The launcher's
   critters are the one exception: they are drawn about 1.4 times the flow page's and stand further apart, at Afolabi's
   word (docs/decisions.md, 2026-10-11, "a bit larger in the launch view"). The tutorial's room coordinates now follow
   docs/explorations/scene-proportions/README.md and the approved 16 October QA scope. */
const place = ({ x, y, size }: { x: number; y: number; size: number }) => [x, y, size];

describe('the launcher', () => {
  it('stands four critters around a heap of ten crumbs on the phone, the outer two asleep', () => {
    expect(LAUNCHER_SCENE.painting).toBe('window');
    expect(LAUNCHER_SCENE.critters.map(place)).toEqual([[17, 90, 124], [38, 94, 138], [64, 93, 140], [84, 89, 118]]);
    expect(LAUNCHER_SCENE.critters.map(critter => critter.asleep)).toEqual([true, false, false, true]);
    expect(LAUNCHER_SCENE.critters.map(critter => critter.face)).toEqual(['right', null, 'left', 'left']);
    expect([place(LAUNCHER_SCENE.heap), LAUNCHER_SCENE.heap.crumbs]).toEqual([[51, 95, 80], 10]);
  });

  it('gathers them either side of the 420 px card on desktop, each whole drawing clear of the card and inside the 1280 px frame', () => {
    expect(LAUNCHER_SCENE.critters.map(critter => critter.side)).toEqual([-1, -1, 1, 1]);
    for (const critter of LAUNCHER_SCENE.critters) {
      const centre = 640 + critter.side * (210 + critter.beside), halfWidth = critter.size * 1.5 / 2;
      expect(Math.abs(centre - 640) - halfWidth).toBeGreaterThanOrEqual(210);
      expect(centre - halfWidth).toBeGreaterThanOrEqual(0);
      expect(centre + halfWidth).toBeLessThanOrEqual(1280);
    }
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
  const [handful, tap, hidden, opened] = LEARN_STEPS;

  it('shows the same handful at each of four critters’ feet', () => {
    expect(handful!.painting).toBe('window');
    expect(handful!.critters.map(place)).toEqual([[39.4, 90, 165], [46.1, 94, 190], [54.5, 93, 190], [61, 89, 165]]);
    expect(handful!.heaps.map(heap => [...place(heap), heap.crumbs])).toEqual([[43, 91.5, 52, 6], [50, 95.5, 52, 6], [58.5, 95, 52, 6], [64.5, 90.5, 52, 6]]);
  });

  it('gives ten practice crumbs to three critters on the second step, and only there', () => {
    expect(tap!.critters.map(place)).toEqual([[40, 91.5, 190], [50, 85, 170], [60, 91.5, 190]]);
    expect([place(tap!.practice!), tap!.practice!.crumbs]).toEqual([[50, 95.5, 88], 10]);
    expect([handful!.practice, hidden!.practice, opened!.practice]).toEqual([undefined, undefined, undefined]);
  });

  it('shows privacy at dusk with everyone asleep and a closed pod where each handful was', () => {
    expect(hidden!.painting).toBe('dusk');
    expect(hidden!.critters.every(critter => critter.asleep)).toBe(true);
    expect(hidden!.pods.map(place)).toEqual([[43, 91, 40], [50, 95, 40], [58.5, 94.5, 40], [64.5, 90, 40]]);
  });

  it('keeps one sheet height for all four, returning to an awake group at the feast', () => {
    expect(LEARN_STEPS).toHaveLength(4);
    expect(opened!.painting).toBe('window');
    expect(opened!.critters.every(critter => !critter.asleep)).toBe(true);
    expect(sheetScreenStyle(LEARN_SHEET_HEIGHT)).toEqual({ '--sheet-h': '410px', '--floor-h': 362 });
  });
});
