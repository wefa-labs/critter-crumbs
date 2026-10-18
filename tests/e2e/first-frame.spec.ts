import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

/*
 * Each game screen used to lay itself out for a 390 x 844 phone on its first frame and only then for the real window,
 * so a desktop showed the phone layout for a frame or two whenever a game screen opened (QA lifecycle-12). The record
 * is made on every change to the document, so even one wrong frame is caught.
 */
test('on desktop each game screen is laid out for the desktop from its first frame', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const first: string[] = [], seen = new WeakSet<Element>();
    Object.assign(window, { firstLayouts: first });
    new MutationObserver(() => {
      for (const body of document.querySelectorAll('.game-body')) {
        if (seen.has(body)) continue;
        seen.add(body);
        first.push(`${body.getAttribute('data-game-state')} desktop=${body.getAttribute('data-desktop')}`);
      }
    }).observe(document, { subtree: true, childList: true });
  });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json() as { feasts: { id: string }[] };
  await page.goto(`/feasts/${feasts[0]!.id}`); await connectLocal(page, 1);
  await expect(page.locator('.game-body')).toBeVisible();
  await page.getByRole('button', { name: 'Start reading', exact: true }).click();
  await expect(page.locator('.panel-statement')).toBeVisible();
  const layouts = await page.evaluate(() => (window as unknown as { firstLayouts: string[] }).firstLayouts);
  expect(layouts.length).toBeGreaterThan(0);
  expect(layouts.filter(layout => !layout.endsWith('desktop=true'))).toEqual([]);
});
