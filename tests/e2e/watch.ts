import type { Page } from "playwright/test";

/**
 * Keeps a record in the page, from here on, of the game screens it shows: each state in order, and each lapse, which is
 * a time with no game screen at all (noted with the words shown in its place) or with a screen that has no floor under
 * its circle. The record is made on every change to the document, so a gap of one frame is caught however the test's
 * own steps are timed. Between one game screen and the next the page used to show a bare loading line or heading for up
 * to a third of a second, and each new scene drew its first frames on bare ground.
 */
export async function watchGameScreen(page: Page) {
  await page.evaluate(record, false);
  return reader(page);
}

/**
 * The same record for the page's next load, installed before it starts: it begins with the first game screen the load
 * draws on its floor, so the reveal and the feast that follow a reload are watched from there to the results. The frames
 * before it are left out: the first scene after a load waits for the scene list, read once for the page (sceneReader in
 * packages/app/src/game/scene-manifest.ts), and stands on bare ground until it arrives.
 */
export async function watchNextLoad(page: Page) {
  await page.addInitScript(record, true);
  return reader(page);
}

function record(fromFirstFloor: boolean) {
  const seen = { states: [] as string[], lapses: [] as string[] };
  Object.assign(window, { seen });
  let was = "";
  const note = () => {
    const screen = [...document.querySelectorAll(".game-body")].find((body) =>
      body.checkVisibility({ visibilityProperty: true })
    );
    if (
      fromFirstFloor &&
      seen.states.length === 0 &&
      !screen?.querySelector(".scene-backdrop")?.childElementCount
    )
      return;
    const state = screen?.getAttribute("data-game-state");
    if (state && state !== seen.states.at(-1)) seen.states.push(state);
    const now = !screen
      ? `no game screen: ${document.querySelector<HTMLElement>(".game-content")?.innerText.trim() ?? ""}`
      : screen.querySelector(".scene-backdrop")?.childElementCount
        ? ""
        : `no floor under the ${state} screen`;
    if (now && now !== was) seen.lapses.push(now);
    was = now;
  };
  new MutationObserver(note).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
  });
  note();
}

function reader(page: Page) {
  const read = (list: "states" | "lapses") => () =>
    page.evaluate(
      (key) => (window as unknown as { seen: Record<string, string[]> }).seen[key]!,
      list
    );
  return { states: read("states"), lapses: read("lapses") };
}
