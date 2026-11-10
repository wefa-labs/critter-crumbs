import { describe, expect, it } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import members from '../src/dev/game-members.js';
import { portraitMetrics } from '../src/portraits/metrics.js';
import { hitRect, layoutGame, overlapArea, rectGap } from '../src/game/layout.js';
import { composeGame } from '../src/game/composition.js';
/* the scattering composition, as the scatter page draws it */
const scattering = (device: 'phone' | 'desktop') => { const { surface, scene } = composeGame('scatter', device); return { surface, scene }; };
const deviceOf = (width: number) => width >= 900 ? 'desktop' as const : 'phone' as const;
const names = ['Moss','Fern','Juniper','Clover','Acorn','Hazel Montgomery','Pebble','Willow','Bramble','Sorrel'];
const critters = (n: number) => names.slice(0,n).map(name=>({name,own:name==='Juniper',count:12,extent:{top:.28,left:.2,right:.8,headY:.48,headRadius:.17}}));
describe('October circle layout',()=>{
 it('places the focused critter on the reference desktop floor',()=>{
  const layout=layoutGame({viewport:{width:1280,height:800},critters:critters(8),focus:0,issued:100,...scattering('desktop')});
  expect(layout.scene.width).toBe(880);
  expect(layout.slots[0]!.foot).toEqual({x:440,y:592});
  expect(layout.slots[0]!.stage.width).toBe(248);
  expect(layout.dock.height).toBe(130);
 });
 it('keeps the heap and every visible tag above the dock at supported sizes',()=>{
  for(const [width,height] of [[375,812],[390,844],[430,932],[1280,800],[1440,900],[1920,1080]])for(const n of [4,6,8,10])for(let focus=0;focus<n;focus++){
   const layout=layoutGame({viewport:{width:width!,height:height!},critters:critters(n),focus,issued:100,...scattering(deviceOf(width!))});
   const heap=layout.heap!;expect(heap.y+heap.height).toBeLessThanOrEqual(layout.dock.y);
   for(const slot of layout.slots)if(!slot.tag.hidden){expect(slot.tag.x).toBeGreaterThanOrEqual(0);expect(slot.tag.y).toBeGreaterThanOrEqual(0);expect(slot.tag.y+slot.tag.height).toBeLessThanOrEqual(layout.dock.y);expect(overlapArea(slot.tag,heap)).toBe(0);}
  }
 });
 // Tags are centred over their critter (the review page) unless a pile or the bubble takes that spot, when they shift
 // just enough to stay beside it rather than climbing the room (QA lifecycle-03).
 it('keeps review tags clear of the thought bubble and piles, centred over their critter or beside it',()=>{
  for(const viewport of [{width:375,height:812},{width:1280,height:800},{width:1440,height:900}])for(const count of [4,6,8,10])for(let focus=0;focus<count;focus++){
   const critters=members.slice(0,count).map((member,i)=>({name:member.name,own:i===2,count:i===2?0:12,extent:portraitMetrics(generate2(member.address,0),0,false).extent}));
   const layout=layoutGame({viewport,critters,focus,issued:100,...scattering(deviceOf(viewport.width))});
   for(const slot of layout.slots)if(!slot.tag.hidden){expect(overlapArea(slot.tag,layout.bubble),JSON.stringify({viewport,count,focus,slot:slot.index})).toBe(0);for(const other of layout.slots)if(other.slot!==0)expect(overlapArea(slot.tag,other.pile)).toBe(0);const desired=Math.min(Math.max(slot.foot.x-slot.tag.width/2,6),layout.scene.width-6-slot.tag.width);if(slot.tag.x!==desired)expect(rectGap(slot.tag,slot.figure)).toBeLessThanOrEqual(slot.tag.height*1.5);}
  }
 });

});

describe('October surfaces', () => {
  const at = (state: Parameters<typeof composeGame>[0], viewport: { width: number; height: number }, n = 8) => {
    const { surface, scene } = composeGame(state, deviceOf(viewport.width));
    return layoutGame({ viewport, critters: critters(n), focus: 0, issued: 100, surface, scene });
  };
  it('opens statements over a 230 px sheet on the phone: every critter but yours thinks, no tags, no heap', () => {
    const layout = at('reveal', { width: 375, height: 812 });
    expect(layout.dock).toEqual({ x: 0, y: 812 - 64 - 230, width: 375, height: 230 });
    expect(layout.bubbles.map(bubble => bubble.index)).toEqual([0, 1, 3, 4, 5, 6, 7]);
    expect(layout.slots.every(slot => slot.tag.hidden)).toBe(true);
    expect(layout.heap).toBeNull();
    for (const slot of layout.slots) expect(slot.foot.y).toBeLessThanOrEqual(layout.dock.y);
  });
  it('gives a sheet state the whole desktop floor, its content living in the side panel', () => {
    for (const state of ['reveal', 'waiting', 'key', 'feast', 'nobody'] as const) expect(at(state, { width: 1280, height: 800 }).dock.height).toBe(0);
    expect(at('scatter', { width: 1280, height: 800 }).dock.height).toBe(130);
    expect(at('results', { width: 1440, height: 900 }).dock.height).toBe(74);
  });
  it('keeps the empty heap but no tags while the feast is laid out', () => {
    const layout = at('waiting', { width: 375, height: 812 });
    expect(layout.dock.height).toBe(290);
    expect(layout.heap).not.toBeNull();
    expect(layout.slots.every(slot => slot.tag.hidden)).toBe(true);
    expect(layout.bubbles).toEqual([]);
  });
  it('trails three puffs, smallest first, from the focused head up to the open statement on the phone only', () => {
    const { surface, scene } = composeGame('reading', 'phone');
    const reading = layoutGame({ viewport: { width: 375, height: 812 }, critters: critters(8), focus: 0, reading: true, issued: 100, surface, scene });
    expect(reading.trail.map(puff => puff.width)).toEqual([8, 11, 15]);
    const ys = reading.trail.map(puff => puff.y + puff.height / 2);
    expect(ys[0]!).toBeGreaterThan(ys[1]!); expect(ys[1]!).toBeGreaterThan(ys[2]!);
    expect(ys[2]!).toBeGreaterThan(12 + 378);
    expect(at('scatter', { width: 375, height: 812 }).trail).toEqual([]);
    expect(layoutGame({ viewport: { width: 1440, height: 900 }, critters: critters(8), focus: 0, reading: true, issued: 100, ...scattering('desktop') }).trail).toEqual([]);
  });
  it('sizes the phone statement to its text up to 378 px, the trail rising to its foot (D8)', () => {
    const { surface, scene } = composeGame('reading', 'phone');
    const open = (statementHeight?: number) => layoutGame({ viewport: { width: 375, height: 812 }, critters: critters(8), focus: 0, reading: true, issued: 100, surface, scene, ...(statementHeight === undefined ? {} : { statementHeight }) });
    /* a line or two: the bubble is that tall, at the same place, and the puffs reach up to just under it */
    const short = open(131.4);
    expect(short.statement).toEqual({ x: 12, y: 12, width: 351, height: 132 });
    const top = short.trail.at(-1)!;
    expect(top.y + top.height / 2).toBeGreaterThan(12 + 132);
    expect(top.y + top.height / 2).toBeLessThan(12 + 378);
    /* a long statement, or one not yet measured, takes the whole bubble and scrolls inside it */
    for (const height of [900, undefined, 0]) expect(open(height).statement.height).toBe(378);
    /* a shorter bubble covers fewer tags */
    expect(short.slots.filter(slot => slot.tag.hidden).length).toBeLessThanOrEqual(open(900).slots.filter(slot => slot.tag.hidden).length);
  });
  it('stands the desktop results huddle on the folded dock, every portrait clear of its controls', () => {
    for (const viewport of [{ width: 1280, height: 720 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) for (const n of [4, 6, 8, 10]) {
      const layout = at('results', viewport, n);
      for (const slot of layout.slots) {
        /* the portrait's whole box (feet, shadow and the margin under them) ends at the bar: nothing covers its buttons */
        expect(slot.stage.y + slot.stage.height, JSON.stringify({ viewport, n, slot: slot.index })).toBeLessThanOrEqual(layout.dock.y + 1e-9);
        expect(slot.figure.y).toBeGreaterThanOrEqual(0);
      }
    }
    /* the phone keeps its front row standing on the results' rounded top, as the flow page draws it; when everyone fits
       in one row (the results huddle's one-row rule), the front row is everyone */
    const phone = at('results', { width: 390, height: 844 }, 10), front = phone.slots.filter(slot => slot.depth >= 3200);
    expect(front.length).toBeGreaterThanOrEqual(6);
    for (const slot of front) expect(slot.foot.y).toBeGreaterThan(phone.dock.y);
  });
  it('huddles only the critters that were fed, as the one-scatterer result gathers its two', () => {
    const { surface, scene } = composeGame('tie', 'phone');
    const fed = critters(8).map((critter, index) => ({ ...critter, away: index !== 0 && index !== 3 }));
    const layout = layoutGame({ viewport: { width: 375, height: 812 }, critters: fed, focus: 0, issued: 100, surface, scene });
    const present = layout.slots.filter(slot => !slot.away);
    expect(present.map(slot => slot.index)).toEqual([0, 3]);
    /* two side by side on the card's edge, either side of the middle, facing each other */
    expect(present[0]!.foot.x).toBeLessThan(375 / 2); expect(present[1]!.foot.x).toBeGreaterThan(375 / 2);
    expect(present.map(slot => slot.face)).toEqual(['right', 'left']);
  });
  it('widens a small bubble’s target to a finger without moving the bubble', () => {
    expect(hitRect({ x: 100, y: 50, width: 34, height: 29 })).toEqual({ x: 95, y: 42.5, width: 44, height: 44 });
    expect(hitRect({ x: 10, y: 10, width: 52, height: 44 })).toEqual({ x: 10, y: 10, width: 52, height: 44 });
  });
});

/* QA accessibility-08: phone windows shorter than the design's 812, from an iPhone SE in Safari (548) and a phone inside
   a wallet's browser (500) to a phone on its side */
describe('Short phone windows', () => {
  const SHORT = [{ width: 390, height: 664 }, { width: 375, height: 600 }, { width: 375, height: 548 }, { width: 375, height: 500 }, { width: 320, height: 480 }, { width: 667, height: 375 }, { width: 812, height: 375 }, { width: 844, height: 390 }];
  it('keeps a long statement’s bubble clear of the dock, so its last line can be scrolled into view', () => {
    const { surface, scene } = composeGame('reading', 'phone');
    for (const viewport of SHORT) {
      const layout = layoutGame({ viewport, critters: critters(8), focus: 0, reading: true, statementHeight: 900, issued: 100, surface, scene });
      const label = JSON.stringify(viewport);
      expect(layout.statement.y + layout.statement.height, label).toBeLessThanOrEqual(layout.dock.y - 12);
      /* still a place to read: the heading and three lines of text at the least */
      expect(layout.statement.height, label).toBeGreaterThanOrEqual(150);
    }
    /* the design's phone keeps its 378 px bubble */
    expect(layoutGame({ viewport: { width: 375, height: 812 }, critters: critters(8), focus: 0, reading: true, statementHeight: 900, issued: 100, surface, scene }).statement.height).toBe(378);
  });
  /* The card's anatomy, measured on the fixtures: the dock's padding and bar 78, the heading 48, the pinned actions 56;
     inside the list the summary (two lines: who scattered, who did not) and Why nobody can peek take 99, a row 52 with
     6 between, the fade 28. Two rows in view need 78 + 48 + 56 + 99 + 52 + 6 + 52 + 28 = 419. With the heading and
     actions scrolling along with the list, the heading, the summary, the link and the first 16 px of a row need
     78 + 48 + 99 + 16 = 241: a phone on its side 375 px tall shows that much, one 390 px tall a whole row. */
  it('gives the results room for two rows on a short phone, the huddle standing smaller on the floor left above them', () => {
    const { surface, scene } = composeGame('results', 'phone');
    const at = (viewport: { width: number; height: number }, n = 8) => layoutGame({ viewport, critters: critters(n), focus: 0, issued: 100, surface, scene });
    /* the design's phones keep 196 px of floor above the card */
    for (const viewport of [{ width: 375, height: 812 }, { width: 430, height: 932 }]) expect(at(viewport).dock.y).toBe(196);
    for (const viewport of SHORT) for (const n of [4, 8, 10]) {
      const layout = at(viewport, n), label = JSON.stringify({ viewport, n }), scene = viewport.height - 64;
      if (scene - 48 >= 420) expect(layout.dock.height, label).toBeGreaterThanOrEqual(420);
      else expect(layout.dock.y, label).toBe(48);
      expect(layout.dock.y + layout.dock.height, label).toBe(scene);
      /* every critter of the huddle stands wholly inside the scene, on the card's top edge */
      for (const slot of layout.slots) { expect(slot.stage.y, label).toBeGreaterThanOrEqual(0); expect(slot.foot.y, label).toBeGreaterThanOrEqual(layout.dock.y); }
      /* where no row would show under pinned heading and actions, they scroll with the list, a row starting in view */
      expect(layout.resultsUnpinned, label).toBe(layout.dock.height < 361);
      if (layout.resultsUnpinned) expect(layout.dock.height, label).toBeGreaterThanOrEqual(241);
    }
  });
  it('draws the trail of puffs only where it rises from the head to the bubble, never tucked under it', () => {
    const { surface, scene } = composeGame('reading', 'phone');
    for (const viewport of SHORT) {
      const layout = layoutGame({ viewport, critters: critters(8), focus: 0, reading: true, statementHeight: 900, issued: 100, surface, scene });
      for (const puff of layout.trail) expect(puff.y, JSON.stringify(viewport)).toBeGreaterThanOrEqual(layout.statement.y + layout.statement.height);
    }
  });
});

it('shows the whole focused name on desktop, and chooses a short form only when needed',()=>{
 const group=critters(4);group[0]!.name='Alexandra Winterbourne';
 const layout=layoutGame({viewport:{width:1440,height:900},critters:group,focus:0,issued:100,...scattering('desktop')});expect(layout.slots[0]!.name).toBe('Alexandra Winterbourne');expect(layout.slots[0]!.tag.short).toBe(false);
});
