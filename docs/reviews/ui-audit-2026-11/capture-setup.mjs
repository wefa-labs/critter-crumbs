/* Start a feast, splitting a budget and too few critters, each beside its frame on the flow page, for wave two of the
   build (README.md, build order 8; screens 23 to 25). Adapted from capture-frame.mjs. Run from the repository root
   with a mock stack (bun run dev:local on 5173, or another of your own whose address is BASE) and the flow page on
   4185 (launch configuration app-screens, or another address as FLOW):
     BASE=http://127.0.0.1:5175 node docs/reviews/ui-audit-2026-11/capture-setup.mjs [outDir]
   Each image is the flow page's frame, then the app in the light look and in the dark one, at 375 × 812 on the phone
   and 1280 × 800 on desktop (shown at half size). The seeded burrow's owner, rehearsal critter 1, starts a feast in
   the seeded burrow of eight and in a burrow of two made for the purpose, filled in as the flow page fills them and
   scrolled to where its frames are. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173', FLOW = process.env.FLOW ?? 'http://localhost:4185/';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images/frame';
mkdirSync(OUT, { recursive: true });
const DEVICES = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 800 } };
const SCREENS = ['setup', 'setup-options', 'setup-few'];
/* the flow page's own words (SCREENS.setup, setupSheet) */
const PEOPLE = ['Our shared work', 'What each of us did for the garden and the library this season.'];
const BUDGET = ['Autumn budget', 'How we split the 2,000 left in the shared fund.'];
const OPTIONS = [['Knowledge Commons', 'The shared library, the seed bank and the wiki.'], ['Garden tools', 'Replacing the hose, the wheelbarrow and the pruning saws.'], ['Community lunch', 'Ingredients for the monthly lunch.']];
const browser = await chromium.launch();
const log = (...a) => console.log(...a);

/* the seeded burrow of eight, whose owner is rehearsal critter 1 */
const seeding = await browser.newContext({ baseURL: BASE });
const seeded = await seeding.request.post('/api/dev/seed', { data: { kind: 'options', phase: 'draft' } });
if (!seeded.ok()) throw new Error(`seed failed: ${seeded.status()}`);
const { burrowId } = await seeded.json();
await seeding.close();
let pairId = null;

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

/* the app: the burrow of eight, for people and then for options, then the burrow of two */
async function appShots(device, dark) {
  const viewport = DEVICES[device];
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE });
  const page = await ctx.newPage(), shots = {};
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).click();
  const keep = page.getByRole('button', { name: 'Keep this one', exact: true });
  await keep.or(page.getByRole('button', { name: 'Your critter and settings', exact: true })).first().waitFor();
  if (await keep.isVisible()) { await keep.click(); await keep.waitFor({ state: 'detached' }); }
  pairId ??= await page.evaluate(async () => {
    const write = async (path, body) => (await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
    const { id } = await write('/api/burrows', { name: 'Garden council' });
    await write(`/api/burrows/${id}/members`, { address: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF' });
    return id;
  });
  const words = page.locator('.place-words');
  async function open(id, [title, context]) {
    await page.goto(`/burrows/${id}/feasts/new`);
    await page.getByRole('textbox', { name: 'Feast title', exact: true }).fill(title);
    await page.getByLabel('What is this feast for?').fill(context);
  }
  async function shoot(scroll) {
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await words.evaluate(scroll);
    await page.waitForTimeout(800);
    return page.screenshot({ type: 'png' });
  }
  await open(burrowId, PEOPLE);
  shots.setup = await shoot(list => { list.scrollTop = 0; });
  await open(burrowId, BUDGET);
  await page.getByRole('radio', { name: 'To options', exact: true }).check();
  for (const [index, [name, line]] of OPTIONS.entries()) {
    if (index) await page.getByRole('button', { name: 'Add an option', exact: true }).click();
    await page.getByRole('textbox', { name: 'Option name', exact: true }).nth(index).fill(name);
    await page.getByRole('textbox', { name: 'What this option is', exact: true }).nth(index).fill(line);
  }
  /* the flow page's frame starts at the two kinds of feast */
  shots['setup-options'] = await shoot(list => { list.scrollTop += list.querySelector('.choices').getBoundingClientRect().top - list.getBoundingClientRect().top; });
  await open(pairId, PEOPLE);
  shots['setup-few'] = await shoot(list => { list.scrollTop = list.scrollHeight; });
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
  const mocks = await mockFrames(device);
  const light = await appShots(device, false), dark = await appShots(device, true);
  for (const id of SCREENS) await compose(`${id}-${device}`, device, [['Flow page', mocks[id]], ['App, light', light[id]], ['App, dark', dark[id]]]);
}
await browser.close();
log('done');
