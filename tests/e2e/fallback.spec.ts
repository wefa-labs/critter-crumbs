import { test, expect } from 'playwright/test';
import { connectLocal } from './session.js';

/* Design System §11: when 3D gives up, a notice says so and "every control keeps working". The notice once sat in the
   game's own row, where it took a column of the screen and pushed + and the next arrow off a phone. A development
   build draws version 2 critters, which have no 3D, so the page is opened as production draws it (?critters=1), and
   the 3D module is refused, which is one of the ways in. */
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) test(`when 3D gives up, its notice moves nothing on the scatter screen at ${viewport.width}`, async ({ page }) => {
  await page.setViewportSize(viewport);
  await page.route('**/src/three/index.ts*', route => route.abort());
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json();
  await page.goto(`/feasts/${feasts[0].id}/scatter?critters=1`); await connectLocal(page, 1);
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'live');
  await expect(page.getByText("Showing the simple view — 3D isn't available in this browser right now.", { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try 3D again', exact: true })).toBeVisible();
  const layout = await page.evaluate(() => {
    const game = document.querySelector('.game-body')!.getBoundingClientRect();
    /* a control is within reach when the point at its centre is on the screen and nothing lies over it */
    const reach = (node: Element | null | undefined) => { if (!node) return 'missing'; const box = node.getBoundingClientRect(), x = box.left + box.width / 2, y = box.top + box.height / 2; if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return 'off the screen'; const top = document.elementFromPoint(x, y); return top === node || node.contains(top) ? 'within reach' : 'covered'; };
    const turns = Array.from(document.querySelectorAll('.dock-turn'));
    return { game: { left: game.left, width: game.width }, window: innerWidth, give: reach(document.querySelector('button[data-give="true"]')), takeBack: reach(document.querySelector('button[data-give="false"]')), previous: reach(turns[0]), next: reach(turns.at(-1)), retry: reach(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Try 3D again')) };
  });
  expect(layout.game).toEqual({ left: 0, width: layout.window });
  expect(layout).toMatchObject({ give: 'within reach', takeBack: 'within reach', previous: 'within reach', next: 'within reach', retry: 'within reach' });
});
