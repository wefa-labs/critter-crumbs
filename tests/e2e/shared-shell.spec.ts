import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
  test(`connecting keeps its frame and cancellation in place at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    let discover!: () => void, answer!: () => void;
    const discovery = new Promise<void>(resolve => { discover = resolve; });
    const signature = new Promise<void>(resolve => { answer = resolve; });
    await page.route('**/api/dev/config', async route => {
      await discovery;
      await route.continue();
    });
    await page.route('**/api/session/nonce', async route => { await signature; await route.abort(); });
    try {
      await page.goto('/');
      await page.getByRole('button', { name: 'Connect', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Choose how to connect' });
      await expect(dialog.locator('.sheet-loader')).toBeVisible();
      const loading = (await dialog.boundingBox())!;
      const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true });
      const cancelAt = (await cancel.boundingBox())!;

      discover();
      await expect(dialog.getByRole('button', { name: 'Rehearsal critter 1', exact: true })).toBeVisible();
      expect(await dialog.boundingBox()).toEqual(loading);
      expect(await cancel.boundingBox()).toEqual(cancelAt);
      await dialog.getByRole('button', { name: 'Rehearsal critter 1', exact: true }).click();
      await expect(dialog).toContainText('Confirm in Rehearsal critter 1');
      expect(await dialog.boundingBox()).toEqual(loading);
      expect(await cancel.boundingBox()).toEqual(cancelAt);
      expect(loading.y).toBeGreaterThanOrEqual(0);
      expect(loading.y + loading.height).toBeLessThanOrEqual(viewport.height);
      answer();
      await expect(dialog).toHaveCount(0);
      await expect(page.locator('.launch-sheet .sheet-notice')).toBeVisible();
    } finally { discover(); answer(); }
  });
}

test('your critter is one screen over the page it was opened from, with the settings as switches, and goes back to it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { burrowId } = await seed.json();
  await page.goto(`/burrows/${burrowId}`);
  await connectLocal(page, 1);
  const face = page.getByRole('button', { name: 'Your critter and settings', exact: true }), adding = page.getByRole('textbox', { name: 'Address or ENS name', exact: true });
  // something typed on the page beneath is still there when the profile goes back to it
  await adding.fill('fern.eth');
  await face.click();
  const profile = page.getByRole('region', { name: 'Your critter', exact: true });
  await expect(page).toHaveURL(/\/your-critter$/);
  await expect(profile.getByRole('heading', { level: 1, name: 'Your critter', exact: true })).toBeVisible();
  await expect(profile.getByRole('note', { name: 'Development status', exact: true })).toContainText('Beta · Testnet');
  await expect(profile).toBeFocused();
  await expect(profile.getByText('0x7E5F…5Bdf', { exact: true })).toBeVisible();
  await expect(profile.getByText("This one's yours.", { exact: true })).toBeVisible();
  await expect(profile.getByRole('button', { name: 'Close' })).toHaveCount(0);
  // the settings are switches; Simple view waits for critters with a 3D mesh (Design System D34)
  await expect(profile.getByRole('switch')).toHaveCount(4);
  for (const name of ['Sounds', 'Music', 'Still critters', 'Dark mode']) await expect(profile.getByRole('switch', { name, exact: true })).toBeVisible();
  const still = profile.getByRole('switch', { name: 'Still critters', exact: true });
  await still.check();
  expect(await page.evaluate(() => [localStorage.getItem('cc.motion.still'), document.documentElement.dataset.still])).toEqual(['1', 'true']);
  await still.uncheck();
  expect(await page.evaluate(() => localStorage.getItem('cc.motion.still'))).toBe('0');
  await expect(profile.getByRole('button', { name: 'Disconnect', exact: true })).toBeVisible();
  await expect(profile.getByRole('link', { name: 'How it works', exact: true })).toHaveAttribute('href', '/how-it-works');
  // the back chevron, Escape and the browser's Back each return to the burrow as it was, with the focus on the face
  await profile.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/burrows/${burrowId}$`));
  await expect(adding).toHaveValue('fern.eth');
  await expect(face).toBeFocused();
  await face.click();
  await expect(profile).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(profile).toHaveCount(0);
  await expect(face).toBeFocused();
  await face.click();
  await expect(profile).toBeVisible();
  await page.goBack();
  await expect(profile).toHaveCount(0);
  await expect(adding).toHaveValue('fern.eth');
  // a visit to the first steps from the profile, which return to it, keeps the way back to the burrow
  await face.click();
  await profile.getByRole('link', { name: 'How it works', exact: true }).click();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(profile).toBeVisible();
  await profile.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/burrows/${burrowId}$`));

  // home: a whole burrow card opens its burrow, and Start a burrow makes one
  await page.getByRole('link', { name: 'Critter Crumbs', exact: true }).click();
  const card = page.locator(`a[href="/burrows/${burrowId}"]`);
  await card.getByText('8 critters', { exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/burrows/${burrowId}$`));
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([390, 844]);
  await page.getByRole('link', { name: 'Critter Crumbs', exact: true }).click();
  await page.getByRole('link', { name: 'Start a burrow', exact: true }).click();
  await page.getByRole('textbox', { name: 'Burrow name', exact: true }).fill(`Shell ${burrowId.slice(0, 8)}`);
  await page.getByRole('button', { name: 'Create burrow', exact: true }).click();
  await expect(page.getByRole('heading', { name: `Shell ${burrowId.slice(0, 8)}`, exact: true })).toBeVisible();
  await page.goto(`/burrows/${burrowId}`);
  await expect(page.getByRole('heading', { name: 'Rehearsal burrow', exact: true })).toBeVisible();
  for (const viewport of [{ width: 375, height: 812 }, { width: 390, height: 667 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([viewport.width, viewport.height]);
    await page.screenshot({ path: `.scratch/shared-shell/burrow-${viewport.width}.png` });
    await face.click();
    await expect(profile).toBeVisible();
    await page.screenshot({ path: `.scratch/shared-shell/profile-${viewport.width}.png` });
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([viewport.width, viewport.height]);
    // the foot's actions stay on the screen however short it is
    const disconnect = (await profile.getByRole('button', { name: 'Disconnect', exact: true }).boundingBox())!;
    expect(disconnect.y).toBeGreaterThanOrEqual(0);
    expect(disconnect.y + disconnect.height).toBeLessThanOrEqual(viewport.height);
    await page.keyboard.press('Escape');
    await expect(profile).toHaveCount(0);
  }
});

test('copy success is visible, repeatable and announced once, including inside the profile', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { burrowId } = await seed.json();
  await page.goto(`/burrows/${burrowId}`);
  await connectLocal(page, 1);
  const copyLink = page.getByRole('button', { name: 'Copy burrow link', exact: true });
  await copyLink.click();
  const toast = page.locator('.app-toast');
  await expect(toast).toContainText('Link copied.');
  await expect(page.locator('#announce')).toHaveText('Link copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`http://127.0.0.1:5173/burrows/${burrowId}`);
  await copyLink.click();
  await expect(toast).toHaveCount(1);
  await toast.getByRole('button', { name: 'Dismiss notification', exact: true }).click();
  await expect(toast).toHaveCount(0);
  await expect(copyLink).toBeFocused();
  await page.getByRole('button', { name: 'Your critter and settings', exact: true }).click();
  const profile = page.getByRole('region', { name: 'Your critter', exact: true });
  await profile.getByRole('button', { name: 'Copy address', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf');
  // the page's own notice and live regions stand over the profile, outside the page beneath it
  await expect(toast).toContainText('Address copied.');
  await expect(page.locator('#announce')).toHaveText('Address copied.');
  await expect(page.locator('#announce')).toHaveCount(1);
  await expect(page.locator('#alert')).toHaveCount(1);
  await page.screenshot({ path: '.scratch/shared-shell/profile-notification.png' });
  await toast.getByRole('button', { name: 'Dismiss notification', exact: true }).click();
  await expect(profile.getByRole('button', { name: 'Copy address', exact: true })).toBeFocused();
});

test('a failed copy shows an error and never announces success', async ({ page }) => {
  await page.addInitScript(() => {
    let copied = false;
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { if (copied) throw new Error('Clipboard unavailable'); copied = true; } } });
  });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { burrowId } = await seed.json();
  await page.goto(`/burrows/${burrowId}`);
  await connectLocal(page, 1);
  await page.getByRole('button', { name: 'Copy burrow link', exact: true }).click();
  await expect(page.locator('.app-toast')).toContainText('Link copied.');
  await page.getByRole('button', { name: 'Copy burrow link', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText("Couldn't copy. Try again, or select the text and copy it yourself.");
  await expect(page.locator('.app-toast')).toHaveCount(0);
  await expect(page.locator('#alert')).toHaveCount(1);
});

test('the first meeting saves the name and chosen critter together from its fixed footer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  let named = false, kept = false;
  // Present a first-meeting profile at the HTTP boundary; writes still use the real local handlers.
  await page.route('**/api/me', async route => {
    const response = await route.fetch();
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      if (body.displayName && body.keepCritter) { named = true; kept = true; }
      await route.fulfill({ response });
    } else if (response.ok()) {
      const profile = await response.json();
      await route.fulfill({ response, json: { ...profile, ensName: null, displayName: named ? profile.displayName : null, critterLocked: kept } });
    } else await route.fulfill({ response });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: 'Rehearsal critter 8', exact: true }).click();
  const critter = page.getByRole('region', { name: 'Meet your critter', exact: true });
  await expect(critter).toBeVisible();
  const keep = critter.getByRole('button', { name: 'Keep this one', exact: true }), frame = await keep.boundingBox();
  await expect(critter.locator('svg.portrait')).toHaveCount(1);
  // the name counts to 16 and stops there (Design System D35)
  const name = critter.getByRole('textbox', { name: 'Display name', exact: true });
  await name.fill('Avery');
  await expect(critter.getByText('5 / 16', { exact: true })).toBeVisible();
  await name.fill('Bartholomew Brambleworth');
  await expect(name).toHaveValue('Bartholomew Bram');
  await expect(critter.getByText('16 / 16', { exact: true })).toBeVisible();
  await name.fill('Avery');
  expect(await keep.boundingBox()).toEqual(frame);
  await keep.click();
  await expect(critter).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(named && kept).toBe(true);
});

test('a notification stays while hovered even after keyboard focus leaves it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { burrowId } = await seed.json();
  await page.goto(`/burrows/${burrowId}`);
  await connectLocal(page, 1);
  await page.clock.install();
  const copyLink = page.getByRole('button', { name: 'Copy burrow link', exact: true });
  await copyLink.click();
  const toast = page.locator('.app-toast');
  await toast.hover();
  await toast.getByRole('button', { name: 'Dismiss notification', exact: true }).focus();
  await copyLink.focus();
  await page.clock.fastForward(7000);
  await expect(toast).toBeVisible();
  await page.getByRole('heading', { name: 'Rehearsal burrow', exact: true }).hover();
  await page.clock.fastForward(6000);
  await expect(toast).toHaveCount(0);
  await expect(page.locator('#announce')).toHaveText('Link copied.');
});
