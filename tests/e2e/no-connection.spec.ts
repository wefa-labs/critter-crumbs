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

/* Some browsers refuse the clipboard, as an app's own browser may, and that is where a feast link tapped in a chat often
   opens. Copy link then says so, and the page's address shows under the notice, where one press selects all of it to
   copy by hand (docs/decisions.md, 2026-11-09). */
test('when the browser refuses the clipboard, the page’s address shows under the notice and one press selects it all', async ({ page }) => {
  await page.addInitScript(() => { navigator.clipboard.writeText = () => Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError')); });
  await page.route('**/api/dev/config', route => route.fulfill({ json: { enabled: false } }));
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/feasts/${feasts[0].id}`);
  await page.getByRole('button', { name: 'Connect to join', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: 'Choose how to connect' }), pageAddress = sheet.getByText(page.url(), { exact: true });
  const copyLink = sheet.getByRole('button', { name: 'Copy link', exact: true });
  await expect(copyLink).toBeVisible();
  await expect(pageAddress).toHaveCount(0);
  await copyLink.click();
  await expect(sheet.getByRole('alert')).toHaveText("Couldn't copy. Try again, or select the text and copy it yourself.");
  await expect(pageAddress).toBeInViewport({ ratio: 1 });
  const notice = (await sheet.locator('.sheet-notice').boundingBox())!;
  expect((await pageAddress.boundingBox())!.y).toBeGreaterThanOrEqual(notice.y + notice.height);
  await pageAddress.click();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(page.url());
  // Cancel takes the sheet's words with it, so nothing behind it asks for text that is no longer there
  await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText(/Couldn't copy/)).toHaveCount(0);
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
