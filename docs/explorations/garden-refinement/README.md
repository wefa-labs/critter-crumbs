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

## Package and provenance

- `packages/app/src/portraits/garden/` contains the refined drawing kit, derived from the original local `critter-directions/src/{garden,ink,face}.ts` prototype. These are code-authored SVG drawings; no new image generation service or external asset was used.
- [fixtures.json](fixtures.json) lists exact synthetic addresses and variants. They deliberately keep one species across variants 0–2; ordinary rerolls can change species. Inputs come from frozen generator v2 for comparison only. **`garden-refined-review-1` is a review renderer label, not a new production generator or allowed stored identity version.**
- [anchors.json](anchors.json) records every fixture's body extent, head centre/radius and hover offset in a 120 × 150 authored box. Contact is `(60, 140)`. The painter fits wide anatomy inside that box; face crops use head geometry rather than whole-body width.
- [assets/](assets/) contains 24 standalone SVG snapshots, three per species, with styles embedded. [assets-manifest.json](assets-manifest.json) records their hashes and byte sizes. They were exported from the corrected gallery DOM. `images/` contains unretouched browser captures.
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

- Launcher: [390 × 844](images/launcher-phone.jpg), [1440 × 900](images/launcher-desktop.jpg).
- Combined first meeting: [390 × 844](images/onboarding-phone.jpg), [1440 × 900](images/onboarding-desktop.jpg), [320 × 568](images/onboarding-compact.jpg). A new local rehearsal identity was used; no Keep, reroll or adoption was submitted. A temporary ninth discovery option was removed after capture and the prior rehearsal session restored.
- Tutorial: [step 1 phone](images/tutorial-1-phone.jpg), [step 2 phone](images/tutorial-2-phone.jpg), [step 3 phone](images/tutorial-3-phone.jpg), [step 4 phone](images/tutorial-4-phone.jpg); desktop files use the same names with `desktop` in place of `phone`. All four steps use the live tutorial, including its worked result.
- Ten-critter Window scattering with a long name: [phone](images/scattering-phone.jpg), [desktop](images/scattering-desktop.jpg). [320 × 568 stress case](images/scattering-compact.jpg). Eight critters at Dusk: [1280 × 720](images/scattering-dusk-720.jpg).
- Ten-critter result huddle and cropped list faces: [desktop](images/results-desktop.jpg), [390 × 844](images/results-phone.jpg), [320 × 568](images/results-compact.jpg). Results choose their own Window scene; the scene query does not override it.
- Art studies: [three foxes before/after](images/three-foxes-comparison.jpg), [faces](images/faces-desktop.jpg), [silhouettes](images/silhouettes-desktop.jpg), [expressions](images/expressions-desktop.jpg).

Light game/onboarding surfaces and dark launcher/tutorial surfaces were inspected. Paintings retain their established theme treatment. The 320 px first-meeting dialog stays within the viewport with a pinned footer; results scroll inside their sheet. Still/reduced-motion rendering and sleep were checked through the real pose adapter. Portrait-only review requires no 3D chunk.

## Measurement and verification

Performance JSON files record browser, visibility, viewport, pixel ratio, SVG node/filter counts and six seconds of frame pacing after a one-second warmup. Measurements use ten critters, including three foxes, in the visible in-app Chromium browser on this Mac. The final paired desktop run measured 60 fps for the refinement and 5.1 fps for the prototype; the phone-width refinement run also measured 60 fps. The refinement had 1,668 SVG nodes and no filters, versus 2,805 nodes and 48 filters in the prototype. These are local frame-pacing observations, not calibrated GPU benchmarks or physical-phone tests. Safari/WebKit, mobile keyboards and screen-reader speech remain unverified. Earlier exploratory samples varied around 50–54 fps. The final six-second observations do not establish a guaranteed 60 fps on other hardware or workloads.

| Check | Result |
|---|---|
| Full serial suite | **601 tests passed in 81 files**, followed by **21 offline tooling tests**. `bun run test -- --maxWorkers=1 --reporter=verbose`; 824 seconds. |
| Lint and typecheck | Passed, including the standalone gallery TypeScript project. |
| Ordinary production build | Passed: shell **116,405 / 120,000** gzip bytes; Three **198,469 / 250,000**. No review painter chunk shipped. |
| Review-enabled production build | Passed: shell **116,842 / 120,000**; Three **198,469 / 250,000**. Refined painter is a separate lazy chunk of about 14 KB gzip. |
| Production browser startup | Four refined launcher portraits with the explicit query; v1 portraits after `?critters=1`; no fresh console errors. |
| Development assets, workspace probe, licences/archive integrity | Passed. The workspace probe used writable scratch temporary/cache directories. |
| Vulnerability audit | Blocked: npm advisory endpoint returned HTTP 403. No fresh vulnerability result claimed. |
| Standalone assets | All 24 SVGs parse, have unique internal IDs and resolve every paint-server reference inside their own file. |
| Two-axis source review | Standards: 0 actionable findings. Spec: 0 actionable findings, including the short-phone repair. |

The initial aggregate check and first redirected serial attempt stalled after Vitest startup and were interrupted. The final serial run above completed with unchanged test timeouts. The ordinary aggregate command is not claimed green. Cached Modern Web Guidance was unavailable and was not refreshed. A development hot-update teardown error was observed in the existing game-stage/world lifecycle; a full reload restored the fixture and fresh production startup had no console errors. This pass does not claim to repair that separate HMR issue.

The short-phone stress check exposed overlapping tags. Short floors now scale bodies, reserve room above the back row, and use a bounded search that removes duplicate positions and places the most constrained tag next. On these floors a tag may sit below its critter, and portrait rectangles are soft obstacles; the heap, piles, thought bubble and dock remain hard exclusions. This gives names and controls priority over illustration bounds. Geometry at 390 × 844 and on desktop is preserved. The regression covers all ten focus positions and multiple text measurements; [the browser record](short-phone-tags.json) confirms ten distinct focus names with no tag overlap at 320 × 568.


## Review switch and rollback

Local development: open `/?critters=garden` or `/how-it-works?critters=garden`. A production-style review build additionally requires `VITE_GARDEN_REVIEW=true` at build time. The ordinary build omits the review art chunk. The review flag alone does not change the default: the explicit query is also required. Internal navigation retains the loaded renderer for that page session; a refreshed URL needs the query again.

```sh
VITE_GARDEN_REVIEW=true bun run build
```

For an immediate visual rollback, open the same route with **`?critters=1` and reload**. For a future review deployment, rebuild without `VITE_GARDEN_REVIEW`. Neither action touches saved identities.

The pre-art checkpoint is **`d9d53aa322e6193fc5e0b2e13a940810e5c89d69`** (`feat(shared,client): add stable shell and versioned identities`). The art is a separate commit tagged `review/garden-refined-2026-10-16`; the checkpoint is tagged `rollback/pre-garden-2026-10-16`. Run `git revert review/garden-refined-2026-10-16` to retain the shared shell, onboarding, tutorial and versioned storage. The review commit adds no database migration or identity writes, so reverting it needs no database rollback. Do not reset the branch to discard unrelated work.

Before personal adoption can ship, review the final generation recipe and renderer version, then implement a preview/Keep flow that reads stored versions and requires an explicit choice. Existing frozen feast snapshots must continue using their recorded appearance. No adoption endpoint, production migration, chain write, public registration or deployment was performed here.
