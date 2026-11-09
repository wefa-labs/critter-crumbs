/* Wave two, session E of the build (README.md, build order 10 to 12, decisions D8 and D9): each change beside its frame,
   on the flow page or, for the statement bubble, the scatter page. Adapted from capture-frame.mjs. Run from the
   repository root with the mock stack up (bun run dev:local, or any stack: CAPTURE_BASE) and the flow page on 4185
   (launch configuration app-screens, or CAPTURE_FLOW):
     node docs/reviews/ui-audit-2026-11/capture-feel.mjs [outDir]
   Each image is the frame, then the app in the light look and in the dark one, at 375 × 812 on the phone and
   1280 × 800 on desktop (shown at half size). The game's states come from the /dev/screens gallery; the invite seeds a
   feast; the notices and the offline band are shown on your critter's profile, the frame's screen this branch has, by
   a throwaway account whose profile is read with the ENS warning and whose responses run 12 minutes ahead of the
   device, as a skewed clock does. The stir is held at its middle. Reduced motion everywhere else, so frames compare. */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:5173', FLOW = process.env.CAPTURE_FLOW ?? 'http://localhost:4185/';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images/feel';
mkdirSync(OUT, { recursive: true });
const DEVICES = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 800 } };
const FLOW_IDS = ['launch', 'invite', 'waiting', 'key-not-yet', 'givers', 'recorded', 'offline', 'notices'];
const browser = await chromium.launch();
const log = (...a) => console.log(...a);
const context = (device, dark, motion = 'reduce') => {
  const viewport = DEVICES[device];
  return browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, colorScheme: dark ? 'dark' : 'light', reducedMotion: motion, timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE });
};
const settle = page => page.waitForTimeout(900);

/* the flow page's own frames at true size, in its Inked daylight look */
async function mockFrames(device) {
  const ctx = await browser.newContext({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 }), page = await ctx.newPage();
  await page.addInitScript(d => { try { localStorage.setItem('app-screens:view-1', JSON.stringify({ device: d, look: 'inked', show: 'all' })); } catch { /* the default view */ } }, device);
  await page.goto(FLOW); await page.locator('#flow .shot').first().waitFor(); await page.waitForTimeout(1500);
  await page.addStyleTag({ content: '.shots{grid-template-columns:1fr !important}.phone{--s:1 !important}.frame{transform:none !important}' });
  const shots = {};
  for (const id of FLOW_IDS) {
    const frame = page.locator(`#s-${id} .frame`);
    await frame.scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
    shots[id] = await frame.screenshot({ type: 'png' });
  }
  await ctx.close();
  return shots;
}

/* the scatter page's reading frame, the left half of the October comparison (docs/reviews/october-game/compare) */
async function scatterReading() {
  const ctx = await browser.newContext({ viewport: DEVICES.phone, deviceScaleFactor: 1 }), page = await ctx.newPage();
  const image = readFileSync('docs/reviews/october-game/compare/reading-phone.jpg').toString('base64');
  await page.setContent(`<style>body{margin:0;overflow:hidden}</style><img src="data:image/jpeg;base64,${image}">`);
  await page.locator('img').evaluate(img => img.decode());
  const shot = await page.screenshot({ type: 'png' });
  await ctx.close();
  return shot;
}

/* the game's states from the gallery; reading also steps on to Fern's short statement */
async function gallery(device, dark) {
  const ctx = await context(device, dark), page = await ctx.newPage(), shots = {};
  const open = async state => { await page.goto(`/dev/screens?capture&state=${state}&count=8&scene=window`); await page.locator('.circle-spot').first().waitFor(); await settle(page); };
  for (const state of ['waiting', 'key', 'results', 'givers']) { await open(state); shots[state] = await page.screenshot({ type: 'png' }); }
  await open('reading'); shots.readingLong = await page.screenshot({ type: 'png' });
  if (device === 'phone') { await page.locator('.dock-turn').last().click(); await page.locator('.statement-scroll', { hasText: 'library shelves' }).waitFor(); await settle(page); }
  shots.readingShort = await page.screenshot({ type: 'png' });
  await ctx.close();
  return shots;
}

/* the launcher and a feast's invite, each with a sleeper stirred and held at the middle of its stir */
async function floors(device, dark, feastId) {
  const ctx = await context(device, dark, 'no-preference'), page = await ctx.newPage(), shots = {};
  const stirred = async scope => {
    const sleeper = page.locator(`${scope} .floor-critter`).filter({ has: page.locator('.portrait[data-asleep="true"]') }).first();
    await sleeper.locator('.portrait__head').first().dispatchEvent('pointerdown', { isPrimary: true, button: 0, bubbles: true });
    await page.evaluate(() => { for (const animation of document.getAnimations()) { animation.pause(); animation.currentTime = animation.id === 'floor-stir' ? 420 : 0; } });
    await page.waitForTimeout(200);
  };
  await page.goto('/'); await page.locator('.launch-scene .floor-critter').first().waitFor(); await settle(page);
  await stirred('.launch-scene'); shots.launch = await page.screenshot({ type: 'png' });
  await page.goto(`/feasts/${feastId}`); await page.locator('.invite-plate .scene-plate').waitFor(); await settle(page);
  shots.invite = await page.screenshot({ type: 'png' });
  await stirred('.screen-floor'); shots.inviteStir = await page.screenshot({ type: 'png' });
  await ctx.close();
  return shots;
}

/* the notices and the offline band on your critter's profile: a throwaway account, its profile read with the ENS
   warning and its responses 12 minutes ahead of the device */
async function notices(device, dark, key) {
  const account = privateKeyToAccount(key), ctx = await context(device, dark), page = await ctx.newPage(), shots = {};
  await page.route('**/api/**', async route => {
    const response = await route.fetch(), url = route.request().url();
    let json; try { json = await response.json(); } catch { await route.fulfill({ response }); return; }
    if (url.endsWith('/api/dev/config')) json = { ...json, enabled: false };
    if (url.endsWith('/api/me') && route.request().method() === 'GET' && response.ok()) json = { ...json, displayName: 'Juniper', critterLocked: true, warning: 'err.ensUnavailable' };
    if (Number.isSafeInteger(json.serverNow)) json = { ...json, serverNow: json.serverNow + 12 * 60000 };
    await route.fulfill({ response, json });
  });
  await page.exposeFunction('captureSign', message => account.signMessage({ message: { raw: message } }));
  await page.addInitScript(({ address }) => {
    window.ethereum = { async request({ method, params }) {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [address];
      if (method === 'personal_sign') return window.captureSign(params[0]);
      if (method === 'eth_chainId') return '0x14a34';
      throw new Error(`Unexpected capture RPC: ${method}`);
    } };
  }, { address: account.address });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: 'This browser', exact: true }).click();
  await page.getByRole('button', { name: 'Your critter and settings', exact: true }).click();
  const profile = page.getByRole('region', { name: 'Your critter', exact: true });
  await profile.waitFor(); await profile.locator('.screen-notices .sheet-notice').nth(1).waitFor(); await settle(page);
  shots.notices = await page.screenshot({ type: 'png' });
  await ctx.setOffline(true); await page.locator('.offline-band').waitFor(); await settle(page);
  shots.offline = await page.screenshot({ type: 'png' });
  await ctx.setOffline(false);
  await ctx.close();
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

const seeder = await browser.newContext({ baseURL: BASE });
const seeded = await seeder.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
if (!seeded.ok()) throw new Error(`Seeding failed: ${seeded.status()}`);
const feastId = (await seeded.json()).feasts[0].id;
await seeder.close();
const reading = await scatterReading();
for (const device of Object.keys(DEVICES)) {
  const mocks = await mockFrames(device), key = generatePrivateKey();
  const light = { ...await gallery(device, false), ...await floors(device, false, feastId), ...await notices(device, false, key) };
  const dark = { ...await gallery(device, true), ...await floors(device, true, feastId), ...await notices(device, true, key) };
  const beside = (id, mock, shot = id) => compose(`${id}-${device}`, device, [[mock[0], mock[1]], ['App, light', light[shot]], ['App, dark', dark[shot]]]);
  if (device === 'phone') {
    await compose('reading-phone', device, [['Scatter page', reading], ['App, a long statement', light.readingLong], ['App, a short one, light', light.readingShort], ['App, a short one, dark', dark.readingShort]]);
  } else {
    await compose('reading-desktop', device, [['App, light (the side panel, unchanged)', light.readingLong], ['App, dark', dark.readingLong]]);
  }
  await beside('results', ['Flow page, 49', mocks.recorded]);
  await beside('givers', ['Flow page, 47', mocks.givers]);
  await beside('waiting', ['Flow page, 42', mocks.waiting]);
  await beside('key', ['Flow page, 43', mocks['key-not-yet']]);
  await beside('launch', ['Flow page, 1', mocks.launch]);
  await beside('invite', ['Flow page, 2', mocks.invite]);
  await beside('invite-stir', ['Flow page, 2', mocks.invite], 'inviteStir');
  await beside('notices', ['Flow page, 53', mocks.notices]);
  await beside('offline', ['Flow page, 52', mocks.offline]);
}
await browser.close();
log('done');
