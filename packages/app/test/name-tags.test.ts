import { expect, test } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import { gardenDraw, gardenLayout } from '../src/portraits/garden/species.js';
import { portraitMetrics } from '../src/portraits/metrics.js';
import { layoutGame, overlapArea, rectGap } from '../src/game/layout.js';
import { composeGame } from '../src/game/composition.js';
import members from '../src/dev/game-members.js';
import { fixtureAllocation } from '../src/dev/game-fixtures.js';

const looks = {
  'version 2': (address: string) => portraitMetrics(generate2(address, 0)).extent,
  'Garden Spirits': (address: string) => gardenLayout(gardenDraw(generate2(address, 0))).extent,
};
const phones = [{ width: 390, height: 844 }, { width: 375, height: 667 }, { width: 320, height: 568 }];
const desktops = [{ width: 1280, height: 720 }, { width: 1440, height: 900 }];

/** Every scattering layout of a burrow of `n` at this size: one per critter in focus. */
function* circles(viewport: { width: number; height: number }, n: number, extentOf: (address: string) => ReturnType<typeof portraitMetrics>['extent']) {
  const { scene, surface } = composeGame('scatter', viewport.width >= 900 ? 'desktop' : 'phone'), allocation = fixtureAllocation('scatter', n);
  const critters = members.slice(0, n).map((member, index) => ({ name: member.name, own: index === 2, count: allocation[index]!, extent: extentOf(member.address) }));
  for (let focus = 0; focus < n; focus++) yield { focus, layout: layoutGame({ viewport, critters, focus, issued: 100, scene, surface }) };
}

// A name tag that drifts away to find room no longer names anything (QA plan; garden-refinement README, limitations).
// The heap and the thought bubble stay clear, so on the smallest phone a tag may have to lift a little past its own height.
test('each name tag stays within one and a half tag heights of its own critter, and no two tags overlap', () => {
  for (const [look, extentOf] of Object.entries(looks)) for (const viewport of [...phones, ...desktops]) for (const n of [8, 10]) for (const { focus, layout } of circles(viewport, n, extentOf)) {
    const where = `${look} ${viewport.width}x${viewport.height} n=${n} focus ${focus}`, tagged = layout.slots.filter(slot => !slot.tag.hidden);
    for (const slot of tagged) expect(rectGap(slot.tag, slot.figure), `${where}: ${slot.name}`).toBeLessThanOrEqual(slot.tag.height * 1.5);
    for (let i = 0; i < tagged.length; i++) for (let j = i + 1; j < tagged.length; j++) expect(overlapArea(tagged[i]!.tag, tagged[j]!.tag), where).toBe(0);
  }
});
