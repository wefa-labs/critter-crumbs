import { expect, test } from 'playwright/test';

/*
 * Every core state at the phone and desktop sizes the brief names, with 4, 8 and 10 critters, against the review
 * pages' geometry (flow page sheetH; scatter page DOCK_BASE 130, RESULTS_FLOOR 196, the 74 px folded dock and bar,
 * the 400–480 px side panel): one surface at its size, nothing wider than the window, every target a finger wide,
 * and every critter standing above the surface. tests/screens/layout.spec.ts sweeps the tags at every focus.
 */
/* settled layouts: reduced motion skips the bubble's and toast's opening scale, which would measure a target mid-way */
test.use({ timezoneId: 'America/Los_Angeles', locale: 'en-US', contextOptions: { reducedMotion: 'reduce' } });
const SHEETS: Record<string, number> = { reveal: 230, waiting: 250, key: 250, feast: 144, nobody: 260 };
const DOCKS = ['scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed', 'closed', 'feasted'];
const RESULTS = ['results', 'tie', 'givers', 'recording', 'recorded', 'public'];
const VIEWPORTS = [{ width: 375, height: 812 }, { width: 430, height: 932 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }];

for (const viewport of VIEWPORTS) for (const count of [4, 8, 10]) test(`every core state at ${viewport.width}×${viewport.height} with ${count} critters`, async ({ page }) => {
  test.setTimeout(180000);
  const desktop = viewport.width >= 900, panel = Math.min(480, Math.max(400, viewport.width * 0.25)), floor = desktop ? viewport.width - panel : viewport.width;
  await page.setViewportSize(viewport);
  for (const state of [...Object.keys(SHEETS), ...DOCKS, ...RESULTS]) {
    await page.goto(`/dev/screens?capture&state=${state}&count=${count}&scene=window`);
    await expect(page.locator('.circle-spot')).toHaveCount(count);
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const box = (selector: string) => { const node = document.querySelector(selector); if (!node) return null; const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      const visible = (node: Element) => { const r = node.getBoundingClientRect(), style = getComputedStyle(node); return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && !node.closest('details:not([open]) > :not(summary)'); };
      return {
        scrollWidth: document.scrollingElement!.scrollWidth, header: box('.game-header'), sheet: box('.game-sheet'), sideSheet: box('.side-sheet'), dock: box('.dock-position'), bar: box('.results-bar'), side: box('.game-side'), notice: document.querySelectorAll('.game-notice').length,
        targets: [...document.querySelectorAll('.core-game button, .core-game a, .core-game summary, .core-game input')].filter(visible).map(node => { const r = node.getBoundingClientRect(); return { name: node.getAttribute('aria-label') ?? node.textContent?.slice(0, 24) ?? '', width: r.width, height: r.height }; }),
        spots: [...document.querySelectorAll('.circle-spot:not([data-away="true"])')].map(node => { const r = node.getBoundingClientRect(); return { top: r.y, bottom: r.y + r.height }; }),
      };
    });
    const label = `${state} at ${viewport.width} with ${count}`;
    expect(m.scrollWidth, label).toBeLessThanOrEqual(viewport.width);
    expect(Math.round(m.header!.height), label).toBe(64);
    expect(m.notice, label).toBe(0);
    for (const target of m.targets) { expect(target.width, `${label}: ${target.name}`).toBeGreaterThanOrEqual(44); expect(target.height, `${label}: ${target.name}`).toBeGreaterThanOrEqual(44); }
    if (desktop) expect(Math.round(m.side!.width), label).toBe(Math.round(panel));

    if (state in SHEETS) {
      if (desktop) { expect(m.dock, label).toBeNull(); expect(m.sideSheet, label).not.toBeNull(); }
      else { expect(Math.round(m.sheet!.height), label).toBe(SHEETS[state]); expect(Math.round(m.sheet!.y + m.sheet!.height), label).toBe(viewport.height); }
      const top = desktop ? viewport.height : m.sheet!.y;
      for (const spot of m.spots) expect(spot.top, label).toBeLessThan(top);
    } else if (DOCKS.includes(state)) {
      expect(Math.round(m.dock!.height), label).toBe(130); expect(Math.round(m.dock!.width), label).toBe(Math.round(floor)); expect(Math.round(m.dock!.y + m.dock!.height), label).toBe(viewport.height);
      for (const spot of m.spots) expect(spot.top, label).toBeLessThan(m.dock!.y);
    } else {
      if (desktop) { expect(Math.round(m.dock!.height), label).toBe(74); expect(Math.round(m.bar!.height), label).toBe(74); expect(Math.round(m.bar!.y), label).toBe(Math.round(m.dock!.y)); }
      else expect(Math.round(m.dock!.y), label).toBe(64 + 196);
    }
  }
});
