/* Captures every screen of the app on the local mock stack, the gallery's core states and the flow page's mock frames,
   for the November 2026 UI audit. Run from the worktree root with the stack on 5173 and the flow page on 4185:
     node .scratch/ui-audit/capture.mjs [outDir]
   Images are JPEG at device pixel ratio 1 so the review folder stays small. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5173', FLOW = 'http://localhost:4185/';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images';
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log(...a);
const PHONE = { width: 375, height: 812 }, DESKTOP = { width: 1280, height: 800 };
const browser = await chromium.launch();

const context = (viewport, opts = {}) => browser.newContext({
  viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900,
  colorScheme: opts.dark ? 'dark' : 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE,
});
async function shot(page, name, opts = {}) {
  await page.waitForTimeout(opts.wait ?? 700);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 80, fullPage: !!opts.full });
  log('shot', name);
}
async function tryStep(name, fn) { try { await fn(); } catch (error) { log('FAILED', name, String(error.message).split('\n')[0]); } }
async function connect(page, index) {
  await page.getByRole('button', { name: /^Connect( to join)?$/ }).click();
  await page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true }).click();
  await page.getByRole('button', { name: 'Your critter and settings', exact: true }).waitFor();
}
async function keep(page) {
  const button = page.getByRole('button', { name: 'Keep this one', exact: true });
  if (await button.count()) await button.click();
  await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
}

/* ---- seed: one burrow of eight rehearsal critters, a people feast and an options feast, both gathering */
const seedContext = await context(PHONE);
const seeded = await seedContext.request.post('/api/dev/seed', { data: { kind: 'both', phase: 'gathering' } });
if (!seeded.ok()) throw new Error(`seed failed: ${seeded.status()}`);
const { burrowId, feasts } = await seeded.json();
const people = feasts.find(f => f.kind === 'people'), options = feasts.find(f => f.kind === 'options');
log('seeded burrow', burrowId, 'people', people.id, 'options', options.id);
await seedContext.close();

/* ---- A. before connecting */
for (const [tag, viewport, dark] of [['phone', PHONE, false], ['desktop', DESKTOP, false], ['phone-dark', PHONE, true]]) {
  const ctx = await context(viewport, { dark }), page = await ctx.newPage();
  await page.goto('/'); await page.getByRole('button', { name: 'Connect', exact: true }).waitFor();
  await shot(page, `a01-launcher-${tag}`);
  await tryStep('connect sheet', async () => {
    await page.getByRole('button', { name: 'Connect', exact: true }).click();
    await page.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).waitFor();
    await shot(page, `a02-connect-sheet-${tag}`);
    await page.keyboard.press('Escape');
  });
  await page.goto('/how-it-works'); await page.getByRole('heading', { level: 1 }).waitFor();
  const steps = dark ? 2 : 5;
  for (let i = 1; i <= steps; i++) { await shot(page, `a03-learn-${i}-${tag}`); if (i < steps) await page.getByRole('button', { name: 'Next', exact: true }).click(); }
  await page.goto(`/feasts/${people.id}`); await page.getByRole('button', { name: 'Connect to join', exact: true }).waitFor();
  await shot(page, `a04-invite-${tag}`);
  if (!dark) {
    await page.goto('/feasts/00000000-0000-4000-8000-00000000dead'); await page.getByText("There's no feast at this link").waitFor();
    await shot(page, `a05-missing-feast-${tag}`);
  }
  await ctx.close();
}

/* ---- B. connected as the burrow's creator */
for (const [tag, viewport, dark] of [['phone', PHONE, false], ['desktop', DESKTOP, false], ['phone-dark', PHONE, true]]) {
  const ctx = await context(viewport, { dark }), page = await ctx.newPage();
  await page.goto('/'); await connect(page, 1);
  await tryStep('meet', async () => {
    await page.getByRole('dialog', { name: 'Meet your critter' }).waitFor({ timeout: 5000 });
    await shot(page, `b01-meet-critter-${tag}`);
    if (tag === 'phone') { await page.getByRole('button', { name: /^Re-roll/ }).click(); await shot(page, `b01-meet-critter-rerolled-${tag}`); }
  });
  await keep(page);
  await page.getByRole('heading', { name: 'Your burrows' }).waitFor(); await shot(page, `b02-home-${tag}`);
  await page.goto(`/burrows/${burrowId}`); await page.getByRole('heading', { name: 'Rehearsal burrow' }).waitFor();
  await shot(page, `b03-burrow-${tag}`); await shot(page, `b03-burrow-${tag}-full`, { full: true });
  if (dark) { await ctx.close(); continue; }
  await tryStep('remove dialog', async () => {
    await page.getByRole('button', { name: /^Remove from burrow:/ }).first().click(); await page.getByRole('dialog').waitFor();
    await shot(page, `b04-remove-dialog-${tag}`); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  });
  await tryStep('leave dialog', async () => {
    await page.getByRole('button', { name: 'Leave this burrow', exact: true }).click(); await page.getByRole('dialog').waitFor();
    await shot(page, `b05-leave-dialog-${tag}`); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  });
  await page.goto('/burrows/new'); await page.getByRole('heading', { name: 'Start a burrow' }).waitFor(); await shot(page, `b06-create-burrow-${tag}`);
  await page.goto(`/burrows/${burrowId}/feasts/new`); await page.getByRole('heading', { name: 'Start a feast' }).waitFor();
  await shot(page, `b07-setup-${tag}`); await shot(page, `b07-setup-${tag}-full`, { full: true });
  await tryStep('setup options', async () => {
    await page.getByRole('radio', { name: /To options/ }).check(); await shot(page, `b08-setup-options-${tag}-full`, { full: true });
    await page.getByRole('radio', { name: /To people/ }).check();
  });
  if (tag === 'phone') await tryStep('draft', async () => {
    await page.getByLabel('Feast title').fill('Autumn split'); await page.getByLabel('What is this feast for?').fill('Sharing the autumn pot');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await page.getByText('Draft saved').waitFor();
    await shot(page, `b09-draft-${tag}`); await shot(page, `b09-draft-${tag}-full`, { full: true });
    await page.getByRole('button', { name: 'Open the feast', exact: true }).click(); await page.getByRole('dialog').waitFor();
    await shot(page, `b10-open-dialog-${tag}`); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  });
  await page.goto(`/feasts/${people.id}`); await page.getByRole('heading', { name: 'Our shared work' }).waitFor();
  await shot(page, `b11-gathering-${tag}`); await shot(page, `b11-gathering-${tag}-full`, { full: true });
  await tryStep('assistant prompt', async () => { await page.getByText('Start from your notes').click(); await shot(page, `b12-gathering-prompt-${tag}-full`, { full: true }); });
  if (tag === 'phone') {
    await tryStep('extend', async () => {
      await page.getByRole('button', { name: 'Extend gathering (once)' }).click(); await page.getByRole('dialog').waitFor();
      await shot(page, `b13-extend-dialog-${tag}`); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    });
    await tryStep('cancel feast', async () => {
      await page.getByRole('button', { name: 'Cancel this feast' }).click(); await page.getByRole('dialog').waitFor();
      await shot(page, `b14-cancel-dialog-${tag}`); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    });
  }
  await page.goto(`/feasts/${options.id}`); await page.getByRole('heading', { name: 'Our next projects' }).waitFor();
  await shot(page, `b15-gathering-options-${tag}`); await shot(page, `b15-gathering-options-${tag}-full`, { full: true });
  await tryStep('profile', async () => {
    await page.getByRole('button', { name: 'Your critter and settings', exact: true }).click(); await page.getByRole('dialog', { name: 'Your critter' }).waitFor();
    await shot(page, `b16-profile-${tag}`);
    await page.getByRole('dialog').getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('dialog', { name: 'Settings' }).waitFor();
    await shot(page, `b17-settings-${tag}`); await page.keyboard.press('Escape');
  });
  await ctx.close();
}

/* ---- C. the live game: scattering opens, then the feast (moves the stack's clock for everyone) */
{
  const ctx = await context(PHONE), page = await ctx.newPage();
  await ctx.request.post('/api/dev/time', { data: { now: people.gatheringEndsAt } });
  await page.goto(`/feasts/${people.id}`); await connect(page, 2); await keep(page);
  await page.getByRole('button', { name: 'Start reading', exact: true }).waitFor(); await shot(page, 'c01-reveal-live-phone', { wait: 1800 });
  await tryStep('reading', async () => {
    await page.getByRole('button', { name: 'Start reading', exact: true }).click(); await page.locator('.phone-statement').waitFor();
    await shot(page, 'c02-reading-live-phone');
  });
  await page.goto(`/feasts/${people.id}/scatter`); await page.locator('.game-dock').waitFor(); await shot(page, 'c03-scatter-live-phone');
  await tryStep('give', async () => {
    const plus = page.locator('button[data-give="true"]');
    for (let i = 0; i < 7; i++) await plus.click();
    await page.getByRole('button', { name: 'Next', exact: true }).click(); await plus.click(); await plus.click();
    await shot(page, 'c04-scatter-live-given-phone');
  });
  await tryStep('done and scattered', async () => {
    const field = page.locator('.focus-count input'); await field.focus(); await field.fill('100'); await field.press('Enter');
    await page.getByRole('button', { name: 'Scatter These', exact: true }).waitFor(); await shot(page, 'c05-done-live-phone');
    await page.getByRole('button', { name: 'Scatter These', exact: true }).click(); await page.getByRole('dialog').waitFor();
    await shot(page, 'c06-sign-live-phone');
    await page.getByRole('dialog').getByRole('button', { name: 'Scatter These', exact: true }).click();
    await page.getByText('Scattered.', { exact: true }).waitFor({ timeout: 15000 }); await shot(page, 'c07-scattered-live-phone', { wait: 400 });
  });
  await ctx.close();
  const dctx = await context(DESKTOP), dpage = await dctx.newPage();
  await dpage.goto(`/feasts/${people.id}`); await connect(dpage, 3); await keep(dpage);
  await dpage.getByRole('button', { name: 'Start reading', exact: true }).waitFor(); await shot(dpage, 'c08-reveal-live-desktop', { wait: 1800 });
  await dpage.goto(`/feasts/${people.id}/scatter`); await dpage.locator('.game-dock').waitFor(); await shot(dpage, 'c09-scatter-live-desktop');
  await dctx.close();
  /* the feast: scattering closes, the key is not out, then it is */
  await tryStep('feast', async () => {
    const fctx = await context(PHONE), fpage = await fctx.newPage();
    await fctx.request.post('/api/dev/time', { data: { now: people.scatteringEndsAt } });
    await fpage.goto(`/feasts/${people.id}`); await connect(fpage, 2);
    await fpage.getByText('The feast is being laid out').waitFor({ timeout: 15000 }); await shot(fpage, 'c10-waiting-live-phone', { wait: 2500 });
    const feast = await fpage.evaluate(async id => (await fetch(`/api/feasts/${id}`, { credentials: 'same-origin' })).json(), people.id);
    await fctx.request.post('/api/dev/release-key', { data: { identity: feast.registration.identity } });
    await fpage.reload(); await fpage.getByRole('button', { name: 'Results', exact: true }).waitFor({ timeout: 30000 });
    await shot(fpage, 'c11-results-live-phone', { wait: 1500 });
    await fctx.close();
  });
}

/* ---- D. the gallery's core states, phone and desktop */
{
  const states = ['reveal', 'scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed', 'closed', 'waiting', 'key', 'feast', 'feasted', 'results', 'nobody', 'tie', 'givers', 'recording', 'recorded', 'public'];
  for (const [tag, viewport] of [['phone', PHONE], ['desktop', DESKTOP]]) {
    const ctx = await context(viewport), page = await ctx.newPage();
    for (const state of states) await tryStep(`gallery ${state} ${tag}`, async () => {
      await page.goto(`/dev/screens?capture&count=8&state=${state}&scene=window`);
      await page.locator('.circle-spot').first().waitFor(); await page.waitForTimeout(300);
      await shot(page, `d-${state}-${tag}`, { wait: 400 });
    });
    await ctx.close();
  }
}

/* ---- E. the flow page's mock frames at true size, phone then desktop */
{
  for (const device of ['phone', 'desktop']) {
    const ctx = await browser.newContext({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 }), page = await ctx.newPage();
    await page.addInitScript(d => { try { localStorage.setItem('app-screens:view-1', JSON.stringify({ device: d, look: 'inked', show: 'all' })); } catch {} }, device);
    await page.goto(FLOW); await page.locator('#flow .shot').first().waitFor(); await page.waitForTimeout(1500);
    await page.addStyleTag({ content: '.frame{transform:none !important}' });
    const ids = await page.locator('#flow .shot').evaluateAll(nodes => nodes.map(n => n.id.slice(2)));
    log('flow page', device, ids.length, 'frames');
    for (const id of ids) await tryStep(`mock ${id} ${device}`, async () => {
      const frame = page.locator(`#s-${id} .frame`);
      await frame.scrollIntoViewIfNeeded(); await page.waitForTimeout(120);
      await frame.screenshot({ path: `${OUT}/mock-${id}-${device}.jpg`, type: 'jpeg', quality: 80 });
    });
    await ctx.close();
  }
}

await browser.close();
log('done');
