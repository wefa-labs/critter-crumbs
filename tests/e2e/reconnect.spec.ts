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
  // nothing was declined: the sheet asks to connect again (Technical Spec §15 E19), not "Not confirmed" (QA edge-states-10)
  await expect(reconnect).toContainText('Connect again to save. Your changes are still here.');
  await expect(reconnect).not.toContainText('Not confirmed');
  await page.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).click();
  await expect(page.locator('#alert')).toHaveText('Connected. Try that again now — nothing you entered was lost.');
  await expect(field).toHaveValue('100');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await page.getByRole('dialog', { name: 'Confirm your scatter' }).getByRole('button', { name: 'Scatter These', exact: true }).click();
  await expect(page.locator('.dock-scattered')).toBeFocused();
});

/** A session the store has ended asks to connect again with the same reason, and the words being written stay (E19). */
test('a statement saved after the session has ended asks to connect again and keeps the words', async ({ page }) => {
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
  const editor = page.locator('.statement-editor textarea').first();
  await editor.fill('Kept the garden watered all summer.');
  await page.context().clearCookies();
  await page.locator('.statement-editor').first().getByRole('button', { name: 'Save statement', exact: true }).click();
  const reconnect = page.getByRole('dialog', { name: 'Choose how to connect' });
  await expect(reconnect).toContainText('Connect again to save. Your changes are still here.');
  await page.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).click();
  await expect(reconnect).toHaveCount(0);
  await expect(editor).toHaveValue('Kept the garden watered all summer.');
});
