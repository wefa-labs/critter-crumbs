import {test,expect,type Page,type Locator} from 'playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {connectLocal} from '../e2e/session.js';
const pointers=new WeakMap<Page,{x:number;y:number}>();
async function point(page:Page,target:Locator){const box=(await target.boundingBox())!,from=pointers.get(page)??{x:0,y:0},to={x:box.x+box.width/2,y:box.y+box.height/2};for(let step=1;step<=24;step++){await page.mouse.move(from.x+(to.x-from.x)*step/24,from.y+(to.y-from.y)*step/24);await page.waitForTimeout(16);}pointers.set(page,to);await page.waitForTimeout(250);}
async function tap(page:Page,target:Locator){await point(page,target);await page.mouse.down();await page.waitForTimeout(120);await page.mouse.up();}
const hold=(page:Page,ms=2000)=>page.waitForTimeout(ms);
for(const viewport of [{width:390,height:844},{width:1440,height:900}])test(`record ${viewport.width<900?'phone':'desktop'} rehearsal`,async({browser,request})=>{
 const device=viewport.width<900?'phone':'desktop',config=await request.get('/api/dev/config');expect(await config.json()).toMatchObject({enabled:true,mode:'mock',production:false});
 const seeded=await request.post('/api/dev/seed',{data:{kind:'people',phase:'scattering'}});expect(seeded.ok()).toBe(true);const {feasts}=await seeded.json(),feast=feasts[0];
 await mkdir('.scratch/demo',{recursive:true});
 const context=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport,recordVideo:{dir:'.scratch/demo/raw',size:viewport}}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));let allowKey=()=>{};
 await page.addInitScript(()=>{addEventListener('DOMContentLoaded',()=>{const cursor=document.createElement('div');cursor.setAttribute('aria-hidden','true');Object.assign(cursor.style,{position:'fixed',width:'14px',height:'14px',border:'2px solid var(--cc-text)',borderRadius:'50%',background:'var(--cc-bg)',boxShadow:'var(--cc-shadow-1)',pointerEvents:'none',zIndex:'99999',left:'0',top:'0',translate:'-50% -50%'});document.body.append(cursor);addEventListener('mousemove',event=>{cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;});});});
 try{
  await page.goto(`/feasts/${feast.id}`);await connectLocal(page,8,'Juniper',async target=>{await tap(page,target);await hold(page,1500);});await expect(page.getByRole('heading',{name:'Statements are open',exact:true})).toBeVisible();await hold(page,2200);
  await tap(page,page.getByRole('button',{name:'Start reading',exact:true}));await expect(page.locator('.statement-panel')).toBeVisible();await tap(page,page.locator('.statement-heading button'));
  await tap(page,page.locator('.thought-target'));await hold(page,2500);
  await tap(page,page.locator('.statement-navigation button').last());await hold(page,2500);await tap(page,page.locator('.statement-heading button'));
  // Give on the newly focused critter; the person's own sleeping critter stays outside this action.
  const give=page.locator('.scatter-controls [data-give="true"]');for(let i=0;i<3;i++){await tap(page,give);await hold(page,450);}await hold(page,1500);
  await point(page,give);await page.mouse.down();await hold(page,1300);await page.mouse.up();await hold(page,1800);
  await tap(page,page.locator('.scatter-controls [data-give="false"]'));await hold(page,1800);
  await tap(page,page.locator('.dock-turn').last());await hold(page,1700);if(await page.locator('.number-field input').isDisabled())await tap(page,page.locator('.dock-turn').last());
  await point(page,page.locator('.scatter-controls [data-give="true"]'));await page.mouse.down();await expect(page.getByRole('button',{name:'Scatter These',exact:true})).toBeVisible({timeout:12000});await page.mouse.up();await hold(page,2100);
  await tap(page,page.getByRole('button',{name:'Scatter These',exact:true}));await expect(page.getByRole('dialog',{name:'Confirm your scatter'})).toBeVisible();await hold(page,2200);await tap(page,page.getByRole('dialog').getByRole('button',{name:'Scatter These',exact:true}));await expect(page.locator('.scatter-done')).toBeVisible();await hold(page,2500);
  const backgrounds=await Promise.allSettled(Array.from({length:7},(_,i)=>i+1).map(async index=>{const other=await browser.newContext({baseURL:'http://127.0.0.1:5173'}),background=await other.newPage();try{await background.goto('/dev/screens?capture&state=scatter');const receipt=await background.evaluate(async({index,feastId})=>{const modulePath='/src/dev/rehearsal.ts',module=await import(modulePath);return module.scatterRehearsal(index,feastId);},{index,feastId:feast.id});expect(receipt).toMatchObject({uid:expect.stringMatching(/^0x/)});}finally{await other.close();}}));for(const result of backgrounds)if(result.status==='rejected')throw result.reason;
  const keyGate=new Promise<void>(resolve=>{allowKey=resolve;});await page.route('**/api/feasts/*/key',async route=>{await keyGate;await route.continue();});
  await hold(page,2000);expect((await request.post('/api/dev/time',{data:{now:feast.scatteringEndsAt}})).ok()).toBe(true);await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.getByRole('heading',{name:'The feast is being laid out',exact:true})).toBeVisible();await hold(page,2200);
  expect((await request.post('/api/dev/release-key',{data:{identity:feast.registration.identity}})).ok()).toBe(true);allowKey();
  await expect(page.locator('[data-feast-beat]')).toBeVisible();await expect(page.getByRole('heading',{name:'Results',exact:true})).toBeVisible({timeout:15000});await hold(page,2500);
  // Let the audience see the rest of the ranked list, then the huddle's Clock-driven play.
  const list=page.locator('.game-results-scroll');await point(page,list);await page.mouse.wheel(0,260);await hold(page,2200);await page.mouse.wheel(0,-260);await hold(page,1800);
  await tap(page,page.getByRole('button',{name:'Replay Feast',exact:true}));await hold(page,7000);expect(errors).toEqual([]);
 }finally{allowKey();await page.unrouteAll({behavior:'ignoreErrors'});await context.close();}
 const raw=await page.video()!.path(),output=resolve(`.scratch/demo/${device}.mp4`);
 execFileSync('/opt/homebrew/bin/ffmpeg',['-y','-i',raw,'-an','-vf','fps=30','-c:v','libx264','-pix_fmt','yuv420p','-preset','fast','-crf','22','-movflags','+faststart',output],{stdio:'ignore'});
 await writeFile(`.scratch/demo/${device}-source.txt`,raw+'\n');
});
