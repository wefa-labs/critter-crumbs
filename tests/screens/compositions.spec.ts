import { expect, test, type Page } from 'playwright/test';

/*
 * Each core state's composition, checked against numbers read off the review pages, never off the app:
 * the flow page's SCREENS (docs/explorations/app-screens/index.html: sheetH, .toast, .modal, .d-desktop .sheet) and
 * the scatter page, pass eleven (docs/explorations/scatter-layouts/index.html: DOCK_BASE 130, RESULTS_FLOOR 196, the
 * 74 px folded dock and results bar, the 400–480 px side panel, the statement bubble at 12 px, at most 378 px tall). Three
 * numbers are the app's own: the waiting sheet is 40 px taller than the flow page's 250, for its line to Why nobody can
 * peek, and the key's 80 px taller, for that line and the count of who has scattered (docs/decisions.md, 2026-11-09); the
 * sheet for no scatter readable, which the flow page does not draw, is 80 px over nobody's 260 for the line naming whose
 * and the result fingerprint under it.
 */
test.use({ timezoneId: 'America/Los_Angeles', locale: 'en-US' });
const PHONE = { width: 375, height: 812 }, DESKTOP = { width: 1440, height: 900 }, HEADER = 64;
/* the waiting sheet is the flow page's 250 and the 40 px its line to Why nobody can peek needs (the first-steps review, F8);
   the key's adds the count of who has scattered under its notice as well (docs/decisions.md, 2026-11-09); no scatter
   readable is nobody's 260 and the 80 px its line naming whose crumbs could not be read (QA copy-01) and the result
   fingerprint under it need (docs/decisions.md, 2026-11-09) */
const SHEETS: Record<string, number> = { reveal: 230, waiting: 290, key: 330, feast: 144, nobody: 260, unreadable: 340 };
const DOCKS = ['scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed', 'closed', 'feasted'];
const RESULTS = ['results', 'tie', 'givers', 'recording', 'recorded', 'public'];
const TOASTS: Record<string, string> = { scattered: 'Your scatter is in.', rejected: "Not confirmed. Your crumbs are still here — try again when you're ready.", failed: "Couldn't save your scatter. Check your connection and try again — nothing was lost." };
const CLOSES = 'Scattering closes in 2 days · Wed 7 Oct, 18:00 (PDT)';

async function open(page: Page, state: string, viewport: { width: number; height: number }, count = 8) {
  await page.setViewportSize(viewport);
  await page.goto(`/dev/screens?capture&state=${state}&count=${count}&scene=window`);
  await expect(page.locator('.circle-spot')).toHaveCount(count);
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
    /* the actions are pinned at the card's foot, under the list rather than at its end, however long it is (D9); the
       list keeps its own controls, such as recording the result */
    const pinned = page.locator('.results-card > .results-actions');
    await expect(page.locator('.results-scroll .results-actions')).toHaveCount(0);
    const results = await box(page, '.results-card'), actions = await box(page, '.results-card > .results-actions');
    expect(Math.round(actions.y + actions.height)).toBe(Math.round(results.y + results.height));
    for (const name of state === 'givers' ? ['Download CSV (who gave what)'] : ['Replay Feast', 'Download CSV']) await expect(pinned.getByRole('button', { name, exact: true })).toBeInViewport({ ratio: 1 });
    await open(page, state, DESKTOP);
    const dock = await box(page, '.dock-position'), bar = await box(page, '.results-bar');
    expect(Math.round(dock.height)).toBe(74);
    expect(Math.round(bar.height)).toBe(74);
    expect(Math.round(bar.y)).toBe(Math.round(dock.y));
    await expect(page.locator('#game-when')).toHaveText(state === 'tie' ? '1 of 8 scattered · 100 crumbs in all' : '7 of 8 scattered · 700 crumbs in all');
  });
}

test('waiting for the feast: the sheet counts who has scattered while the feast is laid out and while the key is not out, and still fits', async ({ page }) => {
  for (const state of ['waiting', 'key']) for (const viewport of [PHONE, DESKTOP]) {
    await open(page, state, viewport);
    const sheet = page.locator(viewport === PHONE ? '.game-sheet' : '.side-sheet');
    await expect(sheet.getByText('7 of 8 have scattered', { exact: true })).toBeVisible();
    if (viewport === PHONE) expect(await sheet.evaluate(node => node.scrollHeight <= node.clientHeight)).toBe(true);
  }
});

/* the sheet for no scatter readable carries the result fingerprint under the line naming whose, as the results show it, so
   members can tell one browser failing to open the scatters from everyone's failing (docs/decisions.md, 2026-11-09); with
   nine names, a burrow of ten, the phone's sheet still holds it all without scrolling */
test('no scatter readable: the sheet names whose and carries the fingerprint, and still fits', async ({ page }) => {
  for (const viewport of [PHONE, DESKTOP]) {
    await open(page, 'unreadable', viewport, 10);
    const sheet = page.locator(viewport === PHONE ? '.game-sheet' : '.side-sheet');
    await expect(sheet.getByText("scattered, but their crumbs couldn't be read, so there's nothing to share out.")).toBeVisible();
    if (viewport === PHONE) expect(await sheet.evaluate(node => node.scrollHeight <= node.clientHeight)).toBe(true);
    await sheet.locator('.results-fingerprint summary').click();
    await expect(sheet.getByText('Compare it with another member’s. The same fingerprint means the same result.', { exact: true })).toBeVisible();
    await expect(sheet.locator('.results-fingerprint code')).toHaveText(/^0x[0-9a-f]{64}$/);
  }
});

/* the first-steps review, F8: waiting is one of the few moments a person reads, and the results are what they would
   question, so both lead to Why nobody can peek; the fingerprint says what to do with it */
test('the waiting sheet and the results lead to Why nobody can peek, and the fingerprint says what it is for', async ({ page }) => {
  const why = page.getByRole('link', { name: 'Why nobody can peek', exact: true });
  for (const viewport of [PHONE, DESKTOP]) {
    await open(page, 'waiting', viewport);
    await expect(why).toHaveAttribute('href', '/how-it-works/why');
    const link = (await why.boundingBox())!;
    expect(link.height).toBeGreaterThanOrEqual(44);
    expect(link.y).toBeGreaterThan((await box(page, viewport === PHONE ? '.game-sheet p' : '.side-sheet p')).y);
    // the key's sheet leads there too, under its reason, with the count and Try again still in it
    await open(page, 'key', viewport);
    await expect(why).toHaveAttribute('href', '/how-it-works/why');
    await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
    await open(page, 'results', viewport);
    await expect(why).toBeVisible();
    // under the summary, over the ranked critters
    const under = (await why.boundingBox())!, summary = await box(page, '.results-sum'), first = await box(page, '.results-row');
    expect(under.y).toBeGreaterThanOrEqual(summary.y + summary.height);
    expect(under.y + under.height).toBeLessThanOrEqual(first.y);
    await page.locator('.results-fingerprint summary').first().click();
    await expect(page.getByText('Compare it with another member’s. The same fingerprint means the same result.', { exact: true }).first()).toBeVisible();
  }
});

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

test('reading on the phone: the statement bubble at the top, as tall as its text up to 378 px, with its trail; the heap and the focus tag out of the way', async ({ page }) => {
  await open(page, 'reading', PHONE);
  const scrolls = () => page.locator('.statement-scroll').evaluate(node => node.scrollHeight > node.clientHeight);
  /* Moss's statement is four paragraphs: the whole bubble, the text scrolling inside it */
  let bubble = await box(page, '.phone-statement');
  expect(Math.round(bubble.y)).toBe(HEADER + 12); expect(Math.round(bubble.height)).toBe(378); expect(Math.round(bubble.x)).toBe(12);
  expect(await scrolls()).toBe(true);
  await expect(page.locator('.thought-puff')).toHaveCount(3);
  await expect(page.locator('[data-heap]')).toHaveCount(0);
  await expect(page.locator('.phone-statement .element-chip')).toHaveText('Earth');
  /* Fern's is a few lines: the bubble is as tall as they are, at the same place, and the trail rises to its foot (D8) */
  await page.locator('.dock-turn').last().click();
  await expect(page.locator('.statement-scroll')).toContainText('library shelves');
  bubble = await box(page, '.phone-statement');
  expect(Math.round(bubble.y)).toBe(HEADER + 12); expect(Math.round(bubble.x)).toBe(12);
  expect(bubble.height).toBeLessThan(260);
  expect(await scrolls()).toBe(false);
  const puff = (await page.locator('.thought-puff').last().boundingBox())!;
  expect(puff.y).toBeGreaterThan(bubble.y + bubble.height);
  expect(puff.y).toBeLessThan(HEADER + 12 + 378);
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
