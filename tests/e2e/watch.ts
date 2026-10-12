import type { Page } from 'playwright/test';

/**
 * Keeps a record in the page, from here on, of the game screens it shows: each state in order, and each lapse, which is
 * a time with no game screen at all (noted with the words shown in its place) or with a screen that has no floor under
 * its circle. The record is made on every change to the document, so a gap of one frame is caught however the test's
 * own steps are timed. Between one game screen and the next the page used to show a bare loading line or heading for up
 * to a third of a second, and each new scene drew its first frames on bare ground.
 */
export async function watchGameScreen(page: Page) {
  await page.evaluate(() => {
    const seen = { states: [] as string[], lapses: [] as string[] }; Object.assign(window, { seen });
    let was = '';
    const note = () => {
      const screen = [...document.querySelectorAll('.game-body')].find(body => body.checkVisibility({ visibilityProperty: true }));
      const state = screen?.getAttribute('data-game-state');
      if (state && state !== seen.states.at(-1)) seen.states.push(state);
      const now = !screen ? `no game screen: ${document.querySelector<HTMLElement>('.game-content')?.innerText.trim() ?? ''}`
        : screen.querySelector('.scene-backdrop')?.childElementCount ? '' : `no floor under the ${state} screen`;
      if (now && now !== was) seen.lapses.push(now);
      was = now;
    };
    new MutationObserver(note).observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    note();
  });
  const read = (list: 'states' | 'lapses') => () => page.evaluate(key => (window as unknown as { seen: Record<string, string[]> }).seen[key]!, list);
  return { states: read('states'), lapses: read('lapses') };
}
