import { expect, type Page, type Locator } from 'playwright/test';
/**
 * Authenticated reads go through the page itself. The session cookie is `Secure`, and Playwright's
 * request context withholds Secure cookies from http://127.0.0.1, so `page.request` would read the
 * public projection (or 401) instead of the member's state.
 */
export async function readJson<T>(page: Page, path: string): Promise<{ status: number; body: T }> {
  return page.evaluate(async (target: string) => {
    const response = await fetch(target, { credentials: 'same-origin' });
    return { status: response.status, body: (await response.json()) as T };
  }, path);
}
/**
 * Connects through the one way in a screen offers: Connect on the launcher and on a public result, Connect to join on a
 * feast opened from a link. Waits for server profile state before deciding which onboarding dialog exists.
 */
export async function connectLocal(page: Page, index: number, name = 'Avery', click: (target:Locator)=>Promise<void> = target=>target.click()) {
  const connect = page.getByRole('button', { name: /^Connect( to join)?$/ });
  await expect(connect).toBeEnabled();
  await click(connect);
  await click(page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true }));
  await expect(page.locator('.game-profile').or(page.getByRole('button', { name: 'Disconnect', exact: true }))).toBeVisible();
  await expect(page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true })).toHaveCount(0);
  const { status, body: profile } = await readJson<{ ensName: string | null; displayName: string | null; critterLocked: boolean }>(page, '/api/me');
  expect(status).toBe(200);
  if (!profile.ensName && !profile.displayName) {
    await page.getByRole('textbox', { name: 'Display name', exact: true }).fill(name);
    await click(page.getByRole('button', { name: 'Save name', exact: true }));
  }
  if (!profile.critterLocked) await click(page.getByRole('button', { name: 'Keep this one', exact: true }));
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
