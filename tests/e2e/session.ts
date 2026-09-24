import { expect, type Page } from 'playwright/test';
/** Wait for server profile state before deciding which onboarding dialog exists. */
export async function connectLocal(page: Page, index: number, name = 'Avery') {
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Disconnect', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: `Rehearsal critter ${index}`, exact: true })).toHaveCount(0);
  const me = await page.request.get('/api/me'); const profile = await me.json();
  if (!profile.ensName && !profile.displayName) {
    await page.getByRole('textbox', { name: 'Display name', exact: true }).fill(name);
    await page.getByRole('button', { name: 'Save name', exact: true }).click();
  }
  if (!profile.critterLocked) await page.getByRole('button', { name: 'Keep this one', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
