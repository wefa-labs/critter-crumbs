import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';
test('statements remain private, cap safely, then reveal and read without WebGL or cleanup errors', async ({ page, browser }) => {
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seed.ok()).toBe(true);
  const { feasts, accounts } = await seed.json(), feast = feasts[0];
  const errors: string[] = [], requests: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('request', request => requests.push(request.url()));
  await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
  const own = page.getByRole('textbox', { name: 'Your statement', exact: true });
  await own.fill('🦊'.repeat(2001)); await expect(page.getByText('2000 / 2,000', { exact: true })).toBeVisible();
  await expect(page.locator('#announce')).toContainText('2,000 characters');
  const text = 'Private contribution\nhttps://example.com/work\n<script>Literal text</script>';
  await own.fill(text); await page.getByRole('button', { name: 'Save statement', exact: true }).click(); await expect(page.getByText('Saved.', { exact: true }).first()).toBeVisible();
  const second = await browser.newContext({ viewport: { width: 375, height: 812 } }), other = await second.newPage();
  await other.goto(new URL(`/feasts/${feast.id}`, page.url()).href); await connectLocal(other, 2);
  await expect(other.getByText('Private contribution', { exact: false })).toHaveCount(0);
  await page.request.post('/api/dev/time', { data: { now: feast.gatheringEndsAt } });
  await page.reload(); await expect(page.getByRole('button', { name: 'Start reading', exact: true })).toBeFocused();
  await expect(page.locator('#announce')).toContainText('Statements are open');
  await page.getByRole('button', { name: 'Start reading', exact: true }).click();
  // Desktop keeps the focused critter's statement in the side panel; the dock's › steps through the circle.
  await expect(page.locator('.panel-statement')).toBeVisible();for(let i=0;i<feast.targets.findIndex((t:{name:string})=>t.name===accounts[0].name);i++)await page.locator('.dock-turn').last().click();
  await expect(page.getByRole('article', { name: accounts[0].name, exact: true })).toContainText('<script>Literal text</script>');
  await expect(page.locator('.statement-text script')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'https://example.com/work', exact: true })).toHaveAttribute('href', 'https://example.com/work');
  for(let i=feast.targets.findIndex((t:{name:string})=>t.name===accounts[0].name);i<7;i++)await page.locator('.dock-turn').last().click(); await expect(page.locator('.panel-statement h2')).toHaveText(feast.targets[7].name);
  expect(errors).toEqual([]); expect(requests.some(url => /(?:\/three\/|\/three[-.]|@react-three)/.test(url))).toBe(false);
  await second.close();
});

/* The page turns to the statements the second gathering closes. Words still being written there are not saved, and the
   member is told so rather than finding them gone (QA edge-states-03). */
test('words still unsaved when gathering closes are not lost without a word', async ({ page }) => {
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
  await page.locator('.statement-editor textarea').first().fill('Fixed the tool shed door, unsaved.');
  expect((await page.request.post('/api/dev/time', { data: { now: feast.gatheringEndsAt - 1500 } })).ok()).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.statement-editor')).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator('.app-toast')).toContainText('Gathering closed before your latest words were saved. Anything you saved earlier still stands.');
});
