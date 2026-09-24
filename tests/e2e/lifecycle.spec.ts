import { test, expect, type Page } from 'playwright/test';
import { readFile } from 'node:fs/promises';
import { connectLocal, readJson } from './session.js';

async function submit(page:Page, replacement=false) {
 await page.getByRole('button',{name:replacement?'Change my scatter':'Scatter these',exact:true}).click();
 await page.getByRole('dialog',{name:'Confirm your scatter'}).getByRole('button',{name:'Scatter these',exact:true}).click();
 await expect(page.locator('.scatter-done')).toBeFocused();
}
for(const kind of ['people','options'] as const)for(const simple of [true,false])test(`${kind} lifecycle in ${simple?'Simple view':'3D'} opens independently and exports the latest scatter`,async({browser,request},testInfo)=>{
 test.setTimeout(120000);
 const seeded=await request.post('http://127.0.0.1:5173/api/dev/seed',{data:{kind,phase:'gathering'}});expect(seeded.ok()).toBe(true);const {feasts}=await seeded.json(),feast=feasts[0];
 const contexts=await Promise.all([1,2].map(()=>browser.newContext({viewport:{width:375,height:812}})));
 try{
  for(const context of contexts)await context.addInitScript(value=>localStorage.setItem('cc.view.simple',value?'1':'0'),simple);
  const pages=await Promise.all(contexts.map(context=>context.newPage())),[first,second]=pages as [Page,Page],errors:string[]=[],requests:string[]=[];
  for(const page of pages){page.on('pageerror',error=>errors.push(error.message));page.on('request',value=>requests.push(value.url()));}
  for(const [i,page]of pages.entries()){await page.goto(`http://127.0.0.1:5173/feasts/${feast.id}`);await connectLocal(page,i+1);}
  const text='A concrete contribution for this rehearsal.\nhttps://example.com/notes';
  const editor=first.locator('.statement-editor textarea').first();await editor.fill(text);await first.locator('.statement-editor').first().getByRole('button',{name:'Save statement'}).click();await expect(first.getByText('Saved.',{exact:true}).first()).toBeVisible();
  await expect(second.getByText('A concrete contribution for this rehearsal.',{exact:false})).toHaveCount(0);
  await first.request.post('/api/dev/time',{data:{now:feast.gatheringEndsAt}});
  await first.goto(`http://127.0.0.1:5173/feasts/${feast.id}/read`);await expect(first.locator('.statement-text').filter({hasText:'A concrete contribution'})).toBeVisible();
  expect(requests.some(url=>/(?:\/three\/|\/three[-.]|@react-three)/.test(url))).toBe(false);
  for(const [i,page]of pages.entries()){
   await page.goto(`http://127.0.0.1:5173/feasts/${feast.id}/scatter`);
   await page.getByRole('button',{name:'Disconnect',exact:true}).click();await connectLocal(page,i+1);
   if(simple)await expect(page.locator('canvas')).toHaveCount(0);else await expect(page.locator('[data-mesh="ready"]').first()).toBeVisible();
   const inputs=page.locator('.number-field input');await inputs.nth(0).fill('100');await inputs.nth(0).press('Enter');await submit(page);
  }
  const inputs=first.locator('.number-field input');await inputs.nth(0).fill('60');await inputs.nth(0).press('Enter');await inputs.nth(1).fill('40');await inputs.nth(1).press('Enter');await submit(first,true);
  const {body:updated}=await readJson<{ownReceipts:unknown[];registration:{identity:string}}>(first,`/api/feasts/${feast.id}`);expect(updated.ownReceipts).toHaveLength(2);
  await first.screenshot({path:testInfo.outputPath('scatter-375.png'),fullPage:true});
  await first.request.post('/api/dev/time',{data:{now:feast.scatteringEndsAt}});
  await first.request.post('/api/dev/release-key',{data:{identity:updated.registration.identity}});
  for(const page of pages){await page.reload();await expect(page.locator('[data-result-hash]')).toBeVisible();const skip=page.getByRole('button',{name:'Skip to results',exact:true});if(await skip.isVisible())await skip.press('Enter');await expect(page.getByRole('heading',{name:'Results',exact:true})).toBeFocused();await expect(page.locator('h1')).toHaveCount(1);}
  const hash=await first.locator('[data-result-hash]').getAttribute('data-result-hash');expect(hash).toMatch(/^0x[0-9a-f]{64}$/);await expect(second.locator('[data-result-hash]')).toHaveAttribute('data-result-hash',hash!);
  await expect(first.getByText('2 of 8 scattered · 200 crumbs in all',{exact:true})).toBeVisible();
  const downloadPromise=first.waitForEvent('download');await first.getByRole('button',{name:'Download CSV',exact:true}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/^feast-.+-results\.csv$/);const path=await download.path();const csv=await readFile(path!,'utf8');expect(csv).toContain('critter,address,crumbs,share\r\n');expect(csv.trim().split('\r\n')).toHaveLength(feast.targets.length+1);
  await first.screenshot({path:testInfo.outputPath('results-375.png'),fullPage:true});expect(errors).toEqual([]);
 }finally{for(const context of contexts)await context.close();}
});
