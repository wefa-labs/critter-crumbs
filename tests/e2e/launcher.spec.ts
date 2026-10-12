import { test, expect, type Page } from 'playwright/test';
import { listen } from './listen.js';
import { connectLocal } from './session.js';

/*
 * Before connecting, as the flow page draws it (docs/explorations/app-screens: SCREENS.launch, invite, connect,
 * ['connect-rejected'] and the three first steps), and Afolabi's review of 11 October 2026: one Connect, the tagline
 * once, no Settings, a way to learn more, a Music toggle, a dark look.
 */
interface Box { x: number; y: number; width: number; height: number }
const box = async (page: Page, selector: string): Promise<Box> => (await page.locator(selector).first().boundingBox())!;
const boxes = (page: Page, selector: string) => page.locator(selector).evaluateAll(nodes => nodes.map(node => { const { x, y, width, height } = node.getBoundingClientRect(); return { x, y, width, height }; }));
const apart = (a: Box, b: Box) => a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
const ground = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
const LIGHT = 'rgb(246, 240, 228)', DARK = 'rgb(43, 38, 56)';

test('the launcher is a title screen: the wordmark, the tagline once, one Connect, How it works, Music, and no Settings', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Critter Crumbs', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('Critter Crumbs');
  await expect(page.getByText(/handful/)).toHaveCount(1);
  await expect(page.getByText('Everyone gets a handful of crumbs to share.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /connect/i })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Settings' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'How it works', exact: true })).toHaveAttribute('href', '/how-it-works');
  await expect(page.getByRole('button', { name: 'Music', exact: true })).toHaveCount(1);
  // the wordmark is set in its own face, which has arrived: Grandstander Black, from the app's own address
  expect(await page.locator('.launch-plate .wordmark').evaluate(node => getComputedStyle(node).fontFamily.split(',')[0]!.trim())).toBe('Grandstander');
  expect(await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter(face => face.family === 'Grandstander').map(face => [face.weight, face.status]); })).toEqual([['900', 'loaded']]);
  const face = await page.request.get('/fonts/grandstander-wordmark.woff2');
  expect([face.status(), face.headers()['content-type']]).toEqual([200, 'font/woff2']);

  // the floor: four critters around a heap of ten crumbs, the outer two asleep
  await expect(page.locator('.launch-scene .floor-critter svg.portrait')).toHaveCount(4);
  expect(await page.locator('.launch-scene .floor-critter svg.portrait').evaluateAll(nodes => nodes.map(node => (node as SVGElement).dataset.asleep))).toEqual(['true', 'false', 'false', 'true']);
  await expect(page.locator('.launch-scene .floor-prop [data-crumb]')).toHaveCount(10);

  // on a phone nothing collides, nothing is cut off and every control is a full target
  const plate = await box(page, '.launch-plate'), sheet = await box(page, '.launch-sheet'), sound = await box(page, '.launch-sound .music-button');
  const connect = await box(page, '.launch-sheet .pill'), learn = await box(page, '.launch-sheet a'), critters = await boxes(page, '.launch-scene .floor-critter');
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([375, 812]);
  for (const target of [sound, connect, learn]) { expect(target.width).toBeGreaterThanOrEqual(44); expect(target.height).toBeGreaterThanOrEqual(44); }
  expect(apart(plate, sound)).toBe(true);
  for (const critter of critters) {
    expect(apart(critter, plate)).toBe(true);
    expect(critter.x).toBeGreaterThanOrEqual(0); expect(critter.x + critter.width).toBeLessThanOrEqual(375);
    expect(critter.y + critter.height).toBeLessThanOrEqual(sheet.y);
  }
  expect(Math.round(sheet.y + sheet.height)).toBe(812);
});

test('on desktop the painting fills the screen and the critters gather either side of the card', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 900, height: 700 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
    const scene = await box(page, '.launch-scene'), card = await box(page, '.launch-sheet'), plate = await box(page, '.launch-plate'), critters = await boxes(page, '.launch-scene .floor-critter'), heap = await box(page, '.launch-scene .floor-prop');
    expect(scene).toEqual({ x: 0, y: 0, ...viewport });
    expect(card.width).toBe(420);
    expect(Math.abs(card.x + card.width / 2 - viewport.width / 2)).toBeLessThan(1);
    expect(Math.abs(plate.x + plate.width / 2 - viewport.width / 2)).toBeLessThan(1);
    expect(viewport.height - (card.y + card.height)).toBe(56);
    expect(critters.filter(critter => critter.x + critter.width <= card.x)).toHaveLength(2);
    expect(critters.filter(critter => critter.x >= card.x + card.width)).toHaveLength(2);
    for (const critter of critters) { expect(apart(critter, plate)).toBe(true); expect(critter.x).toBeGreaterThanOrEqual(0); expect(critter.x + critter.width).toBeLessThanOrEqual(viewport.width); expect(critter.y + critter.height).toBeLessThanOrEqual(viewport.height); }
    expect(apart(heap, card)).toBe(true);
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([viewport.width, viewport.height]);
  }
});

test('How it works walks three steps that can be skipped, with ten practice crumbs to give on the second', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(page).toHaveTitle('How it works · Critter Crumbs');
  await expect(page.getByRole('heading', { level: 1, name: 'Everyone gets the same handful', exact: true })).toBeFocused();
  await expect(page.getByRole('img', { name: 'Step 1 of 3', exact: true })).toBeVisible();
  await expect(page.locator('.screen-floor .floor-prop [data-crumb]')).toHaveCount(24);
  await expect(page.getByRole('button', { name: 'Skip', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tap to give a crumb. Hold to pour.', exact: true })).toBeFocused();
  const count = page.locator('.learn-count'), heap = page.locator('[data-practice] [data-crumb]'), critters = page.getByRole('button', { name: 'Give a practice crumb', exact: true });
  await expect(critters).toHaveCount(3);
  await expect(count).toHaveText('10 to go');
  await expect(heap).toHaveCount(10);
  // a tap gives one crumb, which leaves the heap
  await critters.first().click();
  await expect(count).toHaveText('9 to go');
  await expect(heap).toHaveCount(9);
  await expect(page.locator('#announce')).toHaveText('9 to go');
  // so does a key press on a critter
  await critters.nth(1).focus(); await page.keyboard.press('Enter');
  await expect(count).toHaveText('8 to go');
  // holding pours the rest, and the heap is left as three faint outlines
  const target = (await critters.nth(2).boundingBox())!;
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2); await page.mouse.down();
  await expect(count).toHaveText('All scattered', { timeout: 10000 });
  await page.mouse.up();
  await expect(heap).toHaveCount(0);
  await expect(page.locator('#announce')).toHaveText('All scattered');
  // nothing is left flying, and nothing more can be given
  await expect(page.locator('.screen-floor .practice-crumb:not([hidden])')).toHaveCount(0);
  await critters.first().click();
  await expect(count).toHaveText('All scattered');

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Where they go stays private', exact: true })).toBeFocused();
  await expect(page.locator('.screen-floor .scene-paint')).toHaveAttribute('data-painting', 'dusk');
  await expect(page.locator('.screen-floor svg.portrait[data-asleep="true"]')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:5173\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Critter Crumbs', exact: true })).toBeVisible();

  // Skip leaves from the first step, and the browser's Back returns to the steps
  await page.getByRole('link', { name: 'How it works', exact: true }).click();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Everyone gets the same handful', exact: true })).toBeVisible();
});

test('the Music button starts the music on the first press of a silent page, and the next press stops it', async ({ page }) => {
  const requested: string[] = [], soon = { timeout: 15000 };
  page.on('request', request => { const path = new URL(request.url()).pathname; if (path.startsWith('/audio/')) requested.push(path); });
  const { played, stopped } = await listen(page);
  await page.goto('/');
  const music = page.getByRole('button', { name: 'Music', exact: true }), stored = () => page.evaluate(() => localStorage.getItem('cc.sound.music'));
  // music is on by default, but nothing can play before a press: the button says so, and nothing is fetched
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  expect(requested).toEqual([]);
  // the first press starts the launcher's theme and leaves the setting on
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(played, soon).toContain('music/burrow');
  expect(await stored()).toBe('1');
  // the next press stops it, and that is remembered
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(stopped, soon).toContain('music/burrow');
  expect(await stored()).toBe('0');
  await page.reload();
  await page.getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Music', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect(await played()).toEqual([]);
  // and it comes back when asked for
  await page.getByRole('button', { name: 'Music', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Music', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(played, soon).toContain('music/burrow');
});

test('once any press has started the sound, the Music button shows it on and its first press turns it off', async ({ page }) => {
  const { played } = await listen(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'How it works', exact: true }).click();
  const music = page.getByRole('button', { name: 'Music', exact: true });
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(played, { timeout: 15000 }).toContain('music/burrow');
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('cc.sound.music'))).toBe('0');
});

test('choosing how to connect is a sheet of the apps on offer; a connection that fails closes it and the launcher says why', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: 'Choose how to connect' });
  await expect(sheet.getByRole('button', { name: 'Rehearsal critter 1', exact: true })).toBeVisible();
  // a sheet from the foot of the phone's screen, inside it however long the list
  const frame = (await sheet.boundingBox())!;
  expect(frame.x).toBe(0); expect(frame.width).toBe(375); expect(frame.y).toBeGreaterThanOrEqual(0); expect(frame.y + frame.height).toBe(812);
  // Cancel closes it and the launcher is as it was
  await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.launch-sheet .sheet-notice')).toHaveCount(0);

  // the store cannot be reached while connecting: the sheet waits on the chosen app, then closes
  await page.route('**/api/session/nonce', async route => { await new Promise(resolve => setTimeout(resolve, 400)); await route.abort(); });
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await sheet.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).click();
  await expect(sheet).toContainText('Confirm in Rehearsal critter 1');
  await expect(sheet).toContainText('It costs nothing and nothing goes on-chain.');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // the launcher says it above Connect, once, and it is read out
  await expect(page.locator('.launch-sheet .sheet-notice')).toHaveText("Can't reach the burrow right now. Try again in a moment.");
  await expect(page.locator('#alert')).toHaveText("Can't reach the burrow right now. Try again in a moment.");
  await expect(page.locator('#alert')).toHaveClass(/sr-only/);
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
  // trying again clears it
  await page.unroute('**/api/session/nonce');
  await connectLocal(page, 1);
  await expect(page.getByRole('heading', { level: 1, name: 'Your burrows', exact: true })).toBeVisible();
});

test('dark follows the device until Settings chooses, and the choice is kept', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
  expect(await ground(page)).toBe(DARK);
  expect(await page.locator('.launch-sheet').evaluate(node => getComputedStyle(node).backgroundColor)).toBe(DARK);
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await ground(page)).toBe(LIGHT);

  await page.emulateMedia({ colorScheme: 'dark' });
  await connectLocal(page, 1);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const dark = page.getByRole('checkbox', { name: /^Dark mode/ });
  await expect(dark).toBeChecked();
  await dark.uncheck();
  expect(await ground(page)).toBe(LIGHT);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Your burrows', exact: true })).toBeVisible();
  expect(await ground(page)).toBe(LIGHT);
  // and the other way: dark chosen on a device that is light
  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(dark).not.toBeChecked();
  await dark.check();
  expect(await ground(page)).toBe(DARK);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Your burrows', exact: true })).toBeVisible();
  expect(await ground(page)).toBe(DARK);
  // Settings also leads back to the first steps
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Everyone gets the same handful', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('a feast opened from a link shows the burrow, the feast, both deadlines and its critters asleep, then one way in', async ({ page }) => {
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  for (const viewport of [{ width: 375, height: 812 }, { width: 320, height: 568 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`/feasts/${feast.id}`);
    await expect(page.getByRole('heading', { level: 1, name: feast.title, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Rehearsal burrow · 8 critters$/ })).toBeVisible();
    await expect(page.getByText(/^Gathering closes /)).toBeVisible();
    await expect(page.getByText(/^Scattering closes /)).toBeVisible();
    await expect(page.locator('.invite-deadlines time')).toHaveCount(2);
    await expect(page.getByText('The critters are asleep until you connect.', { exact: true })).toBeVisible();
    await expect(page.locator('.screen-floor .floor-critter svg.portrait[data-asleep="true"]')).toHaveCount(8);
    await expect(page.getByRole('button', { name: /connect/i })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Connect to join', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Music', exact: true })).toHaveCount(1);
    const join = await box(page, '.screen-sheet .pill'), critters = await boxes(page, '.screen-floor .floor-critter'), floor = await box(page, '.screen-floor');
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([viewport.width, viewport.height]);
    expect(join.height).toBeGreaterThanOrEqual(44); expect(join.y + join.height).toBeLessThanOrEqual(viewport.height);
    for (const critter of critters) { expect(critter.x).toBeGreaterThanOrEqual(floor.x); expect(critter.x + critter.width).toBeLessThanOrEqual(floor.x + floor.width); expect(critter.y).toBeGreaterThanOrEqual(floor.y); }
  }
  // connecting from the link lands in the feast itself
  await connectLocal(page, 1);
  await expect(page.getByRole('textbox', { name: 'Your statement', exact: true })).toBeVisible();
});
