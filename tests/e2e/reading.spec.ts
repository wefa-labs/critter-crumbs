import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

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
