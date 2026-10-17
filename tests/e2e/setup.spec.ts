import { test, expect, type Page } from 'playwright/test';
import { connectLocal } from './session.js';

/** The seeded burrow's owner, rehearsal critter 1, opens Start a feast for an options feast with three options. */
async function openOptionsSetup(page: Page, request: Parameters<Parameters<typeof test>[2]>[0]['request']) {
  const seeded = await request.post('/api/dev/seed', { data: { kind: 'options', phase: 'draft' } });
  expect(seeded.ok()).toBe(true);
  const { burrowId } = await seeded.json() as { burrowId: string };
  await page.goto('/');
  await connectLocal(page, 1);
  await page.goto(`/burrows/${burrowId}/feasts/new`);
  await page.getByRole('radio', { name: /^To options/ }).check();
  for (let added = 1; added < 3; added++) await page.getByRole('button', { name: 'Add an option', exact: true }).click();
}

// Groups are cards (Design System §3.4); a pill radius on a tall group curves through its own fields (QA lifecycle-14).
test('the set-up form draws its groups as cards, not capsules', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openOptionsSetup(page, request);
  const radii = await page.locator('form fieldset').evaluateAll(groups => groups.map(group => parseFloat(getComputedStyle(group).borderTopLeftRadius)));
  expect(radii.length).toBeGreaterThanOrEqual(4);
  for (const radius of radii) expect(radius).toBeLessThanOrEqual(22);
});
