import { expect, test } from 'playwright/test';
import { generate } from '@critter-crumbs/core';

test('portraits use SVG elements, a stable feet anchor, safe names and explicit accessibility', async ({ page }) => {
  await page.goto('/__preview/portraits');
  await expect(page.getByRole('heading', { name: 'Portrait workshop' })).toBeVisible();
  const result = await page.evaluate(async params => {
    const portraitPath = '/src/portraits/index.ts';
    const { createPortrait } = await import(portraitPath);
    const svg = createPortrait(document, params, { name: '<img src=x onerror=alert(1)>', size: 64 });
    document.body.append(svg);
    const body = svg.querySelector('[data-part="body"] ellipse')!;
    const decorative = createPortrait(document, params, { name: 'Decorative', decorative: true, asleep: true, fed: 1 });
    return { role: svg.getAttribute('role'), title: svg.querySelector('title')!.textContent, injected: svg.querySelectorAll('img,script').length,
      width: svg.getBoundingClientRect().width, height: svg.getBoundingClientRect().height,
      body: ['cx', 'cy', 'rx', 'ry'].map(key => Number(body.getAttribute(key))),
      origin: getComputedStyle(svg.querySelector('.portrait__figure')!).transformOrigin,
      hidden: decorative.getAttribute('aria-hidden'), asleep: decorative.dataset.asleep, fed: decorative.style.getPropertyValue('--scale-x') };
  }, generate('0x0000000000000000000000000000000000000001', 0));
  expect(result.role).toBe('img'); expect(result.title).toBe('<img src=x onerror=alert(1)>'); expect(result.injected).toBe(0);
  expect(result.width).toBe(64); expect(result.height).toBe(80); expect(result.origin).toBe('60px 140px');
  expect(result.body[0]).toBe(60);
  // Independent first-address fixture; the canonical body centres and radii are recorded below.
  expect(result.body[1]).toBeCloseTo(99.62151488927831, 10);
  expect(result.body[2]).toBeCloseTo(24.667561824899168, 10);
  expect(result.body[3]).toBeCloseTo(30.052592605240644, 10);
  expect(result.hidden).toBe('true'); expect(result.asleep).toBe('true'); expect(result.fed).toBe('1.35');
});

test('stored Still critters applies before first render; wake and growth remain usable at 375 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => localStorage.setItem('cc.motion.still', '1'));
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.goto('/__preview/portraits');
  await expect(page.locator('.critter-grid .portrait')).toHaveCount(24);
  const first = page.locator('.portrait').first();
  await page.getByRole('button', { name: 'Let the critters rest' }).click();
  await expect(first).toHaveAttribute('data-asleep', 'true');
  await page.getByRole('button', { name: 'Wake the critters' }).click();
  await expect(first).toHaveAttribute('data-asleep', 'false');
  await page.getByRole('button', { name: 'Show the feast pose' }).click();
  await expect.poll(() => first.evaluate(node => node.style.getPropertyValue('--scale-x'))).toBe('1.2275');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await page.screenshot({ path: '.scratch/evidence/portraits-375.png', fullPage: false });
  expect(requests.some(url => /\/three[/.]|@react-three/.test(url))).toBe(false);
  expect(errors).toEqual([]);
});

test('desktop portraits draw all generated variants and load the self-hosted font', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/__preview/portraits');
  await expect(page.locator('.critter-grid .portrait')).toHaveCount(24);
  for (const size of [40, 64, 96]) {
    const sample = page.locator(`svg[data-size="${size}"]`);
    expect(await sample.evaluate(node => node.getBoundingClientRect().width)).toBe(size);
  }
  expect(await page.locator('.critter-grid .portrait').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('data-ear-type')))].sort())).toEqual(['floppy','long','none','pointed','round','tufts']);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('22px "Young Serif"'))).toBe(true);
  await page.screenshot({ path: '.scratch/evidence/portraits-desktop.png' });
});
