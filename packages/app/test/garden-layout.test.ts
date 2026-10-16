import { expect, test } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import { FLIERS, gardenDraw, gardenLayout } from '../src/portraits/garden/species.js';
import { faceCrop } from '../src/game/styles.js';
import { layoutGame, overlapArea } from '../src/game/layout.js';
import { composeGame } from '../src/game/composition.js';
import members from '../src/dev/game-members.js';
import { fixtureAllocation } from '../src/dev/game-fixtures.js';

test('every species exposes a bounded face, body and hover anchor at scene sizes', () => {
  const found = new Set<string>();
  for (let i = 1; i <= 400 && found.size < 8; i++) {
    const draw = gardenDraw(generate2(`0x${i.toString(16).padStart(40, '0')}`, 0));
    if (found.has(draw.species)) continue;
    found.add(draw.species);
    for (const fed of [0, 1]) {
      const { extent } = gardenLayout(draw, fed);
      expect(extent.top).toBeGreaterThanOrEqual(0);
      expect(extent.left).toBeGreaterThanOrEqual(0);
      expect(extent.right).toBeLessThanOrEqual(1);
      expect(extent.headX).toBeGreaterThan(extent.left);
      expect(extent.headX).toBeLessThan(extent.right);
      expect(extent.headY).toBeGreaterThan(extent.top);
      expect(extent.hover > 0).toBe(FLIERS.has(draw.species));
    }
  }
  expect(found.size).toBe(8);
});

test('face crops centre an off-centre head and retain a consistent optical face size', () => {
  const style = faceCrop(40, .6, .4, .2) as Record<string, string>;
  expect(style['--face-width']).toBe('80px');
  expect(style['--face-left']).toBe('-12px');
  expect(style['--face-top']).toBe('-40px');
});

test('ten refined critters retain separate name tags on a short phone', () => {
  const { scene, surface } = composeGame('scatter', 'phone');
  const allocation = fixtureAllocation('scatter', members.length);
  const critters = members.map((member, index) => ({ name: member.name, own: index === 2, count: allocation[index]!, extent: gardenLayout(gardenDraw(generate2(member.address, 0))).extent }));
  for (const widthPerEm of [undefined, .5, .6, .7]) for (let focus = 0; focus < critters.length; focus++) {
    const measure = widthPerEm === undefined ? undefined : (text: string, size: number) => text.length * size * widthPerEm;
    const layout = layoutGame({ viewport: { width: 320, height: 568 }, critters, focus, issued: 100, scene, surface, ...(measure ? { measure } : {}) });
    const tags = layout.slots.filter(slot => !slot.tag.hidden).map(slot => slot.tag);
    for (let i = 0; i < tags.length; i++) for (let j = i + 1; j < tags.length; j++) expect(overlapArea(tags[i]!, tags[j]!), `focus ${focus}`).toBe(0);
  }
});
