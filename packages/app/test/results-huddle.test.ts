import { expect, test } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import { GROWTH } from '@critter-crumbs/shared';
import { gardenDraw, gardenLayout } from '../src/portraits/garden/species.js';
import { layoutGame } from '../src/game/layout.js';
import { composeGame } from '../src/game/composition.js';
import members from '../src/dev/game-members.js';

/** Game Design §3.4: a critter's growth at the feast from its share of all crumbs scattered. */
const growthOf = (share: number, n: number) => 1 + GROWTH.scaleGain * Math.min(1, share * n / GROWTH.fairShareCap) ** GROWTH.exponent;
/** A budget split four ways unevenly, and ten people's results as the review fixture has them. */
const splits = { 4: [0.5, 0.25, 0.15, 0.1], 10: [0.166, 0.148, 0.114, 0.109, 0.094, 0.09, 0.081, 0.078, 0.063, 0.057] } as const;

function huddle(viewport: { width: number; height: number }, n: 4 | 10) {
  const { scene, surface } = composeGame('results', viewport.width >= 900 ? 'desktop' : 'phone');
  const critters = members.slice(0, n).map((member, index) => {
    const growth = growthOf(splits[n][index]!, n), fed = (growth - 1) / GROWTH.scaleGain;
    return { name: member.name, own: false, count: 0, growth, extent: gardenLayout(gardenDraw(generate2(member.address, 0)), fed).extent };
  });
  const layout = layoutGame({ viewport, critters, focus: 0, issued: 100, scene, surface });
  // a critter's drawn width: its figure's share of the stage, grown by the feast's own scale about its feet
  const spans = layout.slots.map((slot, index) => {
    const extent = critters[index]!.extent, width = (extent.right - extent.left) * slot.stage.width * critters[index]!.growth;
    return { index, front: slot.depth >= 3200, x: slot.foot.x, left: slot.foot.x - width / 2, right: slot.foot.x + width / 2, width, stage: slot.stage.width };
  });
  return { layout, spans };
}

// The results huddle shows each critter as the feast grew it: none hidden behind its neighbours, in the burrow's own
// order rather than ranked (Game Design G3), filling the room a phone has for a small group.
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) for (const n of [4, 10] as const) {
  test(`the results huddle of ${n} at ${viewport.width} x ${viewport.height} shows every critter whole, in order, as grown`, () => {
    const { layout, spans } = huddle(viewport, n), front = spans.filter(span => span.front).sort((a, b) => a.x - b.x);
    expect(front.map(span => span.index)).toEqual([...front.map(span => span.index)].sort((a, b) => a - b));
    for (let i = 1; i < front.length; i++) {
      const overlap = Math.max(0, front[i - 1]!.right - front[i]!.left);
      expect(overlap / Math.min(front[i - 1]!.width, front[i]!.width), `${front[i - 1]!.index} and ${front[i]!.index}`).toBeLessThanOrEqual(0.25);
    }
    for (const span of spans) { expect(span.left).toBeGreaterThanOrEqual(0); expect(span.right).toBeLessThanOrEqual(layout.scene.width); }
  });
}

test('a phone gives a small huddle the room it has', () => {
  const { spans } = huddle({ width: 390, height: 844 }, 4);
  for (const span of spans) expect(span.stage).toBeGreaterThanOrEqual(84);
});
