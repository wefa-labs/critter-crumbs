import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';
import { watchGameScreen } from './watch.js';

/* Desktop keeps the statement in the side panel, so arriving through the statements must not leave the screen in a
   reading state that hides the saved scatter (found recording the desktop demo, 2026-10-07). */
test('arriving through the statements on desktop, a saved scatter still says Scattered.', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  // Connect on the read route itself: a reload would drop the in-memory signer (tests/e2e/reconnect.spec.ts).
  await page.goto(`/feasts/${feast.id}/read`); await connectLocal(page, 1);
  await expect(page.locator('.panel-statement')).toBeVisible();
  if (await page.locator('.focus-count input').count() === 0) await page.locator('.dock-turn').last().click();
  const field = page.locator('.focus-count input'); await field.fill('100'); await field.press('Enter');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await page.getByRole('dialog', { name: 'Confirm your scatter' }).getByRole('button', { name: 'Scatter These', exact: true }).click();
  await expect(page.locator('.dock-scattered')).toBeFocused();
  await expect(page.locator('.game-toast')).toHaveText('Your scatter is in.');
});

/* Start reading on the reveal opens the first statement (flow pages 34 and 35), and Back returns to the reveal. Each
   screen stays on the page until the next is ready to draw. The feast's page was once built afresh for each of its
   addresses, which left nothing but the loader on the page for a third of a second, and longer on a slow connection. */
test('Start reading takes the reveal to the first statement with nothing between, and Back returns the same way', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
  const start = page.getByRole('button', { name: 'Start reading', exact: true });
  await expect(start).toBeEnabled();
  const screen = await watchGameScreen(page);
  await start.click();
  await expect(page.locator('.phone-statement')).toBeFocused();
  expect(new URL(page.url()).pathname).toBe(`/feasts/${feast.id}/read`);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Statements are open', exact: true })).toBeVisible();
  expect(await screen.states()).toEqual(['reveal', 'reading', 'reveal']);
  expect(await screen.lapses()).toEqual([]);
});
