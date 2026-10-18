import { test, expect } from 'playwright/test';

/* A feast link that leads nowhere once read "Can't reach the burrow right now. Try again in a moment.", which sent the
   visitor to try again for a feast that was never there. The store answers 404 for a feast it does not have and 400 for
   an id that is not one, as when a link is cut short in copying; both now say there is no feast at the link. Every
   other failure still says the burrow can't be reached, with Try again. */
for (const [title, id] of [['a link to a feast the store does not have says there is no feast there', '00000000-0000-4000-8000-000000000000'], ['a feast link cut short in copying says there is no feast there', '00000000-0000-4000']] as const) test(title, async ({ page }) => {
  await page.goto(`/feasts/${id}`);
  await expect(page.getByRole('heading', { name: "There's no feast at this link", exact: true })).toBeVisible();
  await expect(page.getByText('Check the link with whoever sent it.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', '/');
  await expect(page.getByText("Can't reach the burrow right now. Try again in a moment.")).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toHaveCount(0);
});

test('a feast read the store cannot answer still offers Try again', async ({ page }) => {
  // The stand-in answer carries the store's own time, as every answer from the store does.
  const { serverNow } = await (await page.request.get('/api/feasts/00000000-0000-4000-8000-000000000000')).json();
  await page.route('**/api/feasts/*', route => route.fulfill({ status: 503, json: { error: 'err.storeUnreachable', serverNow } }));
  await page.goto('/feasts/00000000-0000-4000-8000-000000000000');
  await expect(page.getByRole('heading', { name: "Can't open this right now", exact: true })).toBeVisible();
  // The polite announcer reads the same line out, so the page's own line is found inside the page.
  await expect(page.locator('#content').getByText("Can't reach the burrow right now. Try again in a moment.", { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
});
