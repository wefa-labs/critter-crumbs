import { describe, expect, it } from 'vitest';
import { generate2 } from '@critter-crumbs/core';
import members from '../src/dev/game-members.js';
import { portraitMetrics } from '../src/portraits/metrics.js';
import { layoutGame, overlapArea } from '../src/game/layout.js';
const names = ['Moss','Fern','Juniper','Clover','Acorn','Hazel Montgomery','Pebble','Willow','Bramble','Sorrel'];
const critters = (n: number) => names.slice(0,n).map(name=>({name,own:name==='Juniper',count:12,extent:{top:.28,left:.2,right:.8,headY:.48,headRadius:.17}}));
describe('October circle layout',()=>{
 it('places the focused critter on the reference desktop floor',()=>{
  const layout=layoutGame({viewport:{width:1280,height:800},critters:critters(8),focus:0,state:'scatter',issued:100});
  expect(layout.scene.width).toBe(880);
  expect(layout.slots[0]!.foot).toEqual({x:440,y:592});
  expect(layout.slots[0]!.stage.width).toBe(248);
  expect(layout.dock.height).toBe(130);
 });
 it('keeps the heap and every visible tag above the dock at supported sizes',()=>{
  for(const [width,height] of [[375,812],[390,844],[430,932],[1280,800],[1440,900],[1920,1080]])for(const n of [4,6,8,10])for(let focus=0;focus<n;focus++){
   const layout=layoutGame({viewport:{width:width!,height:height!},critters:critters(n),focus,state:'scatter',issued:100});
   expect(layout.heap.y+layout.heap.height).toBeLessThanOrEqual(layout.dock.y);
   for(const slot of layout.slots)if(!slot.tag.hidden){expect(slot.tag.x).toBeGreaterThanOrEqual(0);expect(slot.tag.y).toBeGreaterThanOrEqual(0);expect(slot.tag.y+slot.tag.height).toBeLessThanOrEqual(layout.dock.y);expect(overlapArea(slot.tag,layout.heap)).toBe(0);}
  }
 });
 it('keeps centred review tags clear of the thought bubble and piles',()=>{
  for(const viewport of [{width:375,height:812},{width:1280,height:800},{width:1440,height:900}])for(const count of [4,6,8,10])for(let focus=0;focus<count;focus++){
   const critters=members.slice(0,count).map((member,i)=>({name:member.name,own:i===2,count:i===2?0:12,extent:portraitMetrics(generate2(member.address,0)).extent}));
   const layout=layoutGame({viewport,critters,focus,state:'scatter',issued:100});
   for(const slot of layout.slots)if(!slot.tag.hidden){expect(overlapArea(slot.tag,layout.bubble),JSON.stringify({viewport,count,focus,slot:slot.index})).toBe(0);for(const other of layout.slots)if(other.slot!==0)expect(overlapArea(slot.tag,other.pile)).toBe(0);const desired=slot.foot.x-slot.tag.width/2;expect(slot.tag.x).toBe(Math.min(Math.max(desired,6),layout.scene.width-6-slot.tag.width));}
  }
 });

});
