import { test, expect, type Page } from 'playwright/test';
import { connectLocal } from './session.js';

/* Every screen but the launcher arrives after the page. A tab opened before a new deployment asks for files the
   deployment no longer has, and a poor connection loses requests: either way the page used to go blank, with nothing
   to say what to do (QA production-build-06). A development stack serves each screen as a module of its own, so
   blocking that module's request plays both. A lost request is asked for once more; a screen that still does not
   arrive says so in its place, with Reload, which is the member's to press: nothing reloads by itself. */
const NOTICE = "This screen didn't load. Reload to try again — nothing you saved is lost.";
function lose(page: Page, module: string, times = Infinity) {
  const asked = { count: 0 };
  void page.route(url => url.pathname === module, route => ++asked.count <= times ? route.abort('failed') : route.continue());
  return asked;
}
async function seed(page: Page, phase: 'gathering' | 'scattering') {
  const response = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase } }); expect(response.ok()).toBe(true);
  return (await response.json()).feasts[0] as { id: string; title: string };
}

test('a feast link whose screen does not arrive says so with Reload, asks twice at most, and Reload brings it', async ({ page }) => {
  const feast = await seed(page, 'gathering');
  const asked = lose(page, '/src/app/feast.tsx');
  let documents = 0; page.on('request', request => { if (request.resourceType() === 'document') documents += 1; });
  await page.goto(`/feasts/${feast.id}`);
  await expect(page.getByRole('heading', { level: 1, name: "Can't open this right now", exact: true })).toBeVisible();
  await expect(page.locator('#content').getByText(NOTICE, { exact: true })).toBeVisible();
  const reload = page.getByRole('button', { name: 'Reload', exact: true });
  await expect(reload).toBeVisible();
  // the first request and one more, and the page stays as it is until the member chooses
  expect(asked.count).toBe(2);
  await page.waitForTimeout(1500);
  expect(asked.count).toBe(2); expect(documents).toBe(1);
  await page.unrouteAll({ behavior: 'wait' });
  await reload.click();
  await expect(page.getByRole('heading', { level: 1, name: feast.title, exact: true })).toBeVisible();
  expect(documents).toBe(2);
});

test('a screen whose first request is lost arrives on the second, with no notice', async ({ page }) => {
  const feast = await seed(page, 'gathering');
  const asked = lose(page, '/src/app/feast.tsx', 1);
  await page.goto(`/feasts/${feast.id}`);
  await expect(page.getByRole('heading', { level: 1, name: feast.title, exact: true })).toBeVisible();
  expect(asked.count).toBe(2);
  await expect(page.getByRole('button', { name: 'Reload', exact: true })).toHaveCount(0);
});

/* The step everyone takes once scattering opens: Start reading brings the reading and scatter screen, which arrives
   then. It used to leave nothing but an empty page, a moment after the reveal was drawn. */
test('Start reading with the scatter screen lost says so with Reload, and Reload opens the reading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const feast = await seed(page, 'scattering');
  // lost before connecting: the feast page also asks for it early, once scattering is open
  lose(page, '/src/app/scatter.tsx');
  await page.goto(`/feasts/${feast.id}`); await connectLocal(page, 1);
  const start = page.getByRole('button', { name: 'Start reading', exact: true });
  await expect(start).toBeEnabled();
  await start.click();
  await expect(page.getByRole('heading', { level: 1, name: "Can't open this right now", exact: true })).toBeVisible();
  await expect(page.locator('#content').getByText(NOTICE, { exact: true })).toBeVisible();
  await page.unrouteAll({ behavior: 'wait' });
  await page.getByRole('button', { name: 'Reload', exact: true }).click();
  expect(new URL(page.url()).pathname).toBe(`/feasts/${feast.id}/read`);
  await expect(page.locator('.phone-statement')).toBeVisible();
});
