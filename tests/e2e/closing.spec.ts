import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

/* Flow page 41: "The deadline passed with the screen open: the critters fall asleep and the controls stop." Then the
   feast is laid out (flow 42). The server clock is set a few seconds short of the deadline, so the screen's trusted
   clock reaches it while the screen is open, as it would in a real session. */
test('the deadline passing with the scatter screen open stops it at dusk, then lays the feast out', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}/scatter`); await connectLocal(page, 1);
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'live');
  // An unsaved allocation on screen: closing stops the same screen, it does not start a fresh one.
  const field = page.locator('.focus-count input'); await field.fill('7'); await field.press('Enter');
  await expect(page.locator('.crumbs-left-count')).toHaveText('93');
  expect((await page.request.post('/api/dev/time', { data: { now: feast.scatteringEndsAt - 4000 } })).ok()).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.dock-closed')).toHaveText('Scattering has closed. The feast is on its way.', { timeout: 15000 });
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'disabled');
  await expect(page.locator('.game-body')).toHaveAttribute('data-game-state', 'closed');
  await expect(page.locator('.focus-count .count-output [aria-hidden]')).toHaveText('7');
  await expect(page.locator('.game-toast')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'The feast is being laid out', exact: true })).toBeVisible({ timeout: 15000 });
});
