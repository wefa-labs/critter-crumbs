import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

test('mounted Koota world subscription handles change, removal and cleanup', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/__preview/world-traits');
  await expect(page.getByTestId('trait-value')).toHaveText('Still critters off');
  await page.getByRole('button', { name: 'Change world setting' }).click();
  await expect(page.getByTestId('trait-value')).toHaveText('Still critters on');
  await page.getByRole('button', { name: 'Remove world setting' }).click();
  await expect(page.getByTestId('trait-value')).toHaveText('Setting removed');
  await page.getByRole('button', { name: 'Show or hide subscriber' }).click();
  await page.getByRole('button', { name: 'Change world setting' }).click();
  await expect(page.getByTestId('trait-value')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show or hide subscriber' }).click();
  await expect(page.getByTestId('trait-value')).toHaveText('Still critters on');
  await page.goto('/'); expect(errors).toEqual([]);
});

test('local connection, identity and creator removal leave a durable visible history', async ({ page }) => {
  await page.goto('/');
  await connectLocal(page, 1);
  await page.getByRole('link', { name: 'Start a burrow', exact: true }).click();
  await page.getByRole('textbox', { name: 'Burrow name' }).fill('Browser council');
  await page.getByRole('button', { name: 'Create burrow', exact: true }).click();
  const add = page.getByRole('textbox', { name: 'Address or ENS name' });
  await expect(add).toBeFocused();
  await add.fill('0x00000000000000000000000000000000000000ff');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  // Each row's control names its member; the dialog's control keeps the plain label.
  await page.getByRole('button', { name: 'Remove from burrow: 0x0000…00ff', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Membership history' })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Membership history' })).toBeVisible();
  // The line uses the §5.5 short form for a nameless member and never widens the page.
  await expect(page.locator('.history-list li p').first()).toHaveText(/ removed 0x0000…00ff$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await expect(page.locator('#announce')).toHaveCount(1);
  await expect(page.locator('#alert')).toHaveCount(1);
});
