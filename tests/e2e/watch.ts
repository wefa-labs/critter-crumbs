import type { Page } from 'playwright/test';

/**
 * Notes each time, from here on, that the page stops showing a game screen, with the words it shows in its place. The
 * page keeps the record itself, on every change to its document, so a gap of one frame is caught however the test's own
 * steps are timed. The closed scatter screen used to give way to a bare loading heading for up to a third of a second
 * before the feast was laid out.
 */
export async function watchGameScreen(page: Page) {
  await page.evaluate(() => {
    const gone: string[] = []; Object.assign(window, { gone });
    let shown = true;
    const note = () => {
      const now = [...document.querySelectorAll('.game-body')].some(body => body.checkVisibility({ visibilityProperty: true }));
      if (shown && !now) gone.push(document.querySelector<HTMLElement>('.game-content')?.innerText.trim() ?? '');
      shown = now;
    };
    new MutationObserver(note).observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    note();
  });
  return () => page.evaluate(() => (window as unknown as { gone: string[] }).gone);
}
