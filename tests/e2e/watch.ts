import type { Page } from 'playwright/test';

/**
 * Notes each time, from here on, that the page stops showing a whole game screen: none at all, with the words it shows
 * in its place, or one with no floor under its circle. The page keeps the record itself, on every change to its
 * document, so a gap of one frame is caught however the test's own steps are timed. The closed scatter screen used to
 * give way to a bare loading heading for up to a third of a second before the feast was laid out, and each new scene
 * drew its first frames on bare ground.
 */
export async function watchGameScreen(page: Page) {
  await page.evaluate(() => {
    const lapses: string[] = []; Object.assign(window, { lapses });
    let was = '';
    const note = () => {
      const screen = [...document.querySelectorAll('.game-body')].find(body => body.checkVisibility({ visibilityProperty: true }));
      const now = !screen ? `no game screen: ${document.querySelector<HTMLElement>('.game-content')?.innerText.trim() ?? ''}`
        : screen.querySelector('.scene-backdrop')?.childElementCount ? '' : `no floor under the ${screen.getAttribute('data-game-state')} screen`;
      if (now && now !== was) lapses.push(now);
      was = now;
    };
    new MutationObserver(note).observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    note();
  });
  return () => page.evaluate(() => (window as unknown as { lapses: string[] }).lapses);
}
