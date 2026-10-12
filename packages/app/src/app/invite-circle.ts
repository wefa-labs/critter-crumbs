import type { Facing, Standing } from './painted-scene.js';

/** The flow page's circle for a sheet screen: an ellipse around the middle of the floor, in percent of the scene. */
const CENTRE = { x: 50, y: 67 }, RADIUS = { x: 36, y: 19 }, SIZE = { back: 66, front: 98 };
/** As many critters as the design draws at its sizes; a larger burrow's critters shrink so the ring still holds them. */
const ROOMY = 8;

export interface CircleSpot extends Standing { index: number; face: Facing }

/**
 * Where n critters stand in a ring on the floor (flow page, circle()): the first at the front, in the middle, the rest
 * going round, smaller at the back, each turned toward the middle. Returned from the back of the floor to the front,
 * which is the order to draw them in so nearer critters overlap farther ones.
 */
export function sceneCircle(n: number): CircleSpot[] {
  const crowd = n > ROOMY ? Math.sqrt(ROOMY / n) : 1;
  return Array.from({ length: n }, (_, index) => {
    const angle = (90 - index * 360 / n) * Math.PI / 180, across = Math.cos(angle), depth = Math.sin(angle);
    return {
      index, x: CENTRE.x + RADIUS.x * across, y: CENTRE.y + RADIUS.y * depth,
      size: (SIZE.back + (SIZE.front - SIZE.back) * (depth + 1) / 2) * crowd,
      face: across > .2 ? 'left' : across < -.2 ? 'right' : null,
    } satisfies CircleSpot;
  }).sort((a, b) => a.y - b.y);
}
