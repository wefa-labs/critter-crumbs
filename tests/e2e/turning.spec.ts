import { test, expect, type Page } from 'playwright/test';
import { connectLocal } from './session.js';

/*
 * QA accessibility-03 on the live scatter screen. Turning the circle, by ‹ and ›, the arrow keys or a name tag, says
 * through the polite announcer who now stands in focus, as the tag reads ("Fern, 1 crumb"; your own, "Your critter"),
 * and the confirmation is read with what it scatters (Design System §12.6).
 */
const focused = (page: Page) => page.locator('.focus-name').innerText();

test('turning the circle says who stands in focus now, and the confirmation is read with what it scatters', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 375, height: 812 });
  const seed = await page.request.post('/api/dev/seed', { data: { kind: 'people', phase: 'scattering' } }); expect(seed.ok()).toBe(true);
  const { feasts } = await seed.json() as { feasts: { id: string; targets: { name: string }[] }[] }, feast = feasts[0]!, names = feast.targets.map(target => target.name);
  await page.goto(`/feasts/${feast.id}/scatter`); await connectLocal(page, 1);
  await expect(page.locator('.focus-row')).toHaveAttribute('data-controls', 'live');
  const said = page.locator('#announce'), next = page.getByRole('button', { name: 'Next', exact: true });

  // the first critter in focus gets one crumb, typed
  const first = await focused(page), field = page.locator('.focus-count input');
  await field.fill('1'); await field.press('Enter');
  // › by keyboard: the next critter, nothing given to it yet
  await next.press('Enter');
  const second = await focused(page);
  expect(second).not.toBe(first);
  await expect(said).toHaveText(`${second}, 0 crumbs`);
  // ← with focus still in the game: back to the first, its one crumb in the singular
  await next.press('ArrowLeft');
  await expect(page.locator('.focus-name')).toHaveText(first);
  await expect(said).toHaveText(`${first}, 1 crumb`);
  // a name tag turns the circle to its critter and says the same
  const third = names.find(name => name !== first && name !== second && name !== 'Moss')!;
  await page.getByRole('button', { name: `${third}, 0 crumbs`, exact: true }).click();
  await expect(page.locator('.focus-name')).toHaveText(third);
  await expect(said).toHaveText(`${third}, 0 crumbs`);
  // your own critter (Moss, for the first rehearsal critter) is said as yours
  for (let i = 0; i < names.length && await focused(page) !== 'Moss'; i++) await next.press('Enter');
  await expect(said).toHaveText('Your critter');

  // the confirmation: the rest to the third, read with the dialog in the burrow's order
  await page.getByRole('button', { name: `${third}, 0 crumbs`, exact: true }).click();
  await field.fill('99'); await field.press('Enter');
  await page.getByRole('button', { name: 'Scatter These', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirm your scatter' });
  const given = [[first, 1], [third, 99]].sort((a, b) => names.indexOf(a[0] as string) - names.indexOf(b[0] as string)).map(([name, n]) => `${n} to ${name}`).join(' and ');
  await expect(dialog).toHaveAccessibleDescription(`Your crumbs: ${given}. You'll be asked to sign. It costs nothing and nothing goes on-chain.`);
  await dialog.getByRole('button', { name: 'Scatter These', exact: true }).click();
  await expect(page.locator('.dock-scattered')).toBeFocused();
});
