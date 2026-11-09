import { test, expect, type Page } from 'playwright/test';
import { connectLocal } from './session.js';

/** A write as the page's own member, whose session cookie only the page itself sends (session.ts, readJson). */
const post = (page: Page, path: string, body?: unknown) => page.evaluate(async ([target, data]) => (await fetch(target, { method: 'POST', credentials: 'same-origin', ...(data === undefined ? {} : { body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }) })).status, [path, body] as const);

/* The feast's pages before scattering on the shared frame (docs/reviews/ui-audit-2026-11, screens 26 and 33). */
test('a saved draft lists every detail with both closes, and offers Cancel this feast beside Open the feast', async ({ page, request }) => {
  const seeded = await request.post('/api/dev/seed', { data: { kind: 'people', phase: 'draft' } }); expect(seeded.ok()).toBe(true);
  const { feasts } = await seeded.json() as { feasts: { id: string }[] };
  await page.goto('/'); await connectLocal(page, 1); await page.goto(`/feasts/${feasts[0]!.id}`);
  await expect(page.getByText("Draft saved. Review the details, then open the feast when you're ready.", { exact: true })).toBeVisible();
  await expect(page.locator('.draft-rows dt')).toHaveText(['Where do the crumbs go?', 'Crumbs per critter', 'Gathering closes', 'Scattering closes', 'The result', 'Who gave what']);
  const foot = page.locator('.place-actions');
  await expect(foot.getByRole('button', { name: 'Cancel this feast', exact: true })).toBeVisible();
  await expect(foot.getByRole('button', { name: 'Open the feast', exact: true })).toBeVisible();
  await expect(page.locator('.critter-grid')).toHaveCount(0);
});

/* Someone the burrow adds after scattering opened is not among the feast's critters (PRD R7). They used to be invited to
   read and scatter first, and told only after Start reading (QA edge-states-07). Willow (8) leaves while gathering,
   scattering opens without Willow, and Moss (1) adds Willow back. */
test('someone who joined after scattering opened is told so before anything asks them to read or scatter', async ({ page, browser }) => {
  const seeded = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seeded.ok()).toBe(true);
  const { burrowId, feasts, accounts } = await seeded.json() as { burrowId: string; feasts: { id: string; gatheringEndsAt: number }[]; accounts: { address: string }[] }, feast = feasts[0]!;
  const lateContext = await browser.newContext({ viewport: { width: 375, height: 812 } }), late = await lateContext.newPage();
  try {
    await late.goto('/'); await connectLocal(late, 8);
    expect(await post(late, `/api/burrows/${burrowId}/leave`)).toBe(200);
    expect((await page.request.post('/api/dev/time', { data: { now: feast.gatheringEndsAt + 60000 } })).ok()).toBe(true);
    await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
    await expect(page.getByRole('button', { name: 'Start reading', exact: true })).toBeVisible();
    expect(await post(page, `/api/burrows/${burrowId}/members`, { address: accounts[7]!.address })).toBe(200);
    expect(await post(late, `/api/burrows/${burrowId}/join`)).toBe(200);
    await late.goto(`/feasts/${feast.id}`);
    await expect(late.getByText("This feast started before you joined the burrow. You'll be in the next one.", { exact: true })).toBeVisible();
    await expect(late.getByText('0 of 7 have scattered', { exact: true })).toBeVisible();
    await expect(late.getByRole('button', { name: 'Start reading', exact: true })).toHaveCount(0);
    await expect(late.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', `/burrows/${burrowId}`);
  } finally { await lateContext.close(); }
});

/* A people feast with fewer than three critters when scattering opens ends (PRD P11); its page said why while its header
   still counted down to scattering closing (QA edge-states-15). */
test('a feast that ended for want of three critters says why in a leaf notice and no longer counts down', async ({ page, request }) => {
  const seeded = await request.post('/api/dev/seed', { data: { kind: 'people', phase: 'void' } }); expect(seeded.ok()).toBe(true);
  const { burrowId, feasts } = await seeded.json() as { burrowId: string; feasts: { id: string; title: string }[] };
  await page.goto('/'); await connectLocal(page, 1); await page.goto(`/feasts/${feasts[0]!.id}`);
  await expect(page.locator('.sheet-notice')).toHaveText(`${feasts[0]!.title} ended before scattering: a people feast needs at least 3 critters. Start a new one when the burrow is ready.`);
  await expect(page.getByText(/closes|Closing soon/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', `/burrows/${burrowId}`);
});
