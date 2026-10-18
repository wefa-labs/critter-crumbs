import { expect, test } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import { gardenDraw, gardenLayout } from '../src/portraits/garden/species.js';
import { portraitMetrics } from '../src/portraits/metrics.js';
import { layoutGame } from '../src/game/layout.js';
import { composeGame } from '../src/game/composition.js';
import members from '../src/dev/game-members.js';
import { fixtureAllocation } from '../src/dev/game-fixtures.js';

const looks = {
  'version 2': (address: string) => portraitMetrics(generate2(address, 0)).extent,
  'Garden Spirits': (address: string) => gardenLayout(gardenDraw(generate2(address, 0))).extent,
};
const phones = [{ width: 390, height: 844 }, { width: 375, height: 667 }, { width: 320, height: 568 }];

/** Every scattering layout of a burrow of `n` at this size: one per critter in focus. */
function* circles(viewport: { width: number; height: number }, n: number, extentOf: (address: string) => ReturnType<typeof portraitMetrics>['extent']) {
  const { scene, surface } = composeGame('scatter', viewport.width >= 900 ? 'desktop' : 'phone'), allocation = fixtureAllocation('scatter', n);
  const critters = members.slice(0, n).map((member, index) => ({ name: member.name, own: index === 2, count: allocation[index]!, extent: extentOf(member.address) }));
  for (let focus = 0; focus < n; focus++) yield { focus, layout: layoutGame({ viewport, critters, focus, issued: 100, scene, surface }) };
}

// The QA plan's review: with ten critters the back row was about 40 px tall on a phone and its faces were hard to read.
test('on a phone no critter in the circle is drawn narrower than 56 px', () => {
  for (const [look, extentOf] of Object.entries(looks)) for (const viewport of phones) for (const n of [8, 10]) for (const { focus, layout } of circles(viewport, n, extentOf)) {
    for (const slot of layout.slots) expect(slot.stage.width, `${look} ${viewport.width}x${viewport.height} n=${n} focus ${focus}`).toBeGreaterThanOrEqual(56);
  }
});
