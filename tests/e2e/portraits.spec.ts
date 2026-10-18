import { expect, test } from 'playwright/test';
import { generate, generate2 } from '@critter-crumbs/core';

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

test('desktop portraits draw all generated variants and use the system typeface', async ({ page }) => {
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
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('system-ui');
  await page.screenshot({ path: '.scratch/evidence/portraits-desktop.png' });
});

test('review Garden Spirits keep each wing on its own side, fold it at the root asleep and hold small sizes', async ({ page }) => {
  await page.goto('/__preview/portraits');
  await expect(page.getByRole('heading', { name: 'Portrait workshop' })).toBeVisible();
  // The moth, phoenix and lemur review fixtures (docs/explorations/garden-refinement/fixtures.json).
  const winged = ['0x000000000000000000000000000000000000024e', '0x00000000000000000000000000000000000000b6', '0x00000000000000000000000000000000000001ba'].map(address => generate2(address, 0));
  const result = await page.evaluate(async params => {
    const painterPath = '/src/portraits/garden/species.ts', stylePath = '/src/portraits/garden/style.css';
    const { paintGarden } = await import(painterPath); await import(stylePath);
    const host = document.createElement('div'); host.style.width = '240px'; document.body.append(host);
    const wings = params.flatMap(params => [false, true].map(asleep => {
      const svg = paintGarden(document, params, { asleep, decorative: true }); host.replaceChildren(svg);
      const box = svg.getBoundingClientRect(), axis = box.left + box.width / 2;
      const [left, right] = ['.cr-wing-l', '.cr-wing-r'].map(selector => svg.querySelector(selector)!.getBoundingClientRect());
      return { species: svg.dataset.species, asleep, outer: [axis - left!.left, right!.right - axis], inner: [axis - left!.right, right!.left - axis] };
    }));
    const sizes = [40, 64, 96].map(size => { const svg = paintGarden(document, params[0], { size, decorative: true }); host.replaceChildren(svg); return svg.getBoundingClientRect().width; });
    host.remove();
    return { wings, sizes };
  }, winged);
  expect(result.wings.map(wing => wing.species)).toEqual(['moth', 'moth', 'phoenix', 'phoenix', 'lemur', 'lemur']);
  for (const { species, asleep, outer, inner } of result.wings) {
    // Mirror images about the body's axis: neither wing crosses it, so the left one can never sit on the right.
    expect(inner[0], `${species} asleep ${asleep}`).toBeGreaterThan(0);
    expect(Math.abs(outer[0]! - outer[1]!), `${species} asleep ${asleep}`).toBeLessThan(1);
    expect(Math.abs(inner[0]! - inner[1]!), `${species} asleep ${asleep}`).toBeLessThan(1);
  }
  for (let i = 0; i < result.wings.length; i += 2) expect(result.wings[i + 1]!.outer[0]).toBeLessThan(result.wings[i]!.outer[0]!);
  expect(result.sizes).toEqual([40, 64, 96]);
});
