import { test, expect } from 'playwright/test';

/* A feast link tapped in a chat app opens in the phone's own browser or the chat app's, where there is nothing to
   connect with: the first screen most council members on phones will meet (QA production-build-07). The sheet used to
   say only that no connection was available, with nothing to press but Cancel. It now says what to do there, and Copy
   link puts the page's address on the clipboard to take to the app they connect with. A development stack always
   offers the rehearsal critters, so this turns them off; the test browser has no app of its own to offer. */
for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) test(`with nothing to connect with, Connect says what to do and copies the page’s link, on the launcher and on a feast link, at ${viewport.width}`, async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('**/api/dev/config', route => route.fulfill({ json: { enabled: false } }));
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  await page.setViewportSize(viewport);
  for (const [path, connect] of [['/', 'Connect'], [`/feasts/${feast.id}`, 'Connect to join']] as const) {
    await page.goto(path);
    await page.getByRole('button', { name: connect, exact: true }).click();
    const sheet = page.getByRole('dialog', { name: 'Choose how to connect' });
    await expect(sheet.getByText("No connection is available in this browser yet. Copy this page's link and open it in the app you connect with, on your phone or on a computer.", { exact: true })).toBeVisible();
    const copyLink = sheet.getByRole('button', { name: 'Copy link', exact: true });
    // inside the sheet on the phone, whatever its height
    const target = (await copyLink.boundingBox())!;
    expect(target.height).toBeGreaterThanOrEqual(44); expect(target.y + target.height).toBeLessThanOrEqual(viewport.height);
    await page.evaluate(() => navigator.clipboard.writeText(''));
    await copyLink.click();
    // said where the button was pressed, once the browser has the address
    await expect(sheet.getByRole('group', { name: 'Update', exact: true })).toContainText('Link copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
    await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // How it works stays under the one way in
    await expect(page.getByRole('link', { name: 'How it works', exact: true })).toBeVisible();
  }
});

/* Looking for what the browser offers can fail too, as when the code that asks it does not arrive. That is not "nothing
   to connect with": the sheet closes and the screen behind says something went wrong, and the next press looks again. */
test('when looking for a way to connect fails, the sheet does not say this browser has nothing to connect with', async ({ page }) => {
  let failing = true;
  await page.route('**/api/dev/config', route => failing ? route.abort('failed') : route.continue());
  await page.route(url => url.pathname === '/src/crypto/index.ts', route => failing ? route.abort('failed') : route.continue());
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.locator('.launch-sheet .sheet-notice')).toHaveText('Something went wrong. Nothing you did was lost.');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText(/No connection is available/)).toHaveCount(0);
  failing = false;
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Choose how to connect' }).getByRole('button', { name: 'Rehearsal critter 1', exact: true })).toBeVisible();
});
