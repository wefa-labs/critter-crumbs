import { expect, test } from 'playwright/test';
for (const size of [{width:390,height:844},{width:1440,height:900}]) test(`October foundation ${size.width}`,async({page})=>{
 await page.setViewportSize(size);await page.goto('/dev/screens?capture&state=scatter');
 await expect(page.locator('.circle-spot')).toHaveCount(8);await expect(page.locator('.circle-spot .portrait-v2')).toHaveCount(8);
 // The Window scene is one painted plate made for the device, under the look's wash and grain.
 await expect(page.locator('.scene-plate')).toHaveCSS('background-image',size.width<900?/window-plate-phone\.webp/:/window-plate-desktop\.webp/);
 await expect(page.locator('.scene-backdrop > .scene-wash')).toHaveCount(1);await expect(page.locator('.scene-backdrop > .scene-grain')).toHaveCount(1);
 await page.screenshot({path:`.scratch/screens/foundation-${size.width}.png`});
});

// A plate's wall ends above the circle's back row on every screen, a short in-app browser included: nobody stands on
// the wall, the plate still covers the scene, and its picture has arrived.
const SCREENS=[{width:390,height:844},{width:390,height:664},{width:375,height:667},{width:430,height:932},{width:900,height:700},{width:1280,height:800},{width:1920,height:1080}];
for (const scene of ['window','dusk']) for (const size of SCREENS) test(`${scene} plate at ${size.width} x ${size.height}: the wall ends above the back row`,async({page})=>{
 await page.setViewportSize(size);
 for (const count of [4,7,10]) {
  await page.goto(`/dev/screens?capture&state=scatter&count=${count}&scene=${scene}`);
  await expect(page.locator('.circle-spot')).toHaveCount(count);await expect(page.locator('.scene-plate')).toHaveCount(1);
  const seen=await page.evaluate(async({id,desktop})=>{
   const plate=document.querySelector<HTMLElement>('.scene-plate')!,box=plate.getBoundingClientRect(),floor=document.querySelector('.game-scene')!.getBoundingClientRect();
   const manifest=await (await fetch('/scenes/manifest.json')).json() as {id:string;devices:Record<string,{image:string;aspect:number;wallFoot:number}>}[];
   const device=manifest.find(entry=>entry.id===id)!.devices[desktop?'desktop':'phone']!;
   const width=await new Promise<number>(done=>{const image=new Image();image.onload=()=>done(image.naturalWidth);image.onerror=()=>done(0);image.src=device.image;});
   // the stage's foot line (game/layout.ts: a stage stands 140/150 of its height above its feet)
   const feet=[...document.querySelectorAll('.circle-spot')].map(spot=>{const stage=spot.getBoundingClientRect();return stage.top+stage.height*140/150;});
   return {shows:getComputedStyle(plate).backgroundImage.includes(device.image),width,wallFoot:box.top+device.wallFoot*Math.max(box.height,box.width/device.aspect),backRow:Math.min(...feet),plate:{top:box.top,bottom:box.bottom},floor:{top:floor.top,bottom:floor.bottom}};
  },{id:scene,desktop:size.width>=900});
  const label=`${count} critters`;
  expect(seen.shows,label).toBe(true);expect(seen.width,label).toBeGreaterThan(0);
  expect(seen.wallFoot,label).toBeLessThanOrEqual(seen.backRow-7);
  expect(seen.plate.top,label).toBeLessThanOrEqual(seen.floor.top+0.5);expect(seen.plate.bottom,label).toBeGreaterThanOrEqual(seen.floor.bottom-0.5);
 }
});
