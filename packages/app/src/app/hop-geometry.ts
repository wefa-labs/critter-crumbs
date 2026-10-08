import { DOM_HOP } from '@critter-crumbs/shared';
export interface Point { x: number; y: number }
const curve=DOM_HOP.ease;
const cubic = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
export function hopProgress(progress: number) {
  if (progress <= 0 || progress >= 1) return Math.max(0, Math.min(1, progress));
  let low = 0, high = 1;
  for (let i = 0; i < 24; i++) { const t = (low + high) / 2; if (cubic(t, curve[0]!, curve[2]!) < progress) low = t; else high = t; }
  return cubic((low + high) / 2, curve[1]!, curve[3]!);
}
export function hopPosition(from: Point, to: Point, t: number): Point {
  const apex = Math.min(from.y, to.y) - DOM_HOP.apexPx;
  // This control height puts the parabola's true minimum at the specified apex.
  const control = apex - Math.sqrt((from.y - apex) * (to.y - apex));
  return { x: from.x + (to.x - from.x) * t, y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * control + t * t * to.y };
}
