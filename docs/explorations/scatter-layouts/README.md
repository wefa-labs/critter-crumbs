# Scatter layouts — review page

A static mock-up of the scatter screen for the October 2026 design review. It is not app code. The record of the review is [`../design-pass-2026-10.md`](../design-pass-2026-10.md): §8 is the brief, §20 the eleventh pass this page now shows, §21 its measured state.

## Run

From the repository root:

```sh
python3 -m http.server 4184 --directory docs/explorations/scatter-layouts
```

Then open <http://localhost:4184/>. It has to be served over HTTP: from `file://` the module script and the floor crops do not load. Type comes from Google Fonts; offline it falls back (Ink & Ember to the system Mincho), so judge type with the network on.

## Drive

The phone (375 × 812) and the desktop (1280 × 800, 1440 × 900 or 1920 × 1080) are frames drawn inside the page and scaled to fit their pane (`--s` on `.phone`). For true size the window must be at least 440 px wide for one phone look, 850 px for two, and 1340 px for one desktop look at 1280.

| Control | Element ids |
|---|---|
| State | `state-scatter`, `state-reading`, `state-done`, `state-scattered`, `state-feast` |
| Critters in the burrow | `size-4`, `size-6`, `size-8`, `size-10` |
| Piles | `pile-proportional` (one drawn crumb for every four given), `pile-exact` (one for every crumb) |
| Scene | `scene-window`, `scene-entrance`, `scene-dusk` |
| Device | `device-phone`, `device-desktop` |
| Size (desktop only) | `desk-1280`, `desk-1440`, `desk-1920` |
| Looks (checkboxes) | `show-inked`, `show-daylight`, `show-ink`, `show-dusk`, `show-cel` |

Below the frames, *Backgrounds to paint* builds the prompt for a floor-first plate per scene and device (`bgscene-window`, `bgscene-entrance`, `bgscene-dusk`; `bgtool-midjourney`, `bgtool-words`), and `plate-file` drops a generated plate into the frames of the device shown (for the tab only; `plate-clear` removes it).

Choices persist in `localStorage` under `scatter-layouts:view-8`. A hash of `#scatter`, `#reading`, `#done`, `#scattered` or `#feast` sets the state on load.

Inside a frame: the crumbs you have left heap in the middle of the circle (their count is in the bar); tap a critter to give a crumb (it hops from the heap to the critter's pile) and hold to pour; − sends crumbs back to the heap. − and + belong to the critter in focus; ‹ and › in the bar, a swipe across the floor, a name tag or the arrow keys turn the circle; on the phone, the thought bubble beside the head of the critter in focus opens what it wrote at the top of the screen, and the circle stays put; a tap on the floor outside it, or Escape, closes it. The dock at the bottom holds the critter in focus (− name and count +; on desktop − count +, the name being on its tag) above the bar (‹ crumbs left ›). With no crumbs left, a tap turns the circle to that critter instead of giving, and the bar's middle becomes "Scatter These", which records the allocation on the page; any change afterwards brings it back. At the feast, Results grows the dock into the results card (phone) or fills the side panel with Replay and Download CSV in a bar at its foot (desktop), and the critters huddle on the dock's top edge, playing at random; a tap on one makes it hop.

## Files

- `index.html` holds everything. In order: the page chrome CSS; the frame CSS (`.screen …`, with one `--l-*` token set per look); an SVG `<defs>` block of filters, patterns and icons; one module script. In the script: `copy` (strings, from `packages/shared/src/copy.ts`), the seed (`MEMBERS`, ten of them, yours third; `castFor()` derives the amounts for each burrow size), `SCENES` (a painting and the crop rectangles for its floor, wall and corners), `LOOKS` (tokens and critter style), `paint()` (one critter, with its drawn extent stored on the SVG), `geometry()`, `slotAt()` and `huddleAt()` (where each place in the circle is, per device, and where the critters huddle on the results' edge when Results is open; on desktop everything is in units of the floor, `u`, 1 at 1280 × 800), `syncPlay()` (their random play), `layoutRing()` (moves the critters, places the heap where it covers least, the thought bubble and its trail, and every tag centred above its critter's head, raised a little where that covers less, with the whole name or the short one), the interactions (`tapCritter`, `give`, `fly` for the crumb hops both ways, `turnTo`, `modeOf`, `setSheet`), the pieces (`header`, `spotNode`, `moundSvg` (shared by `pileSvg` and `heapNode`), `thinkSvg`, `dock`, `focusRow`, `phonePanel`, `sidePanel`, `bottomBar`, `fillMiddle`, `resultsList`), and `render()`. `NAME_LIMIT`, `TAG_NAME`, `clip()` and `tagName()` hold the 16-character name rule. `DESKS` lists the desktop sizes. At the end, `SCENE_STYLE`, `VIEW`, `PLATES`, `FRAMES` and `platePrompt()` build the background prompts, and `plates` holds a plate being tried.
- `lib/generator.js` is a port of the frozen generator plus the version 2 draw from PR #31 (`generate2`) and its colour (`palette`), used only by this page. The app's generator lives in `packages/core`; nothing here changes it.
- `images/` links to the tracked paintings: `window.webp` to `docs/pitch/assets/scene-feast.webp`, `dusk.webp` to `docs/pitch/assets/scene-dusk.webp`, `entrance.webp` to `packages/app/public/images/arrival.webp`. The entrance painting also exists at 1600 px as `docs/pitch/assets/scene-day.webp`.

The fifth pass (three layouts on the floor, per-critter − and +) is kept outside git at `.scratch/design-review/pass-5/index.html`. Passes six to eleven are versions 1 to 12 of the artifact below (pass eleven is versions 6 to 12: 8 adds the backgrounds section, 9 your critter stirring when tapped, 10 the shared kit module, 11 the phone's results buttons in one row, 12 Replay Feast on desktop).

## Publish

The page is published as the claude.ai artifact "Critter Crumbs Scatter Layouts". To republish, send `index.html` with `lib/generator.js` and the three images under `images/`, mapped from their real sources.
