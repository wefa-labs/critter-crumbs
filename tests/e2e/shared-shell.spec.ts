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

test('the critter menu reaches burrows, settings and creation, and a whole burrow card opens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { burrowId } = await seed.json();
  await page.goto(`/burrows/${burrowId}`);
  await connectLocal(page, 1);
  const profile = page.getByRole('button', { name: 'Your critter and settings', exact: true });
  await profile.click();
  const menu = page.getByRole('dialog', { name: 'Your critter', exact: true });
  await expect(menu.getByRole('button', { name: 'Disconnect', exact: true })).toBeVisible();
  await menu.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(profile).toBeFocused();
  await profile.click();
  await menu.getByRole('link', { name: 'Your burrows', exact: true }).click();
  const card = page.locator(`a[href="/burrows/${burrowId}"]`);
  await card.getByText('8 critters', { exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/burrows/${burrowId}$`));
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([390, 844]);
  await profile.click();
  await menu.getByRole('link', { name: 'Start a burrow', exact: true }).click();
  await page.getByRole('textbox', { name: 'Burrow name', exact: true }).fill(`Shell ${burrowId.slice(0, 8)}`);
  await page.getByRole('button', { name: 'Create burrow', exact: true }).click();
  await expect(page.getByRole('heading', { name: `Shell ${burrowId.slice(0, 8)}`, exact: true })).toBeVisible();
  await page.goto(`/burrows/${burrowId}`);
  await expect(page.getByRole('heading', { name: 'Rehearsal burrow', exact: true })).toBeVisible();
  for (const viewport of [{ width: 375, height: 812 }, { width: 390, height: 667 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([viewport.width, viewport.height]);
    await page.screenshot({ path: `.scratch/shared-shell/burrow-${viewport.width}.png` });
    await profile.click();
    await page.screenshot({ path: `.scratch/shared-shell/profile-${viewport.width}.png` });
    const frame = (await menu.boundingBox())!;
    expect(frame.y).toBeGreaterThanOrEqual(0);
    expect(frame.y + frame.height).toBeLessThanOrEqual(viewport.height);
    const disconnect = (await menu.getByRole('button', { name: 'Disconnect', exact: true }).boundingBox())!;
    expect(disconnect.y + disconnect.height).toBeLessThanOrEqual(frame.y + frame.height);
    await page.keyboard.press('Escape');
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
  const profile = page.getByRole('dialog', { name: 'Your critter', exact: true });
  await profile.getByRole('button', { name: 'Copy address', exact: true }).click();
  await expect(profile.locator('.app-toast')).toContainText('Address copied.');
  await expect(profile.locator('#announce')).toHaveText('Address copied.');
  await expect(page.locator('#announce')).toHaveCount(1);
  await expect(page.locator('#alert')).toHaveCount(1);
  await page.screenshot({ path: '.scratch/shared-shell/profile-notification.png' });
  await profile.locator('.app-toast').getByRole('button', { name: 'Dismiss notification', exact: true }).click();
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
  const critter = page.getByRole('dialog', { name: 'Meet your critter', exact: true });
  await expect(critter).toBeVisible();
  const frame = await critter.boundingBox();
  await expect(critter.locator('svg.portrait')).toHaveCount(1);
  await critter.getByRole('textbox', { name: 'Display name', exact: true }).fill('Avery');
  expect(await critter.boundingBox()).toEqual(frame);
  await critter.getByRole('button', { name: 'Keep this one', exact: true }).click();
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
