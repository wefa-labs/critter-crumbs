import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

/* A burrow link that leads nowhere once read "Can't reach the burrow right now. Try again in a moment.", with Try
   again. The store answers 404 for a burrow it does not have and 400 for an id that is not one, as when a link is cut
   short in copying; both now say there is no burrow at the link. A burrow the visitor is not in still says it doesn't
   know them yet. */
for (const [title, id] of [['a link to a burrow the store does not have says there is no burrow there', '00000000-0000-4000-8000-000000000000'], ['a burrow link cut short in copying says there is no burrow there', '00000000-0000-4000']] as const) test(title, async ({ page }) => {
  await page.goto(`/burrows/${id}`);
  await connectLocal(page, 1);
  await expect(page.getByRole('heading', { name: "There's no burrow at this link", exact: true })).toBeVisible();
  await expect(page.getByText('Check the link with whoever sent it.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', '/');
  await expect(page.getByText("Can't reach the burrow right now. Try again in a moment.")).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toHaveCount(0);
});

test('a burrow the visitor is not in still says it does not know them yet', async ({ page, browser }) => {
  await page.goto('/'); await connectLocal(page, 1);
  await page.getByRole('link', { name: 'Start a burrow', exact: true }).click();
  await page.getByRole('textbox', { name: 'Burrow name' }).fill('Quiet burrow');
  await page.getByRole('button', { name: 'Create burrow', exact: true }).click();
  await expect(page).toHaveURL(/\/burrows\/[0-9a-f-]{36}$/);
  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto(page.url()); await connectLocal(visitor, 2);
  await expect(visitor.getByRole('heading', { name: "This burrow doesn't know you yet", exact: true })).toBeVisible();
});
