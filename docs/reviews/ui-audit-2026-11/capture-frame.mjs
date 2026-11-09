/* The first meeting, a kept critter being named and your critter's profile, each beside its frame on the flow page, for
   wave one of the build (README.md, build order 3, 7 and 9). Adapted from capture.mjs. Run from the repository root
   with the mock stack on 5173 (bun run dev:local) and the flow page on 4185 (launch configuration app-screens):
     node docs/reviews/ui-audit-2026-11/capture-frame.mjs [outDir]
   Each image is the flow page's frame, then the app in the light look and in the dark one, at 375 × 812 on the phone
   and 1280 × 800 on desktop (shown at half size). The app is reached as a new member would reach it: a throwaway
   account connects through "This browser", and the profile it reads is shown unkept and unnamed until it keeps its
   critter, so the light and dark captures meet the same critter and the stack's rehearsal critters keep their state. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const BASE = 'http://127.0.0.1:5173', FLOW = 'http://localhost:4185/';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images/frame';
mkdirSync(OUT, { recursive: true });
const DEVICES = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 800 } };
const SCREENS = ['meet', 'name', 'profile'];
const browser = await chromium.launch();
const log = (...a) => console.log(...a);

/* the flow page's own frames at true size, in its Inked daylight look */
async function mockFrames(device) {
  const ctx = await browser.newContext({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 }), page = await ctx.newPage();
  await page.addInitScript(d => { try { localStorage.setItem('app-screens:view-1', JSON.stringify({ device: d, look: 'inked', show: 'all' })); } catch { /* the default view */ } }, device);
  await page.goto(FLOW); await page.locator('#flow .shot').first().waitFor(); await page.waitForTimeout(1500);
  /* one frame to a row, at its own size: the page's grid otherwise scales a desktop frame down to fit a column */
  await page.addStyleTag({ content: '.shots{grid-template-columns:1fr !important}.phone{--s:1 !important}.frame{transform:none !important}' });
  const shots = {};
  for (const id of SCREENS) {
    const frame = page.locator(`#s-${id} .frame`);
    await frame.scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
    shots[id] = await frame.screenshot({ type: 'png' });
  }
  await ctx.close();
  return shots;
}

/* the app: the first meeting with a name typed, the kept critter asked only for its name, then the profile */
async function appShots(device, dark, key) {
  const viewport = DEVICES[device], account = privateKeyToAccount(key);
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE });
  const page = await ctx.newPage(), shots = {};
  let kept = false, nameOnly = false;
  await page.route('**/api/dev/config', async route => { const response = await route.fetch(); await route.fulfill({ response, json: { ...await response.json(), enabled: false } }); });
  await page.route('**/api/me', async route => {
    const response = await route.fetch();
    if (route.request().method() === 'PUT') { if (route.request().postDataJSON().keepCritter) kept = true; await route.fulfill({ response }); return; }
    if (!response.ok()) { await route.fulfill({ response }); return; }
    const profile = await response.json();
    await route.fulfill({ response, json: nameOnly ? { ...profile, ensName: null, displayName: null, critterLocked: true } : kept ? profile : { ...profile, ensName: null, displayName: null, critterLocked: false } });
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
  const meeting = page.getByRole('region', { name: 'Meet your critter', exact: true });
  await meeting.waitFor();
  await meeting.getByRole('textbox', { name: 'Display name', exact: true }).fill('Juniper');
  await page.locator('body').click({ position: { x: 1, y: 1 } }).catch(() => {});
  await page.waitForTimeout(800);
  shots.meet = await page.screenshot({ type: 'png' });
  await meeting.getByRole('button', { name: 'Keep this one', exact: true }).click();
  await meeting.waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Your critter and settings', exact: true }).click();
  await page.getByRole('region', { name: 'Your critter', exact: true }).waitFor(); await page.waitForTimeout(800);
  shots.profile = await page.screenshot({ type: 'png' });
  nameOnly = true;
  await page.goto('/');
  const naming = page.getByRole('region', { name: 'What should the burrow call you?', exact: true });
  await naming.waitFor();
  await naming.getByRole('textbox', { name: 'Display name', exact: true }).fill('Juniper');
  await page.locator('body').click({ position: { x: 1, y: 1 } }).catch(() => {});
  await page.waitForTimeout(800);
  shots.name = await page.screenshot({ type: 'png' });
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

for (const device of Object.keys(DEVICES)) {
  const mocks = await mockFrames(device), key = generatePrivateKey();
  const light = await appShots(device, false, key), dark = await appShots(device, true, key);
  for (const id of SCREENS) await compose(`${id}-${device}`, device, [['Flow page', mocks[id]], ['App, light', light[id]], ['App, dark', dark[id]]]);
}
await browser.close();
log('done');
