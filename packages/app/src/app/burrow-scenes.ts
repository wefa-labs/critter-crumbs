import type { FeastClock } from '@critter-crumbs/shared';
import type { Facing, Painting, Standing } from './painted-scene.js';

/**
 * Home and the burrow's screens on their floors, as the flow page draws them (docs/explorations/app-screens: SCREENS.home,
 * ['home-empty'], ['burrow-new'], burrow, ['burrow-fresh'], ['burrow-join'], ['burrow-quiet'], members and unknown):
 * each screen's painting, where your critter stands on it, and the sheet's height on the design's 812 px phone. The
 * numbers are the flow page's; they are tested against it in packages/app/test/burrow-scenes.test.ts.
 */
export interface YourPlace { painting: Painting; critter: Standing & { face: Facing }; sheetHeight: number }

/** Home: your critter at the burrow's entrance, over your burrows. */
export const HOME_SCENE: YourPlace = { painting: 'entrance', critter: { x: 50, y: 92, size: 116, face: null }, sheetHeight: 470 };
/** No burrows yet: your critter larger and asleep, with a "z" over its head, over the one action. A link to no burrow shows the same. */
export const ASLEEP_SCENE: YourPlace & { z: Standing } = { painting: 'entrance', critter: { x: 50, y: 92, size: 130, face: null }, sheetHeight: 250, z: { x: 57, y: 46, size: 22 } };
/** Start a burrow: your critter off to the left, turned to the field. */
export const NEW_BURROW_SCENE: YourPlace = { painting: 'entrance', critter: { x: 40, y: 92, size: 110, face: 'right' }, sheetHeight: 330 };
/** A burrow just made, with only you in it: you at its entrance, over the add field. */
export const FRESH_BURROW_SCENE: YourPlace = { painting: 'entrance', critter: { x: 44, y: 93, size: 110, face: 'right' }, sheetHeight: 540 };
/** A burrow that does not know you yet: you at its entrance, over your address to send. */
export const UNKNOWN_BURROW_SCENE: YourPlace = { painting: 'entrance', critter: { x: 34, y: 94, size: 112, face: 'right' }, sheetHeight: 330 };

/**
 * The sheet's height on a burrow's own screens: with its feasts, with none yet, the one that asks you to join, and
 * its critters. Their floor is the room once the burrow has had a feast, and its entrance before (`burrowPainting`);
 * a draft, which only its creator sees, does not count, so every member stands in the same place.
 */
export const BURROW_SHEETS = { feasts: 500, quiet: 400, join: 280, critters: 700 } as const;
export const burrowPainting = (feasts: readonly FeastClock[]): Painting => feasts.some(feast => feast.status !== 'draft') ? 'window' : 'entrance';

/** Where one of a burrow's critters stands: `index` is its place in the burrow's own order. */
export interface FloorSpot extends Standing { index: number; face: Facing }

/** As many critters as the flow page draws in a burrow; a larger burrow's critters shrink so the floor still holds them. */
const ROOMY = 8;
/** At most this many stand in the one staggered row of a small burrow (row() on the flow page). */
const ONE_ROW = 5;

/**
 * Where a burrow's n critters stand on its floor, for any size of burrow, returned from the back of the floor to the
 * front, which is the order to draw them in. A small burrow stands in one staggered row across the floor, every other
 * critter a step nearer and a little larger (flow page, row(): SCREENS['burrow-quiet'] draws five). A larger one stands
 * in a back row bowed toward you in the middle and smaller at its ends, with a quarter of it in a row before that
 * (SCREENS.burrow draws eight: six behind, two in front). Each is turned toward the middle; the last in the burrow's
 * order stands at the right: the end of the one row, or the right of the front row.
 */
export function burrowFloor(n: number): FloorSpot[] {
  const turned = (x: number, middle: number): Facing => x < middle - 1 ? 'right' : x > middle + 1 ? 'left' : null;
  const spots: FloorSpot[] = [];
  if (n <= ONE_ROW) {
    const spread = Math.min(84, 21 * (n - 1));
    for (let index = 0; index < n; index++) {
      const x = n === 1 ? 50 : 50 - spread / 2 + index * spread / (n - 1), near = index % 2 === 1;
      spots.push({ index, x, y: near ? 90 : 80, size: near ? 80 : 74, face: n === 1 ? null : index < n / 2 ? 'right' : 'left' });
    }
  } else {
    const front = Math.round(n / 4), back = n - front, crowd = n > ROOMY ? Math.sqrt(ROOMY / n) : 1;
    const spread = Math.min(78, 18 * (back - 1));
    for (let index = 0; index < back; index++) {
      const x = 53 - spread / 2 + index * spread / (back - 1), bow = ((x - 53) / 39) ** 2;
      spots.push({ index, x, y: 77 - 7 * bow, size: (70 - 12 * bow) * crowd, face: turned(x, 53) });
    }
    for (let seat = 0; seat < front; seat++) {
      const along = front === 1 ? .5 : seat / (front - 1), x = 22 + 56 * along;
      spots.push({ index: back + seat, x, y: 92 + along, size: 74 * crowd, face: turned(x, 50) });
    }
  }
  return spots.sort((a, b) => a.y - b.y);
}
