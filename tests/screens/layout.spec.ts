import { expect, test } from 'playwright/test';
/* Design pass §21's tolerances at every focus: scattering (tags with counts, the heap) and the circle after the feast
   (tags with totals, no heap). A tag never covers another tag, the heap or the dock; a neighbour only at 1280 desktop
   (161 px²) and at ten critters on the phone (123 px²). */
for(const state of ['scatter','feasted'])for(const viewport of [{width:375,height:812},{width:430,height:932},{width:1280,height:800},{width:1440,height:900},{width:1920,height:1080}])for(const count of [4,6,8,10])test(`${state} circle ${viewport.width} with ${count} critters`,async({page})=>{
 await page.setViewportSize(viewport);await page.goto(`/dev/screens?capture&count=${count}&state=${state}`);await expect(page.locator('.circle-spot')).toHaveCount(count);
 for(let focus=0;focus<count;focus++){
  const metrics=await page.evaluate(()=>{
   const rect=(node:Element)=>node.getBoundingClientRect();const overlap=(a:DOMRect,b:DOMRect)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
   const heapNode=document.querySelector('[data-heap]'),tagNodes=[...document.querySelectorAll('[data-tag]')],tags=tagNodes.map(rect),figures=[...document.querySelectorAll('.circle-spot')].map(node=>{const svg=node.querySelector<SVGSVGElement>('.portrait')!,box=rect(svg),left=Number(svg.dataset.left),right=Number(svg.dataset.right),top=Number(svg.dataset.top);return new DOMRect(box.x+left*box.width,box.y+top*box.height,(right-left)*box.width,box.height*(140/150-top));}),heap=heapNode?rect(heapNode):new DOMRect(0,0,0,0),dock=rect(document.querySelector('.game-dock')!);
   return {tags:tags.length,heap:!!heapNode,tagCritter:Math.max(0,...tags.flatMap((tag,i)=>figures.filter((_,j)=>j!==Number(tagNodes[i]!.getAttribute('data-tag'))).map(figure=>overlap(tag,figure)))),heapCritter:Math.max(0,...figures.map(figure=>overlap(heap,figure))),heapDock:overlap(heap,dock),tagHeap:Math.max(0,...tags.map(tag=>overlap(tag,heap))),tagDock:Math.max(0,...tags.map(tag=>overlap(tag,dock))),tagPairs:Math.max(0,...tags.flatMap((tag,i)=>tags.slice(i+1).map(other=>overlap(tag,other)))),targets:[...document.querySelectorAll('.core-game button')].filter(node=>rect(node).width>0).map(node=>({w:rect(node).width,h:rect(node).height}))};
  });
  expect(metrics.heap).toBe(state==='scatter');expect(metrics.tags).toBeGreaterThan(0);
  expect(metrics.tagCritter).toBeLessThanOrEqual(viewport.width===1280?161:viewport.width<900&&count===10?123:0);expect(metrics.heapCritter).toBe(0);expect(metrics.heapDock).toBe(0);expect(metrics.tagHeap).toBe(0);expect(metrics.tagDock).toBe(0);expect(metrics.tagPairs).toBe(0);for(const target of metrics.targets){expect(target.w).toBeGreaterThanOrEqual(44);expect(target.h).toBeGreaterThanOrEqual(44);}
  await page.locator('.dock-turn').last().click();
 }
});
