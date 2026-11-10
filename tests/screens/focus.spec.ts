import { expect, test, type Locator, type Page } from 'playwright/test';

/*
 * QA accessibility-01 and -03 on the fixture screens. Design System §12.5: every focus ring is 3 px of the focus colour
 * with 2 px of Oat inside it, so it reads over the painting; an aria-disabled control stays a tab stop and its ring
 * stays whole; nothing hidden under an open statement takes focus (WCAG 2.4.11). §12.6 and WCAG 2.5.3: a name tag is
 * named by what it shows, the count included, and the confirmation says what is being scattered.
 */
test.use({ timezoneId: 'America/Los_Angeles', locale: 'en-US', contextOptions: { reducedMotion: 'reduce' } });

async function open(page: Page, state: string, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto(`/dev/screens?capture&state=${state}&count=8&scene=window`);
  await expect(page.locator('.circle-spot')).toHaveCount(8);
  await page.waitForTimeout(300);
}
/** Tab until `selector` holds the focus, as a keyboard user would reach it. */
async function tabTo(page: Page, selector: string) {
  for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); if (await page.evaluate(s => !!document.activeElement?.matches(s), selector)) return; }
  throw new Error(`Tab never reached ${selector}`);
}
/** A token's colour as the browser computes it, to compare with computed styles. */
const token = (page: Page, name: string) => page.evaluate(value => { const probe = document.createElement('i'); probe.style.color = `var(${value})`; document.body.append(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; }, name);
/** The mean colour of a small patch, as drawn: the screenshot decoded in the page. */
async function patch(page: Page, target: Locator, dx: number, dy: number) {
  const box = (await target.boundingBox())!, shot = await page.screenshot({ clip: { x: box.x + dx, y: box.y + dy, width: 4, height: 4 } });
  return page.evaluate(async png => {
    const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
    const canvas = new OffscreenCanvas(image.width, image.height), context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, image.width, image.height).data, sum = [0, 0, 0];
    for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) sum[c]! += data[i + c]!;
    return sum.map(value => value / (data.length / 4));
  }, shot.toString('base64'));
}
const distance = (a: number[], b: number[]) => Math.hypot(...a.map((value, i) => value - b[i]!));

for (const scheme of ['light', 'dark'] as const) for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) {
  test(`a critter in keyboard focus carries the double ring at ${viewport.width} in the ${scheme} look`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await open(page, 'scatter', viewport);
    await tabTo(page, '.circle-hit');
    const ring = await page.evaluate(() => { const style = getComputedStyle(document.activeElement!); return { width: style.outlineWidth, style: style.outlineStyle, colour: style.outlineColor, offset: style.outlineOffset, shadow: style.boxShadow, visible: document.activeElement!.matches(':focus-visible') }; });
    expect(ring.visible).toBe(true);
    expect(ring).toMatchObject({ width: '3px', style: 'solid', offset: '2px', colour: await token(page, '--cc-focus') });
    expect(ring.shadow).toBe(`${await token(page, '--cc-oat')} 0px 0px 0px 2px`);
  });
}

test('+ with nothing left to give keeps a whole ring in focus, and still looks dimmed', async ({ page }) => {
  await open(page, 'scatter', { width: 375, height: 812 });
  const plus = page.locator('.crumb-control[data-give="true"]');
  const live = await patch(page, plus, 8, 24);
  await open(page, 'done', { width: 375, height: 812 });
  await expect(plus).toHaveAttribute('aria-disabled', 'true');
  const dimmed = await patch(page, plus, 8, 24);
  await tabTo(page, '.crumb-control[data-give="true"]');
  /* nothing between the ring and the screen is drawn at less than full strength */
  expect(await plus.evaluate(node => { let alpha = 1; for (let at: Element | null = node; at; at = at.parentElement) alpha *= Number(getComputedStyle(at).opacity); return alpha; })).toBe(1);
  expect(await plus.evaluate(node => getComputedStyle(node).outlineWidth)).toBe('3px');
  /* the face looks as dimmed in focus as out of it, and nothing like the live + */
  const focused = await patch(page, plus, 8, 24);
  expect(distance(focused, dimmed)).toBeLessThan(6);
  expect(distance(dimmed, live)).toBeGreaterThan(40);
});

for (const viewport of [{ width: 375, height: 812 }, { width: 375, height: 548 }]) {
  test(`with a statement open at ${viewport.width}×${viewport.height}, Tab never lands on anything hidden under it`, async ({ page }) => {
    await open(page, 'reading', viewport);
    await expect(page.locator('.phone-statement')).toBeFocused();
    const stops: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => {
        const node = document.activeElement as HTMLElement | null;
        if (!node?.closest('.game-body')) return null;
        const box = node.getBoundingClientRect();
        /* WCAG 2.4.11: some part of it shows; a point of it is topmost */
        for (let x = 0.1; x < 1; x += 0.2) for (let y = 0.1; y < 1; y += 0.2) { const on = document.elementFromPoint(box.x + box.width * x, box.y + box.height * y); if (on && node.contains(on)) return { name: node.getAttribute('aria-label') ?? node.textContent ?? '', seen: true }; }
        return { name: node.getAttribute('aria-label') ?? node.className, seen: false };
      });
      if (!stop) continue;
      stops.push(stop.name);
      expect(stop.seen, `${stop.name} has focus but cannot be seen`).toBe(true);
    }
    expect(stops.length).toBeGreaterThan(3);
  });
}

test('every name tag is named by what it shows, its count included; your own tag says You', async ({ page }) => {
  for (const state of ['scatter', 'feasted']) {
    await open(page, state, { width: 375, height: 812 });
    const tags = await page.locator('.critter-tag-target').evaluateAll(nodes => nodes.map(node => ({ name: node.getAttribute('aria-label'), shown: node.querySelector('.critter-tag')!.firstChild!.textContent!, count: node.querySelector('.tag-count')?.textContent ?? null })));
    expect(tags.length).toBeGreaterThan(4);
    for (const tag of tags) {
      if (tag.count === null) { expect(tag.name, state).toBe(tag.shown); continue; }
      const [, name, count] = /^(.+), (\d+) crumbs?$/.exec(tag.name ?? '') ?? [];
      expect(count, `${state}: ${tag.name}`).toBe(tag.count);
      /* the tag may show a short form of a long name; the name tag's name is the whole one */
      expect(name!.startsWith(tag.shown.replace(/…$/, '')), `${state}: ${tag.name}`).toBe(true);
    }
  }
  await open(page, 'scatter', { width: 375, height: 812 });
  await expect(page.getByRole('button', { name: 'You', exact: true }).and(page.locator('.critter-tag-target'))).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Fern, 20 crumbs', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Acorn, 0 crumbs', exact: true })).toHaveCount(1);
});

test('the confirmation says what is being scattered, in the burrow’s order', async ({ page }) => {
  await open(page, 'signing', { width: 375, height: 812 });
  const dialog = page.getByRole('dialog', { name: 'Confirm your scatter' });
  await expect(dialog).toContainText(/Your crumbs: \d+ to Moss, \d+ to Fern, \d+ to Clover, .+ and \d+ to .+\./);
  await expect(dialog).not.toContainText('to Juniper');
  const sum = (await dialog.locator('p').first().innerText()).match(/\d+(?= to )/g)!.map(Number).reduce((total, n) => total + n, 0);
  expect(sum).toBe(100);
  /* read with the dialog's name as it opens, before Cancel */
  await expect(dialog).toHaveAccessibleDescription(/^Your crumbs: .+\. You'll be asked to sign\./);
  /* the whole of it shows in the phone's sheet, nothing scrolled out of sight */
  expect(await dialog.locator('.dialog-body').evaluate(node => node.scrollHeight <= node.clientHeight)).toBe(true);
});
