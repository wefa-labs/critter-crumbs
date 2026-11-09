/* The feast's pages before scattering, each beside its frame on the flow page, for wave two of the build (README.md,
   build order 6, 8 and 10; screens 26 and 28 to 33). Adapted from capture-frame.mjs. Run from the repository root with a
   mock stack and the flow page served, by default this worktree's own (Vite on 5183 proxying a mock API with its own
   data, and `python3 -m http.server 4195 --directory docs/explorations/app-screens`):
     BASE=http://127.0.0.1:5183 FLOW=http://127.0.0.1:4195/ node docs/reviews/ui-audit-2026-11/capture-feast.mjs [outDir]
   Each image is the flow page's frame where it draws the screen, then the app in the light look and in the dark one, at
   375 × 812 on the phone and 1280 × 800 on desktop (shown at half size). It seeds its own burrows through /api/dev/seed
   and moves the stack's clock past one gathering deadline for the late joiner, so run it on a stack of your own. The
   gathering captures show three of the eight statements written, as the flow page does: the seed writes all eight, so
   the feast's answer is trimmed on its way to the page. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5183', FLOW = process.env.FLOW ?? 'http://127.0.0.1:4195/';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images/feast';
mkdirSync(OUT, { recursive: true });
const DEVICES = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 800 } };
/* each app screen, and the flow page's frame it is compared with: its own, or the nearest where the flow page draws none */
const SCREENS = { gathering: 'gathering', 'gathering-more': 'gathering-more', 'gathering-options': 'gathering-options', draft: 'draft', extend: 'extend', 'cancel-feast': 'cancel-feast', late: 'late', 'not-in-burrow': 'unknown', 'no-feast': 'unknown', void: 'offline', cancelled: null };
const browser = await chromium.launch();
const log = (...a) => console.log(...a);

/* the flow page's own frames at true size, in its Inked daylight look */
async function mockFrames(device) {
  const ctx = await browser.newContext({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 }), page = await ctx.newPage();
  await page.addInitScript(d => { try { localStorage.setItem('app-screens:view-1', JSON.stringify({ device: d, look: 'inked', show: 'all' })); } catch { /* the default view */ } }, device);
  await page.goto(FLOW); await page.locator('#flow .shot').first().waitFor(); await page.waitForTimeout(1500);
  await page.addStyleTag({ content: '.shots{grid-template-columns:1fr !important}.phone{--s:1 !important}.frame{transform:none !important}' });
  const shots = {};
  for (const id of new Set(Object.values(SCREENS).filter(Boolean))) {
    const frame = page.locator(`#s-${id} .frame`);
    await frame.scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
    shots[id] = await frame.screenshot({ type: 'png' });
  }
  await ctx.close();
  return shots;
}

const write = (page, path, method = 'POST', body) => page.evaluate(async ([target, verb, data]) => (await fetch(target, { method: verb, credentials: 'same-origin', ...(data === undefined ? {} : { body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }) })).status, [path, method, body]);
const seed = async (page, data) => (await page.request.post('/api/dev/seed', { data })).json();

/* connects as a rehearsal critter from the launcher, keeping the critter the first time it is met */
async function connect(page, index) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true }).click();
  await page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true }).waitFor({ state: 'detached' });
  let me = await page.evaluate(async () => { const response = await fetch('/api/me', { credentials: 'same-origin' }); return response.ok ? response.json() : null; });
  for (let tries = 0; !me && tries < 20; tries++) { await page.waitForTimeout(250); me = await page.evaluate(async () => { const response = await fetch('/api/me', { credentials: 'same-origin' }); return response.ok ? response.json() : null; }); }
  if (me && !me.critterLocked) { await page.getByRole('button', { name: 'Keep this one', exact: true }).click(); await page.locator('.first-meeting').waitFor({ state: 'detached' }); }
}

async function context(device, dark) {
  const viewport = DEVICES[device];
  return browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE });
}
const settle = page => page.waitForTimeout(900);

async function appShots(device, dark) {
  const shots = {}, ctx = await context(device, dark), page = await ctx.newPage();
  await connect(page, 1);
  /* gathering, with three of the eight statements written as on the flow page: the viewer's and the first two others' */
  const people = (await seed(page, { kind: 'people', phase: 'gathering' })).feasts[0];
  await page.route(`**/api/feasts/${people.id}`, async route => {
    const response = await route.fetch(), feast = await response.json();
    if (feast.participation) {
      const own = feast.targets.find(target => target.ownerAddress?.toLowerCase() === feast.createdBy.toLowerCase()).id;
      feast.participation.written = [own, ...feast.targets.map(target => target.id).filter(id => id !== own).slice(0, 2)];
    }
    await route.fulfill({ response, json: feast });
  });
  await page.goto(`/feasts/${people.id}`); await page.locator('.feast-gathering').waitFor(); await settle(page);
  shots.gathering = await page.screenshot({ type: 'png' });
  await page.locator('.place-words').evaluate(words => { words.scrollTop = words.scrollHeight; }); await settle(page);
  shots['gathering-more'] = await page.screenshot({ type: 'png' });
  await page.getByRole('button', { name: 'Extend gathering (once)', exact: true }).click(); await settle(page);
  shots.extend = await page.screenshot({ type: 'png' });
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel this feast', exact: true }).click(); await settle(page);
  shots['cancel-feast'] = await page.screenshot({ type: 'png' });
  await page.getByRole('dialog').getByRole('button', { name: 'Back', exact: true }).click();
  await page.unroute(`**/api/feasts/${people.id}`);
  const options = (await seed(page, { kind: 'options', phase: 'gathering' })).feasts[0];
  await page.goto(`/feasts/${options.id}`); await page.locator('.feast-gathering').waitFor(); await settle(page);
  shots['gathering-options'] = await page.screenshot({ type: 'png' });
  for (const [phase, name, selector] of [['draft', 'draft', '.feast-draft'], ['cancelled', 'cancelled', '.feast-ended'], ['void', 'void', '.feast-ended']]) {
    const feast = (await seed(page, { kind: 'people', phase })).feasts[0];
    await page.goto(`/feasts/${feast.id}`); await page.locator(selector).waitFor(); await settle(page);
    shots[name] = await page.screenshot({ type: 'png' });
  }
  await page.goto('/feasts/00000000-0000-4000-8000-000000000000'); await page.locator('.feast-nowhere').waitFor(); await settle(page);
  shots['no-feast'] = await page.screenshot({ type: 'png' });
  /* Willow (8) leaves while gathering: not in the burrow; scattering opens without Willow, and Moss (1) adds Willow back */
  const lateCtx = await context(device, dark), late = await lateCtx.newPage();
  await connect(late, 8);
  const { burrowId, feasts, accounts } = await seed(page, { kind: 'people', phase: 'gathering' }), feast = feasts[0];
  if (await write(late, `/api/burrows/${burrowId}/leave`) !== 200) throw new Error('Willow could not leave');
  await late.goto(`/feasts/${feast.id}`); await late.locator('.feast-nowhere').waitFor(); await settle(late);
  shots['not-in-burrow'] = await late.screenshot({ type: 'png' });
  await page.request.post('/api/dev/time', { data: { now: feast.gatheringEndsAt + 60000 } });
  await page.goto(`/feasts/${feast.id}`); await page.getByRole('button', { name: 'Start reading', exact: true }).waitFor();
  if (await write(page, `/api/burrows/${burrowId}/members`, 'POST', { address: accounts[7].address }) !== 200) throw new Error('Willow could not be added back');
  if (await write(late, `/api/burrows/${burrowId}/join`) !== 200) throw new Error('Willow could not join');
  await late.goto(`/feasts/${feast.id}`); await late.locator('.feast-late').waitFor(); await settle(late);
  shots.late = await late.screenshot({ type: 'png' });
  await lateCtx.close(); await ctx.close();
  return shots;
}

/* one image: the frame, the light look and the dark one, side by side, each under its label */
async function compose(file, device, panels) {
  const scale = device === 'desktop' ? .5 : 1, { width, height } = DEVICES[device];
  const ctx = await browser.newContext({ viewport: { width: Math.round(panels.length * (width * scale + 24) + 24), height: Math.round(height * scale + 80) }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const figures = panels.map(([label, png]) => `<figure><figcaption>${label}</figcaption><img width="${width * scale}" height="${height * scale}" src="data:image/png;base64,${png.toString('base64')}"></figure>`).join('');
  await page.setContent(`<style>body{margin:0;padding:24px 24px 0;display:flex;gap:24px;background:#E9E4DA;font:600 14px system-ui,sans-serif;color:#2E2226}figure{margin:0}figcaption{margin:0 0 10px}img{display:block;border-radius:8px;box-shadow:0 1px 4px rgb(0 0 0/.2)}</style>${figures}`);
  await page.screenshot({ path: `${OUT}/${file}.jpg`, type: 'jpeg', quality: 82 });
  await ctx.close();
  log('composed', file);
}

for (const device of Object.keys(DEVICES)) {
  const mocks = await mockFrames(device), light = await appShots(device, false), dark = await appShots(device, true);
  for (const [id, frame] of Object.entries(SCREENS)) {
    const label = frame === id ? 'Flow page' : `Flow page (nearest: ${frame})`;
    await compose(`${id}-${device}`, device, [...(frame ? [[label, mocks[frame]]] : []), ['App, light', light[id]], ['App, dark', dark[id]]]);
  }
}
await browser.close();
log('done');
