import {test,expect,type Page,type Locator} from 'playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {connectLocal} from '../e2e/session.js';
const pointers=new WeakMap<Page,{x:number;y:number}>();
async function point(page:Page,target:Locator){await target.scrollIntoViewIfNeeded();const box=(await target.boundingBox())!,from=pointers.get(page)??{x:0,y:0},to={x:box.x+box.width/2,y:box.y+box.height/2};for(let step=1;step<=24;step++){await page.mouse.move(from.x+(to.x-from.x)*step/24,from.y+(to.y-from.y)*step/24);await page.waitForTimeout(16);}pointers.set(page,to);await page.waitForTimeout(250);}
async function tap(page:Page,target:Locator){await point(page,target);await page.mouse.down();await page.waitForTimeout(120);await page.mouse.up();}
const hold=(page:Page,ms=2000)=>page.waitForTimeout(ms);
test.use({timezoneId:'America/Los_Angeles',locale:'en-US'});
/* Juniper, rehearsal critter 8, through the October game: the statements open, reading, scattering by tap, pour, take
   back and typed amount, confirming, the close, the feast, the results and a replay. 60–90 s at 30 fps. */
for(const viewport of [{width:390,height:844},{width:1440,height:900}])test(`record ${viewport.width<900?'phone':'desktop'} rehearsal`,async({browser,request})=>{
 const device=viewport.width<900?'phone':'desktop',phone=device==='phone',config=await request.get('/api/dev/config');expect(await config.json()).toMatchObject({enabled:true,mode:'mock',production:false});
 const seeded=await request.post('/api/dev/seed',{data:{kind:'people',phase:'scattering'}});expect(seeded.ok()).toBe(true);const {feasts}=await seeded.json(),feast=feasts[0];
 // The burrow's other seven scatter before the camera rolls, so the film is Juniper's turn without the wait.
 const backgrounds=await Promise.allSettled(Array.from({length:7},(_,i)=>i+1).map(async index=>{const other=await browser.newContext({baseURL:'http://127.0.0.1:5173'}),background=await other.newPage();try{await background.goto('/dev/screens?capture&state=scatter');const receipt=await background.evaluate(async({index,feastId})=>{const modulePath='/src/dev/rehearsal.ts',module=await import(modulePath);return module.scatterRehearsal(index,feastId);},{index,feastId:feast.id});expect(receipt).toMatchObject({uid:expect.stringMatching(/^0x/)});}finally{await other.close();}}));for(const result of backgrounds)if(result.status==='rejected')throw result.reason;
 await mkdir('.scratch/demo',{recursive:true});
 const context=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport,timezoneId:'America/Los_Angeles',locale:'en-US',recordVideo:{dir:'.scratch/demo/raw',size:viewport}}),page=await context.newPage(),errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));let allowKey=()=>{};
 await page.addInitScript(()=>{addEventListener('DOMContentLoaded',()=>{const cursor=document.createElement('div');cursor.setAttribute('aria-hidden','true');Object.assign(cursor.style,{position:'fixed',width:'14px',height:'14px',border:'2px solid var(--cc-text)',borderRadius:'50%',background:'var(--cc-bg)',boxShadow:'var(--cc-shadow-1)',pointerEvents:'none',zIndex:'99999',left:'0',top:'0',translate:'-50% -50%'});document.body.append(cursor);addEventListener('mousemove',event=>{cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;});});});
 try{
  // Statements open: the circle wakes, every critter but Juniper's own thinking.
  await page.goto(`/feasts/${feast.id}`);await connectLocal(page,8,'Juniper',async target=>{await tap(page,target);await hold(page,900);});await expect(page.getByRole('heading',{name:'Statements are open',exact:true})).toBeVisible();await hold(page,2200);
  await tap(page,page.getByRole('button',{name:'Start reading',exact:true}));
  // Reading: on the phone the statement opens as a thought bubble and the dock steps through the circle; desktop keeps it in the side panel.
  if(phone){await expect(page.locator('.phone-statement')).toBeVisible();await hold(page,2200);await tap(page,page.locator('.dock-turn').last());await hold(page,2000);await tap(page,page.locator('.phone-statement .statement-close'));await hold(page,600);await tap(page,page.locator('.thought-target'));await expect(page.locator('.phone-statement')).toBeVisible();await hold(page,1600);await tap(page,page.locator('.phone-statement .statement-close'));}
  else{await expect(page.locator('.panel-statement')).toBeVisible();await hold(page,2200);await tap(page,page.locator('.dock-turn').last());await hold(page,2000);await tap(page,page.locator('.dock-turn').last());await hold(page,1500);}
  // Scattering: a tap gives a crumb that flies from the heap, holding pours, − takes one back.
  if(await page.locator('.focus-count input').count()===0)await tap(page,page.locator('.dock-turn').last());
  const give=page.locator('.focus-row [data-give="true"]');for(let i=0;i<3;i++){await tap(page,give);await hold(page,400);}await hold(page,1000);
  await point(page,give);await page.mouse.down();await hold(page,1300);await page.mouse.up();await hold(page,1400);
  await tap(page,page.locator('.focus-row [data-give="false"]'));await hold(page,1200);
  // The next critter takes the rest as a typed amount (Game Design §2.6), and Scatter These appears.
  await tap(page,page.locator('.dock-turn').last());await hold(page,1000);if(await page.locator('.focus-count input').count()===0)await tap(page,page.locator('.dock-turn').last());
  const amount=page.locator('.focus-count input');await tap(page,amount);await page.keyboard.type('100',{delay:120});await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Scatter These',exact:true})).toBeVisible();await hold(page,1500);
  // Confirming costs nothing; the saved scatter says so at the top of the floor.
  await tap(page,page.getByRole('button',{name:'Scatter These',exact:true}));await expect(page.getByRole('dialog',{name:'Confirm your scatter'})).toBeVisible();await hold(page,1600);await tap(page,page.getByRole('dialog').getByRole('button',{name:'Scatter These',exact:true}));await expect(page.locator('.dock-scattered')).toBeVisible();await hold(page,2400);
  // Scattering closes: the circle sleeps at dusk while the feast is laid out, then wakes and grows.
  const keyGate=new Promise<void>(resolve=>{allowKey=resolve;});await page.route('**/api/feasts/*/key',async route=>{await keyGate;await route.continue();});
  // The deadline passes with the screen open: it stops at dusk, every critter asleep, before the feast is laid out (flow 41, 42).
  await hold(page,600);expect((await request.post('/api/dev/time',{data:{now:feast.scatteringEndsAt-2500}})).ok()).toBe(true);await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('.dock-closed')).toBeVisible({timeout:10000});await expect(page.getByRole('heading',{name:'The feast is being laid out',exact:true})).toBeVisible({timeout:10000});await hold(page,2000);
  expect((await request.post('/api/dev/release-key',{data:{identity:feast.registration.identity}})).ok()).toBe(true);allowKey();
  await expect(page.locator('[data-feast-beat]')).toBeVisible();await expect(page.getByRole('heading',{name:'Results',exact:true})).toBeVisible({timeout:15000});await hold(page,2200);
  // Results: the ranked list, then the huddle's Clock-driven play; closed, everyone stands grown with their totals.
  const list=page.locator('.results-scroll');await point(page,list);await page.mouse.wheel(0,phone?320:260);await hold(page,1400);await page.mouse.wheel(0,-(phone?320:260));await hold(page,1000);
  if(phone){await tap(page,page.locator('.results-card .statement-close'));await hold(page,1800);await tap(page,page.getByRole('button',{name:'Results',exact:true}));await hold(page,1000);}
  await tap(page,page.getByRole('button',{name:'Replay Feast',exact:true}));await hold(page,5000);expect(errors).toEqual([]);
 }finally{allowKey();await page.unrouteAll({behavior:'ignoreErrors'});await context.close();}
 const raw=await page.video()!.path(),output=resolve(`.scratch/demo/${device}.mp4`);
 execFileSync('/opt/homebrew/bin/ffmpeg',['-y','-i',raw,'-an','-vf','fps=30','-c:v','libx264','-pix_fmt','yuv420p','-preset','fast','-crf','22','-movflags','+faststart',output],{stdio:'ignore'});
 await writeFile(`.scratch/demo/${device}-source.txt`,raw+'\n');
 // The film itself is checked, not only the run: H.264, yuv420p, 30 fps, at the viewport, 60–90 s.
 const probe=execFileSync('/opt/homebrew/bin/ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height,r_frame_rate:format=duration','-of','json',output]).toString(),{streams:[stream],format}=JSON.parse(probe);
 expect(stream).toMatchObject({codec_name:'h264',pix_fmt:'yuv420p',width:viewport.width,height:viewport.height,r_frame_rate:'30/1'});
 expect(Number(format.duration)).toBeGreaterThanOrEqual(60);expect(Number(format.duration)).toBeLessThanOrEqual(90);
});
