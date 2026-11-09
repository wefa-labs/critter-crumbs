/* The review's build steps 4 to 7 as built: the page behind Why nobody can peek, the links to it from the private step,
   the result step, the waiting screen and the results, the fingerprint's sentence, and How it works on the empty home.
   Run from the repository root with a mock stack (README.md, Build order):
     CAPTURE_BASE=http://127.0.0.1:5173 node docs/reviews/first-steps-2026-11/capture-why.mjs [outDir]
   (the default; a stack of your own on other ports works the same). Each image is one screen in the light look and the
   dark one, at 375 × 812 on the phone and 1280 × 800 on desktop (shown at half size). Sound is off throughout. The
   waiting screen and the results are the development gallery's fixtures (/dev/screens), drawn by the live components;
   the invite is a feast seeded for it (/api/dev/seed, gathering, which moves no clock); home is the store's own answer
   with no burrows in it. The store is not changed otherwise. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:5173';
const OUT = process.argv[2] ?? 'docs/reviews/first-steps-2026-11/images/why';
mkdirSync(OUT, { recursive: true });
const DEVICES = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 800 } };
const browser = await chromium.launch();

const seeded = await (async () => {
  const ctx = await browser.newContext({ baseURL: BASE });
  const response = await ctx.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  if (!response.ok()) throw new Error(`seed: ${response.status()}`);
  const { feasts } = await response.json();
  await ctx.close();
  return feasts[0].id;
})();

/* every screen in one look on one device */
async function shots(device, dark) {
  const viewport = DEVICES[device], phone = viewport.width < 900;
  const ctx = await browser.newContext({ baseURL: BASE, viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US' });
  await ctx.addInitScript(() => { localStorage.setItem('cc.sound.music', '0'); localStorage.setItem('cc.sound.effects', '0'); });
  const page = await ctx.newPage(), taken = {};
  page.setDefaultTimeout(120000);
  const settle = () => page.waitForTimeout(900);
  const take = async id => { await settle(); taken[id] = await page.screenshot({ type: 'png' }); };
  const heading = name => page.getByRole('heading', { name, exact: true }).first().waitFor();

  await page.goto('/how-it-works/why'); await heading('Why nobody can peek'); await take('why');
  await page.locator('.why-page').evaluate(node => { node.scrollTop = node.scrollHeight; });
  await take('why-end');
  /* the steps from the launcher, through to the private step and the result */
  await page.goto('/'); await page.getByRole('link', { name: 'How it works', exact: true }).click();
  await heading('Everyone gets the same handful');
  for (let step = 1; step < 3; step++) await page.getByRole('button', { name: 'Next', exact: true }).click();
  await heading('Three phases, two deadlines'); await take('step-3');
  await page.getByRole('button', { name: 'Next', exact: true }).click(); await heading('Where they go stays private'); await take('step-4');
  await page.getByRole('button', { name: 'Next', exact: true }).click(); await heading('When the feast opens'); await take('step-5');
  /* the invite, signed out, whose How it works now centres its words in its target as the launcher's does */
  await page.goto(`/feasts/${seeded}`); await page.getByRole('button', { name: 'Connect to join', exact: true }).waitFor(); await take('invite');
  await page.goto('/dev/screens?capture&state=waiting&count=8&scene=dusk'); await heading('The feast is being laid out'); await take('waiting');
  await page.goto('/dev/screens?capture&state=results&count=8&scene=window'); await page.getByRole('link', { name: 'Why nobody can peek', exact: true }).waitFor(); await take('results');
  const fingerprint = page.locator('.results-fingerprint summary').first();
  await fingerprint.scrollIntoViewIfNeeded(); await fingerprint.click();
  /* to the end of the list, clear of the fade at its foot */
  await page.locator('.results-fingerprint').first().evaluate(node => { let box = node.parentElement; while (box && !(box.scrollHeight > box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement; if (box) box.scrollTop = box.scrollHeight; });
  await take('fingerprint');
  /* home with no burrows, as the store answers it for a member who has none */
  await page.route('**/api/me', async route => {
    const response = await route.fetch();
    if (route.request().method() !== 'GET' || !response.ok()) { await route.fulfill({ response }); return; }
    await route.fulfill({ response, json: { ...await response.json(), burrows: [] } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: 'Rehearsal critter 8', exact: true }).click();
  const keep = page.getByRole('button', { name: 'Keep this one', exact: true }), empty = page.getByRole('heading', { name: 'No burrows yet', exact: true });
  await keep.or(empty).first().waitFor();
  if (await keep.isVisible()) await keep.click();
  await empty.waitFor(); await take('home-empty');
  await ctx.close();
  return taken;
}

/* one image: the light look and the dark one, side by side, each under its label */
async function compose(file, device, panels) {
  const scale = device === 'desktop' ? .5 : 1, { width, height } = DEVICES[device];
  const ctx = await browser.newContext({ viewport: { width: Math.round(panels.length * (width * scale + 24) + 24), height: Math.round(height * scale + 80) }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const figures = panels.map(([label, png]) => `<figure><figcaption>${label}</figcaption><img width="${width * scale}" height="${height * scale}" src="data:image/png;base64,${png.toString('base64')}"></figure>`).join('');
  await page.setContent(`<style>body{margin:0;padding:24px 24px 0;display:flex;gap:24px;background:#E9E4DA;font:600 14px system-ui,sans-serif;color:#2E2226}figure{margin:0}figcaption{margin:0 0 10px}img{display:block;border-radius:8px;box-shadow:0 1px 4px rgb(0 0 0 / .18)}</style>${figures}`);
  await page.screenshot({ path: `${OUT}/${file}.jpg`, type: 'jpeg', quality: 78 });
  await ctx.close();
}

for (const device of Object.keys(DEVICES)) {
  const light = await shots(device, false), dark = await shots(device, true);
  for (const id of Object.keys(light)) await compose(`${id}-${device}`, device, [['Light', light[id]], ['Dark', dark[id]]]);
  console.log(device, Object.keys(light).join(' '));
}
await browser.close();
