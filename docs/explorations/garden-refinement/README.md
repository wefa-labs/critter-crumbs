# Painted Garden Spirits: refinement review

Eight species are ready to review in the [interactive gallery](index.html). The app can draw the same refined portraits through an explicit review switch. Saved generator/renderer versions, variants, rerolls and locks are untouched. Normal production builds still draw v1.

This implements Afolabi's 16 October request for Codex to execute the [refinement brief](../claude-code-critter-refinement-2026-10-16.md), integrate a reversible preview and push the work. It supersedes that brief's earlier restriction against app imports. Final art acceptance and personal opt-in migration remain separate decisions.

## What to review

The finish keeps warm pigment, matte eyes, plum edges and cool contact shadows. Static paper marks replace live grain/displacement/blur filters. Moth and phoenix wings, koi tails and lemur membranes have narrower reaches. Fox blaze patterns, ear proportions, facial character and optional lamb horns add recognition beyond colour. The gallery compares three matching variants of every species with the original prototype, plus silhouettes and 40/44/64 px face crops.

My recommendation is to continue with this layered SVG finish and keep crumb-holding off by default. It matches the room paintings while retaining the existing blink, gaze, ear, breath, growth and sleep channels. Holding is charming for a close portrait, but a held crumb can be confused with a received amount in a feast. The expression sheet keeps it available for review. No mesh is needed for this art pass.

| Element | Species | Contact / movement |
|---|---|---|
| Earth | Acorn squirrel; lichen moth | Grounded; flying |
| Water | Pond turtle; koi kite | Grounded; floating |
| Fire | Ember fox; phoenix chick | Grounded; flying |
| Air | Flying lemur; cloud lamb | Gliding; floating |

There are three grounded and five flying/floating species. Eight species do not guarantee unique appearances. Names remain essential, especially when several critters share a species.

## Completion pass, 16 October (Claude)

Claude's visual review of the committed package found four concrete defects, fixed in a commit after `review/garden-refined-2026-10-16`. The direction, cast, fixtures, anchors and face-crop geometry are unchanged. See the [wing fix before and after](images/wing-fix-before-after.jpg).

- **Wings left their roots.** `style.css` gave every `.cr-wing` a fill-box transform origin, so that the sleep fold would shrink each wing in place. That origin also applies to the element's own `transform` attribute, which re-centred each wing: the lichen moth's and flying lemur's left wings were drawn over their right ones, and the phoenix's wings pivoted off its shoulders. Each wing now sits in a positioned parent group whose origin is the wing's root, and the stylesheet keeps the default transform box, so the sleep fold narrows a wing toward the body. Koi fins use the same structure. Every capture with a moth, phoenix or lemur was affected, including the launcher, tutorial, scattering and results fixtures.
- **Small portraits ignored their size.** The refined painter did not set `data-size`, so the app's `.portrait[data-size]` rules never applied and a 40, 64 or 96 px portrait filled its container. The Home empty state drew the critter at the card's full width, visible behind the first meeting in the previous desktop capture. The painter now sets `data-size` as the version 1 and 2 painters do.
- **Whole bodies in list icons.** Under the review switch, the burrow member list (40 px) and the profile menu drew whole bodies, which the refinement brief rules out for wide species. They now use the head crop already used by the results rows and the header button. `CritterFace` moved to `app/ui.tsx`, where it and the header button share one crop helper. Production and `?critters=1` keep their whole-body icons.
- **Gallery silhouettes.** Each silhouette rendered at the full row width (976 × 1220 px) because the portrait stylesheet's `width:100%` overrode the size attribute. Glow points also filled as solid discs over fox lanterns and acorns. Silhouettes are now 100 px wide and leave out glows, which carry a `cr-glow` class.

A browser regression test in `tests/e2e/portraits.spec.ts` paints the moth, phoenix and lemur fixtures awake and asleep. It requires mirrored wings that never cross the body's axis, a narrower sleeping fold and fixed 40/64/96 px sizes. Against the previous stylesheet it fails (the moth's left wing measured 86 px across the axis); with the fix it passes.

Left as they are, for review rather than as art defects:

- The desktop result huddle stands on the dock's top edge, and its front critter overlaps the dock border. This is the existing huddle layout, shared by every critter version.
- At 320 × 568 no two name tags overlap, but some sit well away from their critter with nothing linking them. The short-phone solver gives readable names priority over placement.
- Two critters of one species and coat can look alike; their names tell them apart. The opening screens avoid it: Moss's first drawing is a pale lichen moth like Juniper's, so under the review art the launcher and How it works draw Moss's third, an ember fox, and show one critter of each element (`openingVariant` in `packages/app/src/app/painted-scene.ts`).

## Package and provenance

- `packages/app/src/portraits/garden/` contains the refined drawing kit, derived from the original local `critter-directions/src/{garden,ink,face}.ts` prototype. These are code-authored SVG drawings; no new image generation service or external asset was used.
- [fixtures.json](fixtures.json) lists exact synthetic addresses and variants. They deliberately keep one species across variants 0–2; ordinary rerolls can change species. Inputs come from frozen generator v2 for comparison only. **`garden-refined-review-1` is a review renderer label, not a new production generator or allowed stored identity version.**
- [anchors.json](anchors.json) records every fixture's body extent, head centre/radius and hover offset in a 120 × 150 authored box. Contact is `(60, 140)`. The painter fits wide anatomy inside that box; face crops use head geometry rather than whole-body width.
- [assets/](assets/) contains 24 standalone SVG snapshots, three per species, with styles embedded. [assets-manifest.json](assets-manifest.json) records their hashes and byte sizes. They were exported from the corrected gallery DOM. After the completion fixes they were re-exported with the same serialisation; each file differs from the review commit only in `data-size`, the `cr-glow` class, the wing and fin groups and the embedded stylesheet. `images/` contains unretouched browser captures; the [capture record](capture-record.json) lists the browser, route, viewport, theme and checks for each.
- The original prototype, production v1 and faithful v2 painters and generator outputs are preserved. New IDs have a renderer namespace so the two comparison painters cannot share SVG paint servers. The corrected gallery has no duplicate IDs.

The runtime generates SVG elements without markup injection. Individual shapes are the layers: body, hover group, head, eyes, gaze, ears, cheeks, mouth and floor shadow. The pose adapter writes moving groups directly rather than changing inherited custom properties on the whole tree each frame. Quiet mode removes breathing/hover and retains state crossfades. `disposePortrait` owns crossfade cleanup; the gallery also cancels its animation frame and destroys its Koota world on stop or page exit.

A layered bitmap alternative would bake pigment into body/head/ear/wing textures while preserving the same anchors and pose groups. It could reduce SVG work but would require resolution variants and more assets for individual markings. It has not been implemented or measured. The SVG proposal is the concrete implementation in this package.

Rebuild from the repository root with the pinned Bun/Node toolchain:

```sh
node docs/explorations/garden-refinement/build.mjs
bunx --no-install tsc -p docs/explorations/garden-refinement/tsconfig.json
```

The rebuild regenerates fixtures, anchors and the gallery bundle. Standalone SVGs and browser captures are review snapshots; regenerate them from the rendered gallery after changing the painter. The gallery's strict IIFE preserves Koota's primitive entity semantics. It runs the app's real `createWorld.tick` and `renderPortraits`, not a CSS-only imitation.

## Integrated compositions

These captures use the refined painter inside the current app. Scattering/results are the existing development fixtures rendered through actual game components; they do not prove a remote feast or a production migration.

All captures were re-taken on 16 October after the completion fixes, from the working tree, in headless Chromium 151 (Playwright 1.62.1) at a device pixel ratio of 1. Routes, viewports and themes match the earlier set: dark for the launcher and tutorial, light for the game and onboarding. Every capture was checked for wings on opposite sides of each body and for console errors other than a visitor's expected 401. The harness is local (`.scratch/garden-review/capture.mjs`) and is not part of the package.

- Launcher: [390 × 844](images/launcher-phone.jpg), [1440 × 900](images/launcher-desktop.jpg).
- Combined first meeting: [390 × 844](images/onboarding-phone.jpg), [1440 × 900](images/onboarding-desktop.jpg), [320 × 568](images/onboarding-compact.jpg). A fresh local identity signs in through an injected test wallet with a fixed key, as `tests/e2e/first-steps.spec.ts` does; its critter is a phoenix chick. The phone capture types a long name. No Keep, reroll or adoption was submitted.
- Member list and profile menu under the review switch, with 40 and 44 px head crops: [members](images/members-phone.jpg), [profile](images/profile-phone.jpg). The burrow is a local development seed.
- Tutorial: [step 1 phone](images/tutorial-1-phone.jpg), [step 2 phone](images/tutorial-2-phone.jpg), [step 3 phone](images/tutorial-3-phone.jpg), [step 4 phone](images/tutorial-4-phone.jpg); desktop files use the same names with `desktop` in place of `phone`. All four steps use the live tutorial, including its worked result.
- Ten-critter Window scattering with a long name: [phone](images/scattering-phone.jpg), [desktop](images/scattering-desktop.jpg). [320 × 568 stress case](images/scattering-compact.jpg). Eight critters at Dusk: [1280 × 720](images/scattering-dusk-720.jpg).
- Ten-critter result huddle and cropped list faces: [desktop](images/results-desktop.jpg), [390 × 844](images/results-phone.jpg), [320 × 568](images/results-compact.jpg). Results choose their own Window scene; the scene query does not override it.
- Art studies: [three foxes before/after](images/three-foxes-comparison.jpg), [faces](images/faces-desktop.jpg), [silhouettes](images/silhouettes-desktop.jpg), [expressions](images/expressions-desktop.jpg), [wing fix before/after](images/wing-fix-before-after.jpg).

Light game/onboarding surfaces and dark launcher/tutorial surfaces were inspected. Paintings retain their established theme treatment. The 320 px first-meeting dialog stays within the viewport with a pinned footer; results scroll inside their sheet. Still/reduced-motion rendering and sleep were checked through the real pose adapter. Portrait-only review requires no 3D chunk.

## Measurement and verification

Performance JSON files record browser, visibility, viewport, pixel ratio, SVG node/filter counts and six seconds of frame pacing after a one-second warmup. Measurements use ten critters, including three foxes, through the gallery's Motion section. After the completion fixes, and after the builds and tests had finished, they were re-measured in a visible (headed) Chromium 151 window at a pixel ratio of 1. At 1440 × 900 the refinement held a 16.7 ms median frame in three six-second samples, at 53.3, 59.5 and 60.0 fps. The first sample, which is the committed record, includes one frame over 50 ms. The prototype measured 3.5 fps, with a 249 ms median frame. At 390 × 844 the refinement measured 59.7 fps. The refinement has 1,676 SVG nodes and no filters, against 2,805 nodes and 48 filters in the prototype; the 8 extra nodes are the new wing and fin groups. Codex's earlier runs in its visible in-app Chromium 155 measured 60 fps for the refinement and 5.1 fps for the prototype, with exploratory samples around 50–54 fps. These are local frame-pacing observations, not calibrated GPU benchmarks or physical-phone tests. Safari/WebKit, mobile keyboards and screen-reader speech remain unverified. They do not establish a guaranteed 60 fps on other hardware or workloads.

Checks after the completion fixes:

| Check | Result |
|---|---|
| Unit and tooling suite | **601 tests passed in 81 files**, then **21 offline tooling tests**: `bun run test` with its normal two workers, 304 seconds. Codex's earlier serial run (`--maxWorkers=1`, 824 seconds) also passed. |
| Lint and typecheck | Passed: `bun run lint`, `bun run typecheck` and the standalone gallery TypeScript project. `git diff --check` is clean. |
| Ordinary production build | Passed: shell **116,437 / 120,000** gzip bytes, 32 more for the shared face crop; Three **198,469 / 250,000**. No review art in the bundle. |
| Review-enabled production build | Passed: shell **116,869 / 120,000**; Three **198,469 / 250,000**. The refined painter is a separate lazy chunk of 13.98 KB gzip. |
| Production browser startup | Review build, launcher at 390 × 844: `?critters=garden` drew four refined portraits and loaded the art chunk; `?critters=1` and no query drew four version 1 portraits without loading it. No console errors. |
| Browser tests | Portraits, shared shell, first steps and launcher specs: 21 of 21 pass against the polling development server on 5174. Two assertions name port 5173, so those two tests ran as copies with only the port changed. The new wing test fails against the previous stylesheet. |
| `bun run check` | Passed as one command: toolchain, tokens, lint, typecheck, the suite above, development assets, the workspace probe (with default temporary directories), licences/archive integrity and the audit. |
| Vulnerability audit | Passed: `bun audit` found no vulnerabilities at the high level (786 packages, 1 reviewed ignore). Codex's earlier attempt had returned HTTP 403. |
| Standalone assets | All 24 SVGs parse, have unique internal IDs and resolve every paint-server reference inside their own file. |
| Source review | Codex: Standards and Spec reviews found no actionable findings. Claude's visual review found the four defects above, now fixed. |

The development server on port 5173 kept serving cached modules after source edits during this pass, so browser checks used the polling server on 5174 or a private in-process server. Cached Modern Web Guidance was unavailable and was not refreshed. Codex observed a development hot-update teardown error in the existing game-stage/world lifecycle; a full reload restored the fixture. This pass does not repair that separate HMR issue.

The short-phone stress check exposed overlapping tags. Short floors now scale bodies, reserve room above the back row, and use a bounded search that removes duplicate positions and places the most constrained tag next. On these floors a tag may sit below its critter, and portrait rectangles are soft obstacles; the heap, piles, thought bubble and dock remain hard exclusions. This gives names and controls priority over illustration bounds. Geometry at 390 × 844 and on desktop is preserved. The regression covers all ten focus positions and multiple text measurements; [the browser record](short-phone-tags.json) confirms ten distinct focus names with no tag overlap at 320 × 568.


## Review switch and rollback

Local development: open `/?critters=garden` or `/how-it-works?critters=garden`. A production-style review build additionally requires `VITE_GARDEN_REVIEW=true` at build time. The ordinary build omits the review art chunk. The review flag alone does not change the default: the explicit query is also required. Internal navigation retains the loaded renderer for that page session; a refreshed URL needs the query again.

```sh
VITE_GARDEN_REVIEW=true bun run build
```

For an immediate visual rollback, open the same route with **`?critters=1` and reload**. For a future review deployment, rebuild without `VITE_GARDEN_REVIEW`. Neither action touches saved identities.

The art merged to `main` with PR #56 on 17 October 2026 and was deployed switched off. Production builds don't set `VITE_GARDEN_REVIEW`, so the live site draws version 1 and never loads the review art. Nothing needs rolling back to keep it off.

The two tags stay as markers. `rollback/pre-garden-2026-10-16` is the pre-art checkpoint, **`d9d53aa`** (`feat(shared,client): add stable shell and versioned identities`), and `review/garden-refined-2026-10-16` is the art commit, **`6815240`**. Don't reset `main` to the checkpoint: everything merged since would go, and production already runs the checkpoint's migration 0009. The range `rollback/pre-garden-2026-10-16..codex/shared-shell` is no longer the art alone either: the branch went on to carry twenty more commits, including the desktop results huddle (#57) and the visual polish batch (#59).

To remove the review art from the code, revert its three commits on a branch from `main`, newest first: the opening cast (`4e9e557`), Claude's completion fixes (`e1d4183`) and the art (`6815240`).

```sh
git revert --no-edit 4e9e557 e1d4183 6815240
```

On 25 October, against `main` at `0083c20`, two files conflicted. Resolve each, `git add` it, and run `git revert --continue`:

- `docs/decisions.md`, on the second and third reverts. Keep `main`'s version, because the log is append-only, and add a new entry recording the removal.
- `packages/app/src/game/layout.ts`, on the third revert. Keep `main`'s version: the art commit also carried the short-phone name-tag fix, which applies to every critter version, and later layout changes build on it.

Three later tests also measure layouts with the review art's shapes and stop compiling once it is gone:

- `packages/app/test/name-tags.test.ts` and `packages/app/test/circle-legibility.test.ts`: remove the `gardenDraw, gardenLayout` import and the `'Garden Spirits'` entry.
- `packages/app/test/results-huddle.test.ts`: import `portraitMetrics` from `../src/portraits/metrics.js` in place of the garden import, and build each extent with `portraitMetrics(generate2(member.address, 0), fed).extent`.

With those changes every step of `bun run check`, and `bun run build`, passed on the reverted tree. API and deployment tests that timed out under heavy machine load passed on a serial re-run; the reverts touch none of their code. The shared shell, onboarding, tutorial, versioned storage and the desktop results huddle (#57) all stay. None of the three commits adds a database migration or identity writes, so no database rollback is needed. Do not move the tags.

Before personal adoption can ship, review the final generation recipe and renderer version, then implement a preview/Keep flow that reads stored versions and requires an explicit choice. Existing frozen feast snapshots must continue using their recorded appearance. No adoption endpoint, production migration, chain write, public registration or deployment was performed here.
