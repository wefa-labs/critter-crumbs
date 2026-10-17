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
   const critters=members.slice(0,count).map((member,i)=>({name:member.name,own:i===2,count:i===2?0:12,extent:portraitMetrics(generate2(member.address,0)).extent}));
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
    expect(layout.dock.height).toBe(250);
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

it('shows the whole focused name on desktop, and chooses a short form only when needed',()=>{
 const group=critters(4);group[0]!.name='Alexandra Winterbourne';
 const layout=layoutGame({viewport:{width:1440,height:900},critters:group,focus:0,issued:100,...scattering('desktop')});expect(layout.slots[0]!.name).toBe('Alexandra Winterbourne');expect(layout.slots[0]!.tag.short).toBe(false);
});
