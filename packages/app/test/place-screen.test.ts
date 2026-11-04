import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FaceRow, FloorRing } from '../src/app/place-screen.js';
import { CLOVER, FERN, JUNIPER, MOSS } from '../src/app/painted-scene.js';
/* every build draws Garden Spirits, whose renderer main.ts installs before the first screen; faces are cropped by it */
import '../src/portraits/garden/install.js';

/* The frame's kit, which the home, burrow and gathering screens are built with next (docs/reviews/ui-audit-2026-11,
   build order 4 to 6): who has done something at a glance, and the burrow's critters in a ring on the floor. */
describe("the frame's kit", () => {
  const faces = ([['Moss', MOSS, true], ['Fern', FERN, true], ['Juniper', JUNIPER, false], ['Clover', CLOVER, false]] as const)
    .map(([name, address, done]) => ({ key: address, address, variant: 0, name, done }));

  it('shows who has done something: the count, every face with those not yet dimmed, and who has not, by name', () => {
    const markup = renderToStaticMarkup(createElement(FaceRow, { count: '2 of 4 statements written', faces, notYet: 'gathering.notYet' }));
    expect(markup).toContain('2 of 4 statements written');
    expect(markup.match(/class="face-row-face"/g)).toHaveLength(4);
    expect(markup.match(/data-done="false"/g)).toHaveLength(2);
    expect(markup).toContain('Not yet: Juniper and Clover');
  });

  it('says nothing of who has not once everyone has', () => {
    const markup = renderToStaticMarkup(createElement(FaceRow, { count: '4 of 4 statements written', faces: faces.map(face => ({ ...face, done: true })), notYet: 'gathering.notYet' }));
    expect(markup).not.toContain('Not yet');
  });

  it('stands one critter for each in the ring, drawn from the back of the floor to the front', () => {
    const markup = renderToStaticMarkup(createElement(FloorRing, { critters: faces.map(face => ({ key: face.key, address: face.address, variant: 0, asleep: !face.done })) }));
    expect(markup.match(/class="floor-critter"/g)).toHaveLength(4);
    const depths = [...markup.matchAll(/--y:([\d.]+)/g)].map(match => Number(match[1]));
    expect(depths).toHaveLength(4);
    expect(depths).toEqual([...depths].sort((a, b) => a - b));
  });
});
