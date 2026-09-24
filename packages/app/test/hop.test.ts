import { expect, test } from 'vitest';
import { hopPosition, hopProgress } from '../src/app/hop-geometry.js';
test('hop reaches70px above the higher endpoint even across a tall grid, forwards and backwards', () => {
  for (const [from, to] of [[{x:0,y:780},{x:300,y:100}], [{x:300,y:100},{x:0,y:780}], [{x:0,y:400},{x:300,y:400}]] as const) {
    const points = Array.from({length:10001}, (_, i) => hopPosition(from, to, i / 10000));
    expect(points[0]).toEqual(from); expect(points.at(-1)).toEqual(to);
    expect(Math.min(...points.map(point => point.y))).toBeCloseTo(Math.min(from.y, to.y) - 70, 3);
  }
  expect(hopProgress(0)).toBe(0); expect(hopProgress(1)).toBe(1); expect(hopProgress(.5)).toBeGreaterThan(.5);
});
