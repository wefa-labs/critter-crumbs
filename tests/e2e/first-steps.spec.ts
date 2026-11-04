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
  // the first meeting is a whole screen over the page the member connected on, with no way past it but Keep
  const meeting = page.getByRole('region', { name: 'Meet your critter', exact: true });
  await expect(meeting).toBeVisible();
  await expect(meeting.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
  await expect(page.locator('#content')).toHaveAttribute('inert', '');
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
  await expect(page.getByRole('alert')).not.toBeEmpty();
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

// Someone who connected the wrong account can leave the first meeting without keeping a critter for it (Afolabi,
// 3 November 2026): Disconnect, quiet under the actions, leaves them where a signed-out visitor would be.
test('the first meeting can be left by disconnecting, back where a signed-out visitor would be', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'gathering' } });
  expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json(), feast = feasts[0];
  // the profile a first meeting is for, presented at the HTTP boundary: a critter not kept yet, or kept with no name
  let shown: { critterLocked: boolean } = { critterLocked: false };
  await page.route('**/api/me', async route => {
    const response = await route.fetch();
    if (route.request().method() !== 'GET' || !response.ok()) { await route.fulfill({ response }); return; }
    await route.fulfill({ response, json: { ...await response.json(), ensName: null, displayName: null, ...shown } });
  });
  const connect = async (button: string) => {
    await page.getByRole('button', { name: button, exact: true }).click();
    await page.getByRole('button', { name: 'Rehearsal critter 3', exact: true }).click();
  };
  const meeting = page.getByRole('region', { name: 'Meet your critter', exact: true });

  // from a feast's link: back on its invite, signed out
  await page.goto(`/feasts/${feast.id}`);
  await connect('Connect to join');
  await expect(meeting).toBeVisible();
  // a quiet link, not a pill, under the choice it never competes with
  const leave = meeting.getByRole('button', { name: 'Disconnect', exact: true }), keep = meeting.getByRole('button', { name: 'Keep this one', exact: true });
  await expect(leave).toHaveClass(/\bquiet\b/);
  const [leaving, keeping] = [(await leave.boundingBox())!, (await keep.boundingBox())!];
  expect(leaving.y).toBeGreaterThanOrEqual(keeping.y + keeping.height);
  expect(leaving.height).toBeGreaterThanOrEqual(44);
  expect(leaving.y + leaving.height).toBeLessThanOrEqual(812);
  await leave.click();
  await expect(meeting).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/feasts/${feast.id}$`));
  await expect(page.getByRole('button', { name: 'Connect to join', exact: true })).toBeVisible();
  expect((await readJson(page, '/api/me')).status).toBe(401);

  // from the launcher: back on the launcher
  await page.goto('/');
  await connect('Connect');
  await expect(meeting).toBeVisible();
  await meeting.getByRole('button', { name: 'Disconnect', exact: true }).click();
  await expect(meeting).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
  await expect(page.locator('.launch-plate')).toBeVisible();

  // a kept critter that is only being named offers it too
  shown = { critterLocked: true };
  await connect('Connect');
  const naming = page.getByRole('region', { name: 'What should the burrow call you?', exact: true });
  await expect(naming).toBeVisible();
  await naming.getByRole('button', { name: 'Disconnect', exact: true }).click();
  await expect(naming).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
  expect((await readJson(page, '/api/me')).status).toBe(401);
});

test('all first-step actions stay in place on short phones and desktops in every critter version', async ({ page }) => {
  // fifteen page loads of five steps each: three times the ordinary budget
  test.slow();
  for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    // Garden Spirits, whose opening cast differs, then version 1 and the October inked drawing
    for (const query of ['', '?critters=1', '?critters=2']) {
      await page.goto(`/how-it-works${query}`);
      await expect(page.getByRole('heading', { name: 'Everyone gets the same handful', exact: true })).toBeFocused();
      await page.evaluate(() => document.fonts.ready);
      const controls = page.locator('.learn-actions'), frame = await controls.boundingBox();
      for (let step = 1; step < 5; step++) {
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
