import { expect, test, type Page } from 'playwright/test';

/*
 * Each core state's composition, checked against numbers read off the review pages, never off the app:
 * the flow page's SCREENS (docs/explorations/app-screens/index.html: sheetH, .toast, .modal, .d-desktop .sheet) and
 * the scatter page, pass eleven (docs/explorations/scatter-layouts/index.html: DOCK_BASE 130, RESULTS_FLOOR 196, the
 * 74 px folded dock and results bar, the 400–480 px side panel, the 378 px statement bubble at 12 px).
 */
test.use({ timezoneId: 'America/Los_Angeles', locale: 'en-US' });
const PHONE = { width: 375, height: 812 }, DESKTOP = { width: 1440, height: 900 }, HEADER = 64;
const SHEETS: Record<string, number> = { reveal: 230, waiting: 250, key: 250, feast: 144, nobody: 260 };
const DOCKS = ['scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed', 'closed', 'feasted'];
const RESULTS = ['results', 'tie', 'givers', 'recording', 'recorded', 'public'];
const TOASTS: Record<string, string> = { scattered: 'Your scatter is in.', rejected: "Not confirmed. Your crumbs are still here — try again when you're ready.", failed: "Couldn't save your scatter. Check your connection and try again — nothing was lost." };
const CLOSES = 'Scattering closes in 2 days · Wed 7 Oct, 18:00 (PDT)';

async function open(page: Page, state: string, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto(`/dev/screens?capture&state=${state}&count=8&scene=window`);
  await expect(page.locator('.circle-spot')).toHaveCount(8);
  await page.waitForTimeout(300);
}
const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;

for (const [state, height] of Object.entries(SHEETS)) {
  test(`${state}: a ${height} px sheet on the phone, no dock; the side panel on desktop`, async ({ page }) => {
    await open(page, state, PHONE);
    await expect(page.locator('.game-dock')).toHaveCount(0);
    const sheet = await box(page, '.game-sheet');
    expect(Math.round(sheet.height)).toBe(height);
    expect(Math.round(sheet.y + sheet.height)).toBe(PHONE.height);
    await expect(page.locator('.critter-tag')).toHaveCount(0);
    await open(page, state, DESKTOP);
    await expect(page.locator('.dock-position')).toHaveCount(0);
    const side = await box(page, '.game-side');
    expect(Math.round(side.width)).toBe(400);
    expect(await page.locator('.side-sheet').innerText()).not.toBe('');
  });
}

for (const state of DOCKS) {
  test(`${state}: the scatter screen's dock, 130 px, across the floor; the statement in the desktop panel`, async ({ page }) => {
    await open(page, state, PHONE);
    const dock = await box(page, '.game-dock');
    expect(Math.round(dock.height)).toBe(130);
    expect(Math.round(dock.width)).toBe(PHONE.width);
    await expect(page.locator('.thought-target')).toHaveCount(state === 'closed' || state === 'reading' ? 0 : 1);
    await open(page, state, DESKTOP);
    const wide = await box(page, '.game-dock');
    expect(Math.round(wide.height)).toBe(130);
    expect(Math.round(wide.width)).toBe(DESKTOP.width - 400);
    await expect(page.locator('.thought-target')).toHaveCount(0);
    await expect(page.locator('.panel-statement h2')).toHaveText('Moss');
    if (state !== 'feasted') await expect(page.locator('#game-when')).toHaveText(CLOSES);
  });
}

for (const state of RESULTS) {
  test(`${state}: results grown out of the dock on the phone; the panel and its 74 px bar level with the folded dock on desktop`, async ({ page }) => {
    await open(page, state, PHONE);
    const card = await box(page, '.dock-position');
    expect(Math.round(card.y)).toBe(HEADER + 196);
    await expect(page.locator('.results-card')).toBeVisible();
    await open(page, state, DESKTOP);
    const dock = await box(page, '.dock-position'), bar = await box(page, '.results-bar');
    expect(Math.round(dock.height)).toBe(74);
    expect(Math.round(bar.height)).toBe(74);
    expect(Math.round(bar.y)).toBe(Math.round(dock.y));
    await expect(page.locator('#game-when')).toHaveText(state === 'tie' ? '1 of 8 scattered · 100 crumbs in all' : '7 of 8 scattered · 700 crumbs in all');
  });
}

test('the reveal: every critter but yours carries a thought bubble, each a finger-sized target', async ({ page }) => {
  await open(page, 'reveal', PHONE);
  const bubbles = page.locator('.thought-target');
  await expect(bubbles).toHaveCount(7);
  for (const bubble of await bubbles.all()) { const rect = (await bubble.boundingBox())!; expect(rect.width).toBeGreaterThanOrEqual(44); expect(rect.height).toBeGreaterThanOrEqual(44); }
  await expect(page.getByRole('button', { name: 'Start reading', exact: true })).toBeVisible();
});

for (const [state, text] of Object.entries(TOASTS)) for (const viewport of [PHONE, DESKTOP]) {
  test(`${state} at ${viewport.width}: the toast sits at the top of the floor, centred over it`, async ({ page }) => {
    await open(page, state, viewport);
    const toast = page.locator('.game-toast');
    await expect(toast).toHaveText(text);
    const rect = (await toast.boundingBox())!, floor = viewport.width === DESKTOP.width ? DESKTOP.width - 400 : viewport.width;
    expect(Math.round(rect.y)).toBe(HEADER + (viewport.width === DESKTOP.width ? 20 : 16));
    expect(Math.abs(rect.x + rect.width / 2 - floor / 2)).toBeLessThanOrEqual(1);
  });
}

test('confirming: a sheet from the bottom on the phone, a centred 460 px card on desktop, Cancel beside Scatter These', async ({ page }) => {
  await open(page, 'signing', PHONE);
  const dialog = page.getByRole('dialog', { name: 'Confirm your scatter' });
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Scatter These', exact: true })).toBeVisible();
  let rect = (await dialog.boundingBox())!;
  expect(Math.round(rect.y + rect.height)).toBe(PHONE.height); expect(Math.round(rect.width)).toBe(PHONE.width);
  await open(page, 'signing', DESKTOP);
  rect = (await page.getByRole('dialog', { name: 'Confirm your scatter' }).boundingBox())!;
  expect(Math.round(rect.width)).toBe(460);
  expect(Math.abs(rect.x + rect.width / 2 - DESKTOP.width / 2)).toBeLessThanOrEqual(1);
});

test('reading on the phone: the statement bubble at the top with its trail, the heap and the focus tag out of the way', async ({ page }) => {
  await open(page, 'reading', PHONE);
  const bubble = await box(page, '.phone-statement');
  expect(Math.round(bubble.y)).toBe(HEADER + 12); expect(Math.round(bubble.height)).toBe(378); expect(Math.round(bubble.x)).toBe(12);
  await expect(page.locator('.thought-puff')).toHaveCount(3);
  await expect(page.locator('[data-heap]')).toHaveCount(0);
  await expect(page.locator('.phone-statement .element-chip')).toHaveText('Earth');
});

test('scattering closed: dusk, every critter asleep, − and + dimmed and stopped', async ({ page }) => {
  await open(page, 'closed', PHONE);
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'disabled');
  for (const button of await page.locator('.focus-row .icon-button').all()) { await expect(button).toBeDisabled(); expect(Number(await button.evaluate(node => getComputedStyle(node).opacity))).toBeCloseTo(0.4); }
  await expect(page.locator('.dock-closed')).toHaveText('Scattering has closed. The feast is on its way.');
  await expect.poll(() => page.locator('.circle-spot .portrait-v2').evaluateAll(nodes => nodes.every(node => node.getAttribute('data-asleep') === 'true'))).toBe(true);
});

test('the bar while scattering: the crumb, the count and "to go", the closing day under it on the phone only', async ({ page }) => {
  await open(page, 'scatter', PHONE);
  await expect(page.locator('.crumbs-left-count')).toHaveText('12');
  await expect(page.locator('.crumbs-left-words')).toHaveText('to go');
  await expect(page.locator('.dock-when')).toHaveText('Scattering closes in 2 days');
  await expect(page.locator('.focus-name')).toHaveText('Moss');
  await expect(page.locator('.focus-count .count-output [aria-hidden]')).toHaveText('24');
  await open(page, 'scatter', DESKTOP);
  await expect(page.locator('.dock-when')).toBeHidden();
  await expect(page.locator('.focus-name')).toBeHidden();
});

test('no core state falls back to the generic notice card', async ({ page }) => {
  for (const state of [...Object.keys(SHEETS), ...DOCKS, ...RESULTS]) { await open(page, state, PHONE); await expect(page.locator('.game-notice')).toHaveCount(0); }
});
