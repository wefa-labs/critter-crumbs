import {test,expect} from 'playwright/test';
const states=['reveal','scatter','reading','done','scattered','signing','saving','rejected','failed','closed','waiting','key','feast','results','nobody','tie','givers','recording','recorded','public'];
for(const viewport of [{width:390,height:844},{width:1440,height:900}])for(const state of states)test(`${state} at ${viewport.width}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize(viewport);await page.goto(`/dev/screens?capture&count=8&state=${state}`);await expect(page.locator('.circle-spot')).toHaveCount(8);await expect(page.locator('.portrait-v2')).toHaveCount((state==='public'?8:9)+(states.indexOf(state)>=13&&!['nobody','givers'].includes(state)?8:0));
 await page.waitForTimeout(400);await page.screenshot({path:`.scratch/screens/${state}-${viewport.width}.png`});expect(errors).toEqual([]);
 const targets=await page.locator('.core-game button,.core-game a,.core-game summary,.core-game input').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect()).filter(box=>box.width>0).map(box=>({width:box.width,height:box.height})));for(const box of targets){expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
 if(['results','tie','givers','recording','recorded'].includes(state)){await expect(page.getByRole('button',{name:'Replay Feast',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Download CSV',exact:true})).toBeVisible();}
 if(state==='tie'){await expect(page.getByText('Only Fern scattered.',{exact:true})).toBeAttached();await expect(page.getByText('Moss, Clover tied.',{exact:true})).toBeAttached();}
});
