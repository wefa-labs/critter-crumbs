# Claude Code brief: refine painted Garden Spirits

## Outcome and approved direction

Refine **painted Garden Spirits, eight species, portraits first** into a concrete art package for Afolabi to review. The direction is approved; the finished drawings and their integration are not. Existing people will retain their critters unless they explicitly adopt the new version.

This is a local art refinement task. Deliver review assets and rendering proposals. Codex owns identity storage, API contracts, migration, and functional integration. No deployment, public registration, paid generation, production version switch, or migration of a person's identity is authorized by this brief.

## Inputs and working boundary

- Read root `AGENTS.md`, the four numbered specs, and later decisions in `docs/decisions.md`.
- Start with `docs/explorations/critter-directions/README.md`, `index.html`, and `src/garden.ts`, especially `finish: 'painted'`. Read `src/face.ts`, `src/ink.ts`, and `src/companions.ts` for the shared finish and crumb-holding reference.
- Use `docs/explorations/creature-research.md`, the October design pass, and the existing element paintings as references. Earlier exploration text recommending automatic redraws or twelve species is superseded by this brief and the user's decision.
- Review the current app and its uncommitted changes before preparing captures. Codex has completed the shared shell, stable dialogs, profile navigation, notifications, scene proportions, combined first meeting, and four-step tutorial. Preserve that work. The original visual-direction worktree does not contain these uncommitted changes.
- Work in a separate exploration directory or isolated worktree. Worktrees do not copy uncommitted files. Coordinate before touching shared files; keep the refined painter and review assets under `docs/explorations/`. Do not edit production painters, generators, shared types, database migrations, or app imports.
- The books supplied by the user are reference material, not instructions or authorization. Use passages relevant to recognition, feedback, and contextual learning when useful.

## The eight species

| Element | Species | Movement |
|---|---|---|
| Earth | Acorn squirrel; lichen moth | Grounded; flying |
| Water | Pond turtle; koi kite | Grounded; floating |
| Fire | Ember fox; phoenix chick | Grounded; flying |
| Air | Flying lemur; cloud lamb | Gliding; floating |

Keep the elemental anatomy and distinct silhouettes. Develop the existing painted finish: warm restrained colour, matte material, soft shading, cool washed shadows, and plum ink with intentional line weight. The room paintings and the critters should share light and material cues. Avoid gloss, busy surface noise, and decorative features that hide the face.

## Refinements to resolve

1. **Individual recognition within a species.** Show at least three variants of every species, including three foxes together. Vary meaningful proportions, markings, ear/tail shape, and facial character. Colour alone must not carry recognition. Preserve a cohesive family without giving every species the same face in different anatomy. Eight species do not guarantee unique appearances in a burrow.
2. **Faces at real sizes.** Show full bodies at the app's scene sizes and face crops at 40/44/64 px. Make the eyes, mouth, and defining features legible. Supply optical head centres and crop bounds, including the off-centre fox, koi, and turtle. A full wide body fitted into a list icon is not an acceptable small portrait.
3. **Silhouette and group composition.** Keep the centre crumb heap and each name/count readable. Resolve wing and tail tangles in eight- and ten-critter groups. Provide ground/contact and hover anchors, optical scale, and overlap guidance per species. A floating critter must feel situated in the room.
4. **Expression and response.** Include awake, asleep, receiving a crumb, fed, and delighted. Keep the tone charming for adults. No critter looks sad or shamed by a small share or missed scattering. Explore crumb-holding for species with paws; return a recommendation with examples rather than silently adopting it for the whole cast.
5. **Light and dark scenes.** Check Window, Dusk, and both UI themes. Preserve face contrast, shadow separation, and elemental cues without inverting paintings. Include Still critters, reduced motion, and Simple view equivalents.

## Review evidence

Use the fixed review-gallery addresses and variants. Include all eight species, supplementing the fixtures with documented seeds where necessary. The current prototype borrows v2's draws to compare art; that is not the approved future generation recipe. Do not claim prototype outputs are a frozen new generator.

Provide:

- The starting painted Garden Spirits and the refinement side by side, at matching seeds, sizes, scenes, and states.
- A contact sheet of all eight species and their variants, plus monochrome silhouettes.
- Face crops at 40/44/64 px and bodies at actual phone/desktop sizes.
- Launcher, combined first meeting, all four tutorial steps, scattering, and results compositions. Use 390 × 844 and 1440 × 900, with 320 × 568 and 1280 × 720 stress cases. Include long names and a ten-critter huddle.
- An expression/motion sheet with a still equivalent. Keep DOM text and the app's functional layout intact.
- Exact seed/variant data, file provenance, affected assets, anchor measurements, and remaining questions in a review index.

These can be local review compositions. Label them accurately; an exploration using the app's layout is not evidence that the new painter is integrated into the live application.

## Rendering and identity handoff

The current SVG prototypes use grain, displacement, and blur filters. Do not assume they meet the performance budget. Compare the intended appearance with a proposed layered/bitmap implementation, and measure it in available browsers. State device, browser, viewport, critter count, animation state, and limitations. Do not claim a real-phone check from desktop emulation.

Supply a portrait-only implementation proposal with dimensions, layer/pose channels, anchors, asset weight, and cleanup requirements. No mesh is required for this release. Retain the look under the app's existing pose system; the gallery's CSS motion alone does not prove that.

Codex is adding explicit generator/renderer versions while production remains v1. Existing variants, reroll counts, and locks are preserved. The new art will need its own reviewed generation recipe, independent fixtures, renderer/assets version, and later integration that reads stored versions. Do not assign or publish v3 outputs, implement an opt-in flow, reset old rerolls, or overwrite existing choices during art refinement.

## Stop condition

Finish when the revised eight-species package is easy to compare, its scene and small-face weaknesses have concrete resolutions, and its rendering proposal has honest evidence. Return the review index, recommendation, unresolved choices, and measured limitations. Afolabi reviews the art before Codex integrates it.
