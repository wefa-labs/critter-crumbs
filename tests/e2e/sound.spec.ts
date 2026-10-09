import { test, expect, type Page } from 'playwright/test';
import { connectLocal } from './session.js';

/**
 * Records which recordings the browser is asked to play and stop, by following each file through the three Web Audio
 * calls a recording passes through: the fetched bytes, the decoded buffer, the source that starts. The sound itself is
 * measured in audio.spec.ts; this is about which sound plays when.
 */
async function listen(page: Page) {
  await page.addInitScript(() => {
    const fetched = new WeakMap<ArrayBuffer, string>(), decoded = new WeakMap<AudioBuffer, string>(), heard = { played: [] as string[], stopped: [] as string[] };
    Object.assign(window, { heard });
    const name = (url: string) => new URL(url).pathname.replace('/audio/', '').replace('.mp3', '');
    const arrayBuffer = Response.prototype.arrayBuffer, decode = BaseAudioContext.prototype.decodeAudioData, start = AudioBufferSourceNode.prototype.start, stop = AudioBufferSourceNode.prototype.stop;
    Response.prototype.arrayBuffer = async function () { const bytes = await arrayBuffer.call(this); if (this.url.includes('/audio/')) fetched.set(bytes, name(this.url)); return bytes; };
    BaseAudioContext.prototype.decodeAudioData = async function (bytes: ArrayBuffer) { const file = fetched.get(bytes), buffer = await decode.call(this, bytes); if (file) decoded.set(buffer, file); return buffer; };
    AudioBufferSourceNode.prototype.start = function (...time) { const file = this.buffer && decoded.get(this.buffer); if (file) heard.played.push(file); start.apply(this, time); };
    AudioBufferSourceNode.prototype.stop = function (...time) { const file = this.buffer && decoded.get(this.buffer); if (file) heard.stopped.push(file); stop.apply(this, time); };
  });
  const read = (list: 'played' | 'stopped') => () => page.evaluate(key => (window as unknown as { heard: Record<string, string[]> }).heard[key]!, list);
  return { played: read('played'), stopped: read('stopped') };
}

/* docs/explorations/sound-direction-2026-10.md, the settled set, followed through one member's feast on a phone. */
test('a member hears the settled set in order: music by screen, each sting on its moment, the feast, and nothing before the first tap', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [], requested: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { const path = new URL(request.url()).pathname; if (path.startsWith('/audio/')) requested.push(path); });
  const { played, stopped } = await listen(page), soon = { timeout: 15000 };
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { burrowId, feasts } = await seed.json(), feast = feasts[0];

  // Before the first tap nothing is fetched: no sound is in the first load.
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
  expect(requested).toEqual([]);

  // The first tap loads the effects, the stings and the feast cue, and starts the launcher's and home's theme.
  await connectLocal(page, 1);
  await expect.poll(played, soon).toContain('music/burrow');
  expect(requested.filter(path => /\/(sfx|stings)\//.test(path))).toHaveLength(10);
  expect(requested.filter(path => path.startsWith('/audio/music/')).sort()).toEqual(['/audio/music/burrow.mp3', '/audio/music/feast-resolve.mp3', '/audio/music/feast.mp3']);

  // In the burrow: The town square.
  await page.locator(`a[href="/burrows/${burrowId}"]`).click();
  await expect.poll(played, soon).toContain('music/square');

  // Statements open: the reveal sting, then Feeding time once the sting has had its moment.
  await page.locator(`a[href="/feasts/${feast.id}"]`).click();
  await expect(page.getByRole('heading', { name: 'Statements are open', exact: true })).toBeVisible();
  await expect.poll(played, soon).toContain('music/feeding');
  expect(await played()).toContain('stings/reveal');

  // A statement opens with the page flip.
  await page.getByRole('button', { name: 'Start reading', exact: true }).click();
  await expect(page.locator('.phone-statement')).toBeVisible();
  await expect.poll(played, soon).toContain('sfx/page');

  // Giving every crumb and saving: the bubbly pop on Scatter These, then the Scattered sting.
  await page.keyboard.press('Escape');
  if (await page.locator('.focus-count input').count() === 0) await page.locator('.dock-turn').last().click();
  const field = page.locator('.focus-count input'); await field.fill('100'); await field.press('Enter');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await page.getByRole('dialog', { name: 'Confirm your scatter' }).getByRole('button', { name: 'Scatter These', exact: true }).click();
  await expect(page.locator('.dock-scattered')).toBeFocused();
  await expect.poll(played, soon).toContain('stings/scattered');
  expect(await played()).toContain('sfx/pop');

  // Scattering closes under the open screen: the Dusk sting, once, and Feeding time stops.
  expect((await page.request.post('/api/dev/time', { data: { now: feast.scatteringEndsAt - 4000 } })).ok()).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.dock-closed')).toBeVisible(soon);
  await expect.poll(played, soon).toContain('stings/dusk');
  await expect.poll(stopped, soon).toContain('music/feeding');

  // The feast: its cue, a nibble for the critter that was fed, the fanfare and the cheer at the settle, then Everyone is full.
  await expect(page.locator('[data-result-hash]')).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('heading', { name: 'Results', exact: true })).toBeFocused(soon);
  await expect.poll(played, soon).toContain('music/full');
  const heard = await played(), first = (file: string) => heard.indexOf(file);
  const order = ['music/burrow', 'music/square', 'stings/reveal', 'music/feeding', 'sfx/page', 'sfx/pop', 'stings/scattered', 'stings/dusk', 'music/feast', 'sfx/munch', 'music/feast-resolve', 'sfx/cheer', 'music/full'];
  expect(order.map(first)).toEqual([...order.map(first)].sort((a, b) => a - b));
  expect(order.map(first).every(index => index >= 0)).toBe(true);
  expect(heard.filter(file => file === 'stings/dusk')).toHaveLength(1);
  expect(heard.filter(file => file === 'sfx/munch')).toHaveLength(1);
  // The settle fades the feast cue under the fanfare.
  expect(await stopped()).toContain('music/feast');

  // Music off in Settings stops the loop and is remembered; on brings the screen's track back.
  const loops = heard.filter(file => file === 'music/full').length;
  await page.locator('.game-profile').click();
  const music = page.getByRole('dialog', { name: 'Settings' }).getByRole('checkbox', { name: /^Music/ });
  await expect(music).toBeChecked();
  await music.uncheck();
  await expect.poll(stopped, soon).toContain('music/full');
  expect(await page.evaluate(() => localStorage.getItem('cc.sound.music'))).toBe('0');
  await music.check();
  await expect.poll(async () => (await played()).filter(file => file === 'music/full').length, soon).toBeGreaterThan(loops);
  expect(await page.evaluate(() => localStorage.getItem('cc.sound.music'))).toBe('1');
  expect(errors).toEqual([]);
});
