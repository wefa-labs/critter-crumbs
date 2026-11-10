import { expect, test } from 'playwright/test';
import { openFixture } from './open-fixture.js';

/*
 * QA accessibility-08: phone windows shorter than the design's 812 px. An iPhone SE in Safari is about 375 × 548; a
 * phone inside a wallet's browser, where members on phones read, can be 500 or less; and a phone may lie on its side.
 * However short the window, the end of a long statement can be scrolled into view above the dock, and the results
 * show rows to read: two where the card can keep its heading and actions pinned, at least one below that, and on its
 * side the whole card scrolls (game/layout.ts).
 */
test.use({ timezoneId: 'America/Los_Angeles', locale: 'en-US', contextOptions: { reducedMotion: 'reduce' } });


for (const viewport of [{ width: 375, height: 600 }, { width: 375, height: 548 }, { width: 375, height: 500 }, { width: 812, height: 375 }]) {
  test(`reading at ${viewport.width}×${viewport.height}: the last line of a long statement scrolls into view above the dock`, async ({ page }) => {
    await openFixture(page, 'reading', viewport);
    const end = await page.evaluate(() => {
      const scroll = document.querySelector<HTMLElement>('.statement-scroll')!, dock = document.querySelector('.game-dock')!.getBoundingClientRect();
      scroll.scrollTop = scroll.scrollHeight;
      const last = [...scroll.querySelectorAll('p')].pop()!.getBoundingClientRect(), on = document.elementFromPoint(last.left + 8, last.bottom - 6);
      return { lastBottom: last.bottom, dockTop: dock.top, readable: !!on?.closest('.statement-scroll') };
    });
    expect(end.lastBottom).toBeLessThanOrEqual(end.dockTop);
    expect(end.readable).toBe(true);
  });
}

for (const [viewport, least] of [[{ width: 390, height: 664 }, 2], [{ width: 375, height: 548 }, 2], [{ width: 375, height: 500 }, 1], [{ width: 812, height: 375 }, 0]] as const) {
  test(`results at ${viewport.width}×${viewport.height}: ${least ? `${least} or more rows` : 'the start of a row'} in view, every row a scroll away`, async ({ page }) => {
    await openFixture(page, 'results', viewport);
    const list = await page.evaluate(() => {
      const scroll = document.querySelector('.results-card .results-scroll')!, unpinned = !!scroll.closest('[data-unpinned]');
      const box = (unpinned ? scroll.closest('.results-card')! : scroll) as HTMLElement, fade = unpinned ? 0 : 28, edge = box.getBoundingClientRect();
      const rows = [...box.querySelectorAll('.results-row')].map(row => row.getBoundingClientRect());
      return { rows: rows.length, whole: rows.filter(row => row.top >= edge.top - 0.5 && row.bottom <= edge.bottom - fade + 0.5).length, firstStarts: rows[0]!.top < edge.bottom - fade - 16, scrollable: box.scrollHeight - box.clientHeight };
    });
    expect(list.rows).toBe(8);
    expect(list.whole).toBeGreaterThanOrEqual(least);
    expect(list.firstStarts).toBe(true);
    /* the rows not in view are reached by scrolling the list, or on its side the whole card */
    expect(list.scrollable).toBeGreaterThan(0);
    /* the huddle stands inside the scene, under the header */
    for (const top of await page.locator('.circle-spot:not([data-away="true"])').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top))) expect(top).toBeGreaterThanOrEqual(64);
  });
}
