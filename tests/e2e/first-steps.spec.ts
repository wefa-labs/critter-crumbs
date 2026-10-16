import { test, expect } from 'playwright/test';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { Hex } from 'viem';
import { connectLocal, readJson } from './session.js';

test('an invited first-time member keeps their destination, draft name and critter through a failed save', async ({ page }) => {
  const account = privateKeyToAccount(generatePrivateKey());
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { burrowId, serverNow } = await seed.json();
  await page.goto(`/burrows/${burrowId}`); await connectLocal(page, 1);
  await page.getByRole('textbox', { name: 'Address or ENS name', exact: true }).fill(account.address);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.locator('.member-list')).toContainText(account.address);
  await page.getByRole('button', { name: 'Your critter and settings', exact: true }).click();
  await page.getByRole('button', { name: 'Disconnect', exact: true }).click();

  // Exercise real injected sign-in with an ephemeral test key; only provider discovery is replaced at the HTTP edge.
  await page.route('**/api/dev/config', async route => { const response = await route.fetch(); await route.fulfill({ response, json: { ...await response.json(), enabled: false } }); });
  await page.exposeFunction('qaSignMessage', (message: Hex) => account.signMessage({ message: { raw: message } }));
  await page.addInitScript(({ address }) => {
    const target = window as unknown as { ethereum: { request: (input: { method: string; params?: string[] }) => Promise<unknown> }; qaSignMessage: (message: string) => Promise<string> };
    target.ethereum = { async request({ method, params }) {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [address];
      if (method === 'personal_sign') return target.qaSignMessage(params![0]!);
      if (method === 'eth_chainId') return '0x14a34';
      throw new Error(`Unexpected test RPC: ${method}`);
    } };
  }, { address: account.address });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.reload();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: 'This browser', exact: true }).click();
  const meeting = page.getByRole('dialog', { name: 'Meet your critter', exact: true });
  await expect(meeting).toBeVisible();
  const frame = await meeting.boundingBox(), keep = meeting.getByRole('button', { name: 'Keep this one', exact: true });
  const keepFrame = await keep.boundingBox();
  await expect(keep).toBeDisabled();
  await meeting.getByRole('textbox', { name: 'Display name', exact: true }).fill('Avery');
  await meeting.getByRole('button', { name: 'Re-roll (4 left)', exact: true }).click();
  await expect(meeting.getByRole('button', { name: 'Re-roll (3 left)', exact: true })).toBeEnabled();
  await expect(meeting.getByRole('textbox')).toHaveValue('Avery');
  expect(await meeting.boundingBox()).toEqual(frame);
  for (let remaining = 3; remaining > 0; remaining--) {
    await meeting.getByRole('button', { name: remaining === 1 ? 'Re-roll (last one)' : `Re-roll (${remaining} left)`, exact: true }).click();
    await expect(meeting.getByRole('button', { name: remaining === 2 ? 'Re-roll (last one)' : `Re-roll (${remaining - 1} left)`, exact: true })).toBeVisible();
  }
  await expect(meeting.getByRole('textbox')).toHaveValue('Avery');
  await expect(keep).toBeEnabled();
  expect(await keep.boundingBox()).toEqual(keepFrame);
  await page.route('**/api/me', async route => {
    if (route.request().method() === 'PUT') await route.fulfill({ status: 503, json: { error: 'err.generic', serverNow } });
    else await route.continue();
  });
  await keep.click();
  await expect(meeting.getByRole('alert')).not.toBeEmpty();
  await expect(meeting.getByRole('textbox')).toHaveValue('Avery');
  expect(await meeting.boundingBox()).toEqual(frame);
  await page.unroute('**/api/me');
  await keep.click();
  await expect(meeting).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/burrows/${burrowId}$`));
  const { body } = await readJson(page, '/api/me');
  expect(body).toMatchObject({ displayName: 'Avery', variant: 4, critterLocked: true });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Rehearsal burrow', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('all first-step actions stay in place on short phones and desktops in either critter version', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const query of ['', '?critters=1']) {
      await page.goto(`/how-it-works${query}`);
      await expect(page.getByRole('heading', { name: 'Everyone gets the same handful', exact: true })).toBeFocused();
      await page.evaluate(() => document.fonts.ready);
      const controls = page.locator('.learn-actions'), frame = await controls.boundingBox();
      for (let step = 1; step < 4; step++) {
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        expect(await controls.boundingBox()).toEqual(frame);
      }
      await expect(page.getByRole('heading', { name: 'When the feast opens', exact: true })).toBeFocused();
      const done = await page.getByRole('button', { name: 'Got it', exact: true }).boundingBox();
      expect(done!.y + done!.height).toBeLessThanOrEqual(viewport.height);
      const heads = await page.locator('.screen-floor .portrait__head').evaluateAll(nodes => {
        const top = document.querySelector('.screen-floor')!.getBoundingClientRect().top;
        return nodes.map(node => node.getBoundingClientRect().top - top);
      });
      for (const top of heads) expect(top).toBeGreaterThanOrEqual(0);
      expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([viewport.width, viewport.height]);
      await page.getByRole('button', { name: 'Got it', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
    }
  }
});
