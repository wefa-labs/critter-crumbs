import { describe, expect, it } from 'vitest';
import { CIRCLE_FEEL } from '@critter-crumbs/shared';
import { sleepGlyphKeyframes, stirKeyframes } from '../src/app/floor-stir.js';

/* A floor critter stirs as your own critter stirs in the game (world/circle.ts): the same curves over the same time. */
describe('the stir on a painted floor', () => {
  const degrees = (frame: { transform: string }) => Number(/rotate\((-?[\d.]+)deg\)/.exec(frame.transform)![1]);

  it("tilts the head up to the game's 18° and back, from rest to rest", () => {
    const head = stirKeyframes().head.map(degrees);
    expect(head[0]).toBe(0); expect(head.at(-1)).toBe(0);
    expect(Math.max(...head)).toBe(CIRCLE_FEEL.stirTilt);
    expect(head.every(value => value >= 0)).toBe(true);
  });

  it("sways the body the game's 5° one way, then the other, once", () => {
    const body = stirKeyframes().body.map(degrees);
    expect(body[0]).toBe(0); expect(Math.abs(body.at(-1)!)).toBeLessThan(1e-9);
    expect(Math.max(...body)).toBe(CIRCLE_FEEL.stirSway); expect(Math.min(...body)).toBe(-CIRCLE_FEEL.stirSway);
    expect(body.indexOf(CIRCLE_FEEL.stirSway)).toBeLessThan(body.indexOf(-CIRCLE_FEEL.stirSway));
  });

  it("lets each z rise and fade as the game's do", () => {
    expect(sleepGlyphKeyframes).toEqual([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: `${CIRCLE_FEEL.sleepDriftX}px -${CIRCLE_FEEL.sleepDriftY}px` }]);
  });
});
