import { test, expect, type Page } from 'playwright/test';
import { connectLocal } from './session.js';

/*
 * The circle's frame loop writes each critter's stage and the dock as inline styles. A length with no unit is ignored
 * unless it is 0, so the circle jumped from place to place instead of gliding, and on desktop the dock was left at 0 px
 * once the feast had played, its Results pill under the huddle (QA lifecycle-02).
 */

async function openScatter(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json() as { feasts: { id: string; scatteringEndsAt: number }[] }, feast = feasts[0]!;
  await page.goto(`/feasts/${feast.id}/scatter`); await connectLocal(page, 1);
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'live');
  return feast;
}

test('on desktop the circle glides from one critter to the next', async ({ page }) => {
  await openScatter(page);
  await page.evaluate(() => {
    const spot = document.querySelector<HTMLElement>('.circle-spot[data-spot="0"]')!, lefts = new Set<string>();
    const sample = () => { lefts.add(spot.style.left); requestAnimationFrame(sample); };
    requestAnimationFrame(sample);
    Object.assign(window, { lefts });
  });
  await page.locator('.dock-turn').last().click();
  await page.waitForTimeout(700);
  const lefts = await page.evaluate(() => [...(window as unknown as { lefts: Set<string> }).lefts]);
  // where it stood, where it stops, and the places it passed through on the way
  expect(lefts.length).toBeGreaterThan(3);
});

test('on desktop the folded dock keeps its height once the feast has played', async ({ page }) => {
  test.setTimeout(90000);
  const feast = await openScatter(page);
  if (await page.locator('.focus-count input').count() === 0) await page.locator('.dock-turn').last().click();
  const field = page.locator('.focus-count input'); await field.fill('100'); await field.press('Enter');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await page.getByRole('dialog', { name: 'Confirm your scatter' }).getByRole('button', { name: 'Scatter These', exact: true }).click();
  await expect(page.locator('.dock-scattered')).toBeVisible();
  // The deadline passes with the screen open: dusk, the feast plays, then the results.
  expect((await page.request.post('/api/dev/time', { data: { now: feast.scatteringEndsAt - 2500 } })).ok()).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('heading', { name: 'Results', exact: true })).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await page.locator('.dock-position').boundingBox())?.height ?? 0, { timeout: 15000 }).toBeGreaterThanOrEqual(74);
  await expect(page.locator('.dock-position').getByRole('button', { name: 'Results', exact: true })).toBeVisible();
});
