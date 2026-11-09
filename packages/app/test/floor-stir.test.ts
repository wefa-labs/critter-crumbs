import { describe, expect, it } from 'vitest';
import { CIRCLE_FEEL, stirPose } from '@critter-crumbs/shared';
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

  it("is the game's own stir, sampled, and at rest once it is done", () => {
    const { head, body } = stirKeyframes();
    head.forEach(frame => expect(degrees(frame)).toBeCloseTo(stirPose(frame.offset * CIRCLE_FEEL.stirMs).headTilt, 2));
    body.forEach(frame => expect(degrees(frame)).toBeCloseTo(stirPose(frame.offset * CIRCLE_FEEL.stirMs).lean, 2));
    const after = stirPose(CIRCLE_FEEL.sleepGlyphMs);
    expect(after.headTilt).toBeCloseTo(0, 9); expect(after.lean).toBeCloseTo(0, 9);
  });

  it("lets each z rise and fade as the game's do", () => {
    expect(sleepGlyphKeyframes).toEqual([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: `${CIRCLE_FEEL.sleepDriftX}px -${CIRCLE_FEEL.sleepDriftY}px` }]);
  });
});
