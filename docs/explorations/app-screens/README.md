# App screens — review page

A static mock-up of every screen around the scatter screen, in the order a member meets them, for the October 2026 design review. It is not app code. 54 screens in ten stages: 31 on the main path and 23 states (errors, edge cases and the creator's extras). The record is [`../design-pass-2026-10.md`](../design-pass-2026-10.md) §23 (version 1) and §24 (version 2); the scatter screen itself is on [`../scatter-layouts/`](../scatter-layouts/).

## Run

From the repository root:

```sh
python3 -m http.server 4185 --directory docs/explorations/app-screens
```

Then open <http://localhost:4185/> (launch config `app-screens`). It has to be served over HTTP: the module script and the paintings do not load from `file://`.

## Drive

| Control | Element ids |
|---|---|
| Device | `device-phone`, `device-desktop` |
| Look | `look-inked`, `look-daylight`, `look-ink`, `look-dusk`, `look-cel` |
| Show | `show-all` (every screen), `show-path` (the main path alone; states are hidden) |

Choices persist in `localStorage` under `app-screens:view-1`. The stages are linked at the top of the page (`#st-arrive`, `#st-connect`, `#st-meet`, `#st-learn`, `#st-burrows`, `#st-setup`, `#st-gathering`, `#st-feast`, `#st-you`, `#st-wrong`); each screen is `#s-<id>`.

Inside the frames, buttons that lead somewhere scroll to that screen and flash it; a link to a state while Show is on the main path shows everything first. Meet your critter re-rolls (four at most) and Keep this one locks it; on the second first step, a tap on a critter flies a practice crumb from the heap and a hold pours; the profile's switches switch.

## Files

- `index.html`: the page. In its script: `copy` (strings from `packages/shared/src/copy.ts`, then the proposals the screens need, marked as such), the seed (the scatter page's burrow and a second one), the pieces (`critter`, `circle`, `row`, `face`, `hdr`, `btn`, `field`, `notice`, `heapAt`, `podSvg`, `sceneLayer`), the composite pieces (`feastCard`, `setupSheet`, `gatheringSheet`, `membersSheet`, `giversTable`, `miniDock` and `scatterMoment` for the states on the scatter screen, drawn with the scatter page's dock and, on desktop, the statement beside it, `resultsFoot`, `huddle`, `emptyFeasts`, `membersCard`), `SCREENS` (one function per screen returning its header, scene, sheet, dialog, banner, toast and, for the dock layout, the desktop panel), `FLOW` (the stages, then each screen's id, name, caption and `'state'` when it is off the main path), `NOTES`, `screenFor()` and `render()`.
- `lib/kit.js` and `lib/generator.js` link to `../scatter-layouts/lib/`: the looks, the seed, the critter painter, crumbs and mounds, the SVG filters and icons, and the generator, shared with the scatter page.
- `images/` links to the tracked paintings: `window.webp` to `docs/pitch/assets/scene-feast.webp`, `entrance.webp` to `docs/pitch/assets/scene-day.webp`, `dusk.webp` to `docs/pitch/assets/scene-dusk.webp`.

## Publish

Published as the claude.ai artifact "Critter Crumbs Screens": version 1 is the first pass (§23), version 2 adds the states (§24). To republish, send `index.html` with `lib/kit.js`, `lib/generator.js` and the three images, mapped from their real sources rather than the links.
