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

// A deadline already past used to read "Scattering has to close after gathering." (QA edge-states-09).
test('saving a draft whose gathering deadline has already passed says so', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openOptionsSetup(page, request);
  await page.getByRole('textbox', { name: 'Feast title', exact: true }).fill('Our budget');
  const names = page.getByRole('textbox', { name: 'Option name', exact: true });
  for (const [index, name] of ['Garden', 'Library', 'Workshop'].entries()) await names.nth(index).fill(name);
  await page.getByLabel('Gathering closes', { exact: true }).fill('2020-01-01T12:00');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.locator('form .notice.error')).toHaveText('That gathering deadline has already passed. Choose a later time.');
});

// Opening a draft after its gathering deadline offered a dialog that could only fail (QA copy-08, item 2).
test('a draft whose gathering deadline has passed says it cannot open, and what to do instead', async ({ page, request }) => {
  const seeded = await request.post('/api/dev/seed', { data: { kind: 'options', phase: 'draft' } }); expect(seeded.ok()).toBe(true);
  const { feasts } = await seeded.json() as { feasts: { id: string; gatheringEndsAt: number }[] }, draft = feasts[0]!;
  expect((await request.post('/api/dev/time', { data: { now: draft.gatheringEndsAt + 60000 } })).ok()).toBe(true);
  await page.goto('/');
  await connectLocal(page, 1);
  await page.goto(`/feasts/${draft.id}`);
  await expect(page.getByText("This draft's gathering deadline has passed, so it can't open. Cancel it and start a new feast with later times.", { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open the feast', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel this feast', exact: true })).toBeVisible();
});
