/* The app shell keeps its chrome in the viewport and scrolls inside <main>, so a full-page screenshot shows one screen
   of a long page. This pass lets the shell grow for the long connected pages and captures them whole, on a fresh seed
   so the feasts are still gathering whatever the stack's clock says now. Run after capture.mjs:
     node .scratch/ui-audit/capture-long.mjs [outDir] */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5173';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images';
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log(...a);
const PHONE = { width: 375, height: 812 }, DESKTOP = { width: 1280, height: 800 };
const browser = await chromium.launch();
const context = viewport => browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, colorScheme: 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE });
async function grow(page) {
  await page.evaluate(() => {
    const root = document.querySelector('#root.app-shell'), main = document.querySelector('#root.app-shell > main');
    if (root) { root.style.height = 'auto'; root.style.overflow = 'visible'; }
    if (main) { main.style.overflow = 'visible'; main.style.minHeight = '0'; }
  });
}
async function shot(page, name) { await grow(page); await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 80, fullPage: true }); log('shot', name); }
async function tryStep(name, fn) { try { await fn(); } catch (error) { log('FAILED', name, String(error.message).split('\n')[0]); } }
async function connect(page, index) {
  await page.getByRole('button', { name: /^Connect( to join)?$/ }).click();
  await page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true }).click();
  await page.getByRole('button', { name: 'Your critter and settings', exact: true }).waitFor();
  const keep = page.getByRole('button', { name: 'Keep this one', exact: true });
  if (await keep.count()) await keep.click();
  await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
}

const seedContext = await context(PHONE);
const seeded = await seedContext.request.post('/api/dev/seed', { data: { kind: 'both', phase: 'gathering' } });
if (!seeded.ok()) throw new Error(`seed failed: ${seeded.status()}`);
const { burrowId, feasts } = await seeded.json();
const people = feasts.find(f => f.kind === 'people'), options = feasts.find(f => f.kind === 'options');
log('seeded burrow', burrowId);
await seedContext.close();

for (const [tag, viewport] of [['phone', PHONE], ['desktop', DESKTOP]]) {
  const ctx = await context(viewport), page = await ctx.newPage();
  await page.goto('/'); await connect(page, 1);
  await page.goto(`/burrows/${burrowId}`); await page.getByRole('heading', { name: 'Rehearsal burrow' }).waitFor(); await shot(page, `long-burrow-${tag}`);
  await page.goto(`/burrows/${burrowId}/feasts/new`); await page.getByRole('heading', { name: 'Start a feast' }).waitFor(); await shot(page, `long-setup-${tag}`);
  await tryStep('options', async () => { await page.getByRole('radio', { name: /To options/ }).check(); await shot(page, `long-setup-options-${tag}`); await page.getByRole('radio', { name: /To people/ }).check(); });
  await tryStep('draft', async () => {
    await page.getByLabel('Feast title').fill('Autumn split'); await page.getByLabel('What is this feast for?').fill('Sharing the autumn pot');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await page.getByText('Draft saved').waitFor(); await shot(page, `long-draft-${tag}`);
  });
  await page.goto(`/feasts/${people.id}`); await page.getByRole('heading', { name: 'Our shared work' }).waitFor(); await shot(page, `long-gathering-${tag}`);
  await tryStep('prompt', async () => { await page.getByText('Start from your notes').click(); await shot(page, `long-gathering-prompt-${tag}`); });
  await page.goto(`/feasts/${options.id}`); await page.getByRole('heading', { name: 'Our next projects' }).waitFor(); await shot(page, `long-gathering-options-${tag}`);
  await ctx.close();
}
/* a member who is not the creator: gathering without the creator's actions, and the burrow without Remove */
{
  const ctx = await context(PHONE), page = await ctx.newPage();
  await page.goto('/'); await connect(page, 4);
  await page.goto(`/feasts/${people.id}`); await page.getByRole('heading', { name: 'Our shared work' }).waitFor(); await shot(page, 'long-gathering-member-phone');
  await page.goto(`/burrows/${burrowId}`); await page.getByRole('heading', { name: 'Rehearsal burrow' }).waitFor(); await shot(page, 'long-burrow-member-phone');
  await ctx.close();
}
await browser.close();
log('done');
