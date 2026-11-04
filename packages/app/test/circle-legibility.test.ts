import { expect, test } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import { gardenDraw, gardenLayout } from '../src/portraits/garden/species.js';
import { portraitMetrics } from '../src/portraits/metrics.js';
import { layoutGame, overlapArea } from '../src/game/layout.js';
import { composeGame } from '../src/game/composition.js';
import members from '../src/dev/game-members.js';
import { fixtureAllocation } from '../src/dev/game-fixtures.js';

const looks = {
  'version 2': (address: string) => portraitMetrics(generate2(address, 0), 0, false).extent,
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

// Design pass §21 measured the heap of crumbs left never over a critter, on the 375 × 812 phone and the three desktops;
// the screens suite checks the same at 430 × 932. Garden Spirits are wider than the October drawing (ADR 0006): at
// 375 × 812 with six, an ember fox's tail reached 0.2 px into the heap's box.
test('the heap of crumbs left covers no critter at the sizes the design pass measured', () => {
  const measured = [{ width: 375, height: 812 }, { width: 430, height: 932 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }];
  for (const [look, extentOf] of Object.entries(looks)) for (const viewport of measured) for (const n of [4, 6, 8, 10]) for (const { focus, layout } of circles(viewport, n, extentOf)) {
    for (const slot of layout.slots) expect(overlapArea(layout.heap!, slot.figure), `${look} ${viewport.width}x${viewport.height} n=${n} focus ${focus}: ${slot.name}`).toBe(0);
  }
});
