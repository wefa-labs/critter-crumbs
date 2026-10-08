import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

/** A reload keeps the session cookie but drops the in-memory signer (E19). */
test('a write after reload asks to reconnect, keeps the crumbs, and says to try again', async ({ page }) => {
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}/scatter`); await connectLocal(page, 1);
  await page.reload();
  const field = page.locator('.focus-count input').first();
  await field.fill('100'); await field.press('Enter');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await page.getByRole('dialog', { name: 'Confirm your scatter' }).getByRole('button', { name: 'Scatter These', exact: true }).click();
  const reconnect = page.getByRole('dialog', { name: 'Choose how to connect' });
  await expect(reconnect).toBeVisible();
  await expect(reconnect).toContainText('Your crumbs are still here');
  await page.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).click();
  await expect(page.locator('#alert')).toHaveText('Connected. Try that again now — nothing you entered was lost.');
  await expect(field).toHaveValue('100');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await page.getByRole('dialog', { name: 'Confirm your scatter' }).getByRole('button', { name: 'Scatter These', exact: true }).click();
  await expect(page.locator('.dock-scattered')).toBeFocused();
});
