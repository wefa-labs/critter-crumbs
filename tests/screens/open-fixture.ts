import { expect, type Page } from 'playwright/test';

/** A core state from the fixtures (/dev/screens): eight critters on the Window scene, settled. */
export async function openFixture(page: Page, state: string, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto(`/dev/screens?capture&state=${state}&count=8&scene=window`);
  await expect(page.locator('.circle-spot')).toHaveCount(8);
  await page.waitForTimeout(300);
}
