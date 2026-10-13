import { test, expect, type Page } from 'playwright/test';
import { listen } from './listen.js';
import { connectLocal } from './session.js';
import { watchGameScreen } from './watch.js';

/**
 * The laid-out sheet stays until the key comes, and the local stack sends it within about a quarter of a second: less
 * than the half second an assertion leaves between tries. So the key is held back until the sheet has been seen. `allow`
 * lets it through; `asked` says whether the screen asked for it at the path held here.
 */
async function holdKey(page: Page, feastId: string) {
  let asked = false, allow = () => {};
  const gate = new Promise<void>(resolve => { allow = resolve; });
  await page.route(`/api/feasts/${feastId}/key`, async route => { asked = true; await gate; await route.continue(); });
  return { allow: () => allow(), asked: () => asked };
}

/** Watch the actual device painting requests before opening the game. */
function watchPaintings(page: Page) {
  const requested: string[] = [];
  page.on('request', request => { const path = new URL(request.url()).pathname; if (path.startsWith('/scenes/')) requested.push(path); });
  return async () => {
    await expect.poll(() => requested.includes('/scenes/dusk-plate-phone.webp')).toBe(true);
    expect(requested).toContain('/scenes/window-plate-phone.webp');
    expect(requested.indexOf('/scenes/window-plate-phone.webp')).toBeLessThan(requested.indexOf('/scenes/dusk-plate-phone.webp'));
    expect(requested).not.toContain('/scenes/dusk-plate-desktop.webp');
  };
}

/* Flow page 41: "The deadline passed with the screen open: the critters fall asleep and the controls stop." Then the
   feast is laid out (flow 42) and, with the key, opens. The server clock is set a few seconds short of the deadline, so
   the screen's trusted clock reaches it while the screen is open, as it would in a real session. */
test('the deadline passing with the scatter screen open stops it at dusk, then lays the feast out', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const duskRequested = watchPaintings(page);
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}/scatter`); await connectLocal(page, 1);
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'live');
  // An unsaved allocation on screen: closing stops the same screen, it does not start a fresh one.
  const field = page.locator('.focus-count input'); await field.fill('7'); await field.press('Enter');
  await expect(page.locator('.crumbs-left-count')).toHaveText('93');
  await duskRequested();
  const screen = await watchGameScreen(page), key = await holdKey(page, feast.id);
  expect((await page.request.post('/api/dev/time', { data: { now: feast.scatteringEndsAt - 4000 } })).ok()).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.dock-closed')).toHaveText('Scattering has closed. The feast is on its way.', { timeout: 15000 });
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'disabled');
  await expect(page.locator('.game-body')).toHaveAttribute('data-game-state', 'closed');
  await expect(page.locator('.focus-count .count-output [aria-hidden]')).toHaveText('7');
  await expect(page.locator('.game-toast')).toHaveCount(0);
  await expect(page.locator('.game-sheet').getByRole('heading', { name: 'The feast is being laid out', exact: true })).toBeVisible({ timeout: 15000 });
  // With the key, the feast opens: nobody scattered here, so it opens on the results saying so.
  key.allow();
  await expect(page.getByRole('heading', { name: 'Results', exact: true })).toBeVisible({ timeout: 15000 });
  // Through all of it a whole game screen stayed on the page: each one gives way to the next with nothing between, and
  // every one stands on its floor from its first frame.
  expect(await screen.lapses()).toEqual([]);
  expect(key.asked(), 'the key request was not held back: has its path changed?').toBe(true);
});

/* The feast's own link opens the reveal while scattering is open (flow page 34), and the flow page draws no closed state
   for it. When the deadline passes under it, it stays as it is, with no sound, until the feast is laid out
   (docs/decisions.md, 2026-10-12). */
test('the deadline passing with the reveal open leaves it as it is until the feast is laid out', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const duskRequested = watchPaintings(page);
  const { played } = await listen(page);
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
  await expect(page.getByRole('heading', { name: 'Statements are open', exact: true })).toBeVisible();
  await duskRequested();
  const screen = await watchGameScreen(page), key = await holdKey(page, feast.id);
  expect((await page.request.post('/api/dev/time', { data: { now: feast.scatteringEndsAt - 4000 } })).ok()).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.game-sheet').getByRole('heading', { name: 'The feast is being laid out', exact: true })).toBeVisible({ timeout: 15000 });
  // The reveal gave way to the laid-out sheet directly: no closed state of its own, no bare page between, no Dusk sting.
  expect(await screen.states()).toEqual(['reveal', 'waiting']);
  expect(await screen.lapses()).toEqual([]);
  expect(await played()).not.toContain('stings/dusk');
  key.allow();
  await expect(page.getByRole('heading', { name: 'Results', exact: true })).toBeVisible({ timeout: 15000 });
  expect(key.asked(), 'the key request was not held back: has its path changed?').toBe(true);
});
