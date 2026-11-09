/* Home and the burrow's screens, each beside its frame on the flow page, for wave two of the build (README.md, build
   order 4 and 5). Adapted from capture-frame.mjs. Run from the repository root with a mock stack and the flow page:
     CAPTURE_BASE=http://127.0.0.1:5173 CAPTURE_FLOW=http://localhost:4185/ node docs/reviews/ui-audit-2026-11/capture-burrows.mjs [outDir]
   (both are the defaults; a stack of your own on other ports works the same). Each image is the flow page's frame, then
   the app in the light look and in the dark one, at 375 × 812 on the phone and 1280 × 800 on desktop (shown at half
   size). It seeds one burrow (/api/dev/seed, gathering, which moves no clock) and connects as its eighth critter,
   Juniper, the flow page's viewer. Each screen's state is the seeded burrow's own answers shaped in the browser, as
   capture-frame.mjs shapes /api/me: a scattering feast with five of eight scattered, the flow page's two past feasts,
   a burrow of one, a member not yet joined, a removal, and a burrow that does not know you. The store is not changed. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.CAPTURE_BASE ?? 'http://127.0.0.1:5173', FLOW = process.env.CAPTURE_FLOW ?? 'http://localhost:4185/';
const OUT = process.argv[2] ?? 'docs/reviews/ui-audit-2026-11/images/home-and-burrow';
mkdirSync(OUT, { recursive: true });
const DEVICES = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 800 } };
const SCREENS = ['home', 'home-empty', 'burrow-new', 'burrow-fresh', 'burrow-join', 'burrow', 'who-scattered', 'burrow-quiet', 'members', 'remove', 'leave', 'unknown'];
const DAY = 86400000, HOUR = 3600000;
/* burrows the store does not have, answered in the browser: the Garden council (quiet), a new one (fresh), one that does not know you */
const QUIET = '00000000-0000-4000-8000-0000000000c1', FRESH = '00000000-0000-4000-8000-0000000000f1', UNKNOWN = '00000000-0000-4000-8000-0000000000e1';
const MISSING = '00000000-0000-4000-8000-000000000000';
const browser = await chromium.launch();
const log = (...a) => console.log(...a);

/* the flow page's own frames at true size, in its Inked daylight look */
async function mockFrames(device) {
  const ctx = await browser.newContext({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 }), page = await ctx.newPage();
  await page.addInitScript(d => { try { localStorage.setItem('app-screens:view-1', JSON.stringify({ device: d, look: 'inked', show: 'all' })); } catch { /* the default view */ } }, device);
  await page.goto(FLOW); await page.locator('#flow .shot').first().waitFor(); await page.waitForTimeout(1500);
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

/* The seeded burrow as each screen shows it. `view` is the store's own answer for the seeded burrow. */
function burrowAs(state, view, me) {
  const now = view.serverNow, you = me.toLowerCase(), byName = name => view.members.find(member => member.displayName === name);
  const people = view.feasts.filter(feast => feast.status === 'open');
  const scattering = people.map(feast => ({ ...feast, gatheringEndsAt: now - HOUR, scatteringEndsAt: now + 2 * DAY }));
  const past = [
    { id: '00000000-0000-4000-8000-0000000000a1', title: 'Spring shares', status: 'open', gatheringEndsAt: now - 30 * DAY, scatteringEndsAt: now - 27 * DAY, participantsFrozenAt: now - 30 * DAY, participants: [] },
    { id: '00000000-0000-4000-8000-0000000000a2', title: 'Tool budget', status: 'cancelled', gatheringEndsAt: now - 60 * DAY, scatteringEndsAt: now - 57 * DAY, participantsFrozenAt: null, participants: [] },
  ];
  const yours = view.members.filter(member => member.address.toLowerCase() === you);
  if (state === 'quiet') return { ...view, id: QUIET, name: 'Garden council', createdBy: me, feasts: [], removals: [], members: [...view.members.filter(member => member.address.toLowerCase() !== you).slice(0, 4), ...yours] };
  if (state === 'fresh') return { ...view, id: FRESH, name: 'Garden council', createdBy: me, feasts: [], removals: [], members: yours };
  if (state === 'join') return { ...view, feasts: [...scattering, ...past], members: view.members.filter(member => member !== byName('Willow')).map(member => member.address.toLowerCase() === you ? { ...member, joinedAt: null } : member) };
  if (state === 'members') {
    const bramble = { ...byName('Acorn'), address: '0x5C1B26E7d3a8F0e4A9b2c1D7E6f5a4B3c2D1BA3E', displayName: 'Bramble', variant: 1, joinedAt: now - 90 * DAY, leftAt: now - 64 * DAY };
    const fern = byName('Fern');
    return { ...view, createdBy: me, feasts: [...scattering, ...past], members: [...view.members.map(member => member === byName('Willow') ? { ...member, joinedAt: null } : member), bramble],
      removals: [{ id: '00000000-0000-4000-8000-0000000000d1', sequence: '1', operationId: '00000000-0000-4000-8000-0000000000d2', action: 'remove', actorAddress: fern.address, address: bramble.address, membershipVersion: 1, actorName: 'Fern', memberName: 'Bramble', removedAt: now - 64 * DAY }] };
  }
  return { ...view, feasts: [...scattering, ...past] };
}

/* the app: each screen in turn, as Juniper, with the answers shaped for it */
async function appShots(device, dark, seed) {
  const viewport = DEVICES[device];
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce', timezoneId: 'America/Los_Angeles', locale: 'en-US', baseURL: BASE });
  const page = await ctx.newPage(), shots = {};
  /* a busy machine is slow to paint a critter */
  page.setDefaultTimeout(120000);
  const juniper = seed.accounts.find(account => account.name === 'Juniper').address;
  const scattered = ['Moss', 'Fern', 'Juniper', 'Clover', 'Hazel'].map(name => seed.accounts.find(account => account.name === name).address);
  let state = 'burrow', burrows = 'two';
  await page.route('**/api/me', async route => {
    const response = await route.fetch();
    if (route.request().method() !== 'GET' || !response.ok()) { await route.fulfill({ response }); return; }
    const me = await response.json();
    await route.fulfill({ response, json: { ...me, burrows: burrows === 'none' ? [] : [{ id: seed.burrowId, name: 'Rehearsal burrow' }, { id: QUIET, name: 'Garden council' }] } });
  });
  await page.route(/\/api\/burrows\/[^/]+$/, async route => {
    if (route.request().method() !== 'GET') { await route.continue(); return; }
    const id = route.request().url().split('/').pop();
    if (id === MISSING) { await route.continue(); return; }
    /* the store's answer for the seeded burrow, asked with the page's own session */
    const response = await route.fetch({ url: `${BASE}/api/burrows/${seed.burrowId}` }), view = await response.json();
    if (id === UNKNOWN) { await route.fulfill({ status: 403, json: { error: 'burrow.unknown.title', detail: { burrowName: 'Rehearsal burrow' }, serverNow: view.serverNow } }); return; }
    await route.fulfill({ response, json: burrowAs(id === QUIET ? 'quiet' : id === FRESH ? 'fresh' : state, view, juniper) });
  });
  await page.route(/\/api\/feasts\/[^/]+$/, async route => {
    const response = await route.fetch();
    if (route.request().method() !== 'GET' || !response.ok()) { await route.fulfill({ response }); return; }
    const feast = await response.json();
    await route.fulfill({ response, json: { ...feast, participants: seed.accounts.map(account => account.address), participation: { ...feast.participation, scattered } } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: 'Rehearsal critter 8', exact: true }).click();
  const keep = page.getByRole('button', { name: 'Keep this one', exact: true }), face = page.getByRole('button', { name: 'Your critter and settings', exact: true });
  await keep.or(face).first().waitFor();
  if (await keep.isVisible()) { await keep.click(); await face.waitFor(); }
  /* the focus stays where the screen puts it, as the flow page draws a field's caret */
  const settle = () => page.waitForTimeout(900);
  const show = async (id, path, ready, setup = async () => {}) => {
    await page.goto(path); await ready(); await setup(); await settle();
    shots[id] = await page.screenshot({ type: 'png' });
  };
  const region = name => page.getByRole('region', { name, exact: true });
  const heading = name => page.getByRole('heading', { name, exact: true }).first().waitFor();
  await show('home', '/', () => page.getByText('Garden council', { exact: true }).waitFor());
  burrows = 'none';
  await show('home-empty', '/', () => heading('No burrows yet'));
  burrows = 'two';
  await show('burrow-new', '/burrows/new', () => region('Start a burrow').waitFor(), () => page.getByRole('textbox', { name: 'Burrow name', exact: true }).fill('Garden council'));
  await show('burrow-fresh', `/burrows/${FRESH}`, () => heading('Just you so far'));
  state = 'join';
  await show('burrow-join', `/burrows/${seed.burrowId}`, () => page.getByRole('button', { name: 'Join this burrow', exact: true }).waitFor());
  state = 'burrow';
  await show('burrow', `/burrows/${seed.burrowId}`, () => page.getByText('5 of 8 have scattered', { exact: true }).waitFor());
  await show('who-scattered', `/burrows/${seed.burrowId}`, () => page.getByText('5 of 8 have scattered', { exact: true }).waitFor(),
    async () => { await page.getByText('5 of 8 have scattered', { exact: true }).click(); await page.getByRole('dialog').waitFor(); });
  await show('burrow-quiet', `/burrows/${QUIET}`, () => heading('No feasts yet'));
  state = 'members';
  await show('members', `/burrows/${seed.burrowId}/critters`, () => page.getByText('Juniper (you)', { exact: true }).waitFor());
  await show('remove', `/burrows/${seed.burrowId}/critters`, () => page.getByText('Juniper (you)', { exact: true }).waitFor(),
    async () => { await page.getByRole('button', { name: 'Remove from burrow: Fern', exact: true }).click(); await page.getByRole('dialog').waitFor(); });
  await show('leave', `/burrows/${seed.burrowId}/critters`, () => page.getByText('Juniper (you)', { exact: true }).waitFor(),
    async () => { await page.getByRole('button', { name: 'Leave this burrow', exact: true }).click(); await page.getByRole('dialog').waitFor(); });
  await show('unknown', `/burrows/${UNKNOWN}`, () => heading("This burrow doesn't know you yet"));
  await show('missing', `/burrows/${MISSING}`, () => heading("There's no burrow at this link"));
  await ctx.close();
  return shots;
}

/* one image: the frame (where there is one), the light look and the dark one, side by side, each under its label */
async function compose(file, device, panels) {
  const scale = device === 'desktop' ? .5 : 1, { width, height } = DEVICES[device];
  const ctx = await browser.newContext({ viewport: { width: Math.round(panels.length * (width * scale + 24) + 24), height: Math.round(height * scale + 80) }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const figures = panels.map(([label, png]) => `<figure><figcaption>${label}</figcaption><img width="${width * scale}" height="${height * scale}" src="data:image/png;base64,${png.toString('base64')}"></figure>`).join('');
  await page.setContent(`<style>body{margin:0;padding:24px 24px 0;display:flex;gap:24px;background:#E9E4DA;font:600 14px system-ui,sans-serif;color:#2E2226}figure{margin:0}figcaption{margin:0 0 10px}img{display:block;border-radius:8px;box-shadow:0 1px 4px rgb(0 0 0/.2)}</style>${figures}`);
  await page.screenshot({ path: `${OUT}/${file}.jpg`, type: 'jpeg', quality: 80 });
  await ctx.close();
  log('composed', file);
}

const seeding = await browser.newContext({ baseURL: BASE }), seeded = await seeding.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
if (!seeded.ok()) throw new Error(`seed failed: ${seeded.status()}`);
const seed = await seeded.json();
await seeding.close();
for (const device of Object.keys(DEVICES)) {
  const mocks = await mockFrames(device);
  const light = await appShots(device, false, seed), dark = await appShots(device, true, seed);
  for (const id of SCREENS) await compose(`${id}-${device}`, device, [['Flow page', mocks[id]], ['App, light', light[id]], ['App, dark', dark[id]]]);
  await compose(`missing-${device}`, device, [['App, light', light.missing], ['App, dark', dark.missing]]);
}
await browser.close();
log('done');
