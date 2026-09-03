# Critter Crumbs — Design Directions

**Exploration, not a numbered document** · 2026-09-02 · Reacts to: `02-design-system.md`
Companion artifact: the same four directions rendered live, with the generator's own critters drawn in each style.

Purpose: explore alternative critter design languages, typography and colour palettes before the visual identity is frozen for the September rehearsal, and give Midjourney prompts that produce useful concept and illustration assets for whichever direction wins.

**What does not move.** Critters in the app are generated from primitives at runtime (no stored models), inside the low-poly budget, with all chrome in the DOM, all text pairs at 4.5 : 1, and the vocabulary unchanged. Midjourney never produces an in-app critter, an icon, or a typeface.

**What can move.** How the generated critters are *rendered* (outline, shading steps, rim light, texture), the generator's parameter ranges and colour bands, the type pairing, the token palette, the DOM's surface texture, and light versus dark ground.

The requested reference mix is Avatar: The Last Airbender, Arcane, Pokémon, and X-Men '97. §1 says what each contributes; the four directions in §2–§6 weight them differently.

---

## 1. Style DNA — what each reference contributes

| Reference | Borrow | Leave behind |
|---|---|---|
| **Avatar: The Last Airbender** | Ink-brush line quality with a little bleed; earthy elemental palettes (ochre, rust, deep teal, ink); creature *chimeras* (sky bison, turtle-duck, winged lemur) that are strange but kind; calm, wise tone; nature motifs | Characters, costumes, nations, bending; anything that reads as a specific creature from the show |
| **Arcane** | Painterly, hand-crafted texture; rim light against a warm key; dramatic value contrast; industrial art-deco lettering hints; grit that still feels handmade | The violence and the darkness of tone; material complexity that breaks the performance budget |
| **Pokémon** | Creature-design *appeal*: simple geometric shapes, one-glance silhouettes, a colour identity per creature, big readable eyes; sticker-like expression sheets | Evolutions, types as mechanics, battling, collecting, any existing creature |
| **X-Men '97** | Bold flat cel colour, thick uniform outlines, saturated 90s primaries, confident staging, halftone and comic texture | Costumes, superhero drama, action-line violence |

The common ground of all four: **clear silhouettes, expressive eyes, and a confident line**. The current design system has the first two and no line at all; every direction below adds a line of some kind, which is the biggest change on offer.

## 2. The four directions at a glance

| | A · Ink & Ember | B · Painted Signal | C · Saturday Morning | D · Field Guide |
|---|---|---|---|---|
| Weighting | Avatar, with Arcane texture | Arcane, with Avatar palette | X-Men '97 × Pokémon | Pokémon appeal × Avatar nature; the current system evolved |
| Ground | Parchment, light | Deep slate, **dark** | Warm white, light | Oat, light |
| Line | Ink brush, 1.5–2 px, slight bleed | Hairline in dark teal, or none | Thick uniform ink, 2.5–3 px | Soft edge darkening, no drawn line |
| Shading | Two-tone cel, soft terminator | Painterly two-tone + rim light | Flat, one hard shadow, halftone | Matte gouache, no steps |
| Display type | Shippori Mincho | Josefin Sans | Lilita One | Fraunces |
| Body type | Atkinson Hyperlegible | Public Sans | Nunito | Nunito Sans |
| Critter build | Chunky, big heads, big kind eyes | Leaner, longer legs, sharper expressions | Round, biggest eyes, saturated | As now, slightly bigger eyes |
| 3D cost | Toon ramp + outline pass | Toon ramp + rim term + outline | Toon ramp + thick outline | None beyond today |
| Biggest risk | Ink bleed is hard to fake in 3D at 44 px | Dark theme in v0 (the design system chose light-only) | Can tip into childish | Least distinctive of the four |

Outline passes in Three.js are an inverted-hull second draw per critter (≈ +1 draw call, +100 % triangles of the outlined parts) — inside the budget for ten critters, but the Technical Spec must count it. Toon ramps are `MeshToonMaterial` with a 2–3 step gradient map: no post-processing, so the "no post" rule holds for every direction.

## 3. Direction A — Ink & Ember

*Avatar's ink and earth, Arcane's paper texture. A burrow drawn in a travelling monk's sketchbook.*

### Palette

| Token | Value | Role | Contrast on ground |
|---|---|---|---|
| Parchment | `#EFE3CC` | Ground | — |
| Paper | `#F8F0DF` | Surfaces | — |
| Ink | `#1F2426` | Text, outlines, primary buttons | 12.4 : 1 |
| Earth | `#5A4A3A` | Secondary text | 6.9 : 1 |
| Ember | `#D9662B` | Crumbs (decorative) | 2.9 : 1 |
| Ochre | `#C99A3B` | Warm accent, heap highlights | — |
| Deep teal | `#2E6B72` | Alive / done, links, secondary accent | 4.8 : 1 |
| Rust | `#A63A25` | Errors | 5.1 : 1 |
| Dusk violet | `#6F6A8C` | Asleep tint | — |

### Typography

**Shippori Mincho** (display, 500/700): a Mincho serif with brush-derived strokes — the closest a Latin face gets to an inked title without being a "brush font". **Atkinson Hyperlegible** (body): built for legibility, warm enough, and its distinct letterforms help across four continents' worth of screens.

### Critter language

Chunky and kind. Heads 15 % larger than today, eyes 25 % larger, ears a little longer; bodies round or egg. Colours drawn from four elemental hue bands (rust 20–40°, ochre 60–90°, moss 110–140°, teal 170–200°) at moderate chroma. Rendered with an ink outline that thickens at the base of shapes (a 1.5 px line with a 2 px shadow-side pass), two-tone cel shading with a soft terminator, and a paper grain on DOM surfaces only (never on the critters).

Generator dialect: `headSize × 1.15` (cap 0.85), `eyeSize × 1.25`, `earSize × 1.1`, `bodyWidth × 1.05`, hue snapped into the four bands, chroma 0.06–0.11.

3D: `MeshToonMaterial` with a three-step ramp (base, shade at −12 % L, shade-edge at −18 %), inverted-hull outline in Ink at 0.02 units, no rim. The six words survive intact; "wooden" gains "inked".

### Prompts

Style core (paste into every prompt): `hand-inked brush outlines with slight ink bleed, flat two-tone cel shading, watercolor paper grain, warm earthy palette of ochre, rust and deep teal on parchment, elemental nature motifs, calm kind expression`

1. **Critter sheet** — `character design sheet of a small round burrow creature, a chimera of a red panda and a turtle-duck, big kind eyes, tiny paws, soft belly patch, front view, side view and back view in a neutral standing pose, [style core], clean white background, no text --ar 3:2 --style raw --stylize 150 --v 7`
2. **Expression sheet** — `expression sheet of the same creature in a grid of six: curled up asleep, calm, content, pleased with rosy cheeks, happy, delighted mid-hop, consistent design across all six, [style core], clean white background, no text --oref <critter sheet image URL> --ow 250 --ar 3:2 --style raw --stylize 150 --v 7`
3. **Burrow entrance (arrival scene)** — `the inside of a cosy burrow looking out through its entrance, late afternoon sunlight pouring in, tree roots and warm earth walls, a low wooden table with a small heap of bread crumbs, ink-wash background with visible brush texture, warm ochre and rust light with deep teal shadows, no creatures, no text --ar 16:9 --stylize 300 --v 7`
4. **The feast** — `eight small burrow creatures of different shapes gathered in a loose circle around a glowing heap of bread crumbs, golden light from above, they are waking and stretching, quiet joy, seen from slightly above, [style core], no text --ar 3:2 --stylize 250 --v 7`
5. **Mood board** — `flat-lay mood board photographed from above: handmade paper, warm wood grain, dry clay, dried grass, a scatter of bread crumbs, black ink brush strokes, small painted swatches of ochre rust teal and ink, soft daylight, no text --ar 4:3 --style raw --v 7`

Chimera bases to rotate through: red panda × turtle-duck; sky-bison calf × mole; lemur × pangolin; quail × otter.

## 4. Direction B — Painted Signal

*Arcane's brushwork and rim light, tempered by Avatar's earth. The only dark direction.*

### Palette

| Token | Value | Role | Contrast on ground |
|---|---|---|---|
| Slate | `#1B1F2A` | Ground | — |
| Iron | `#262B38` | Surfaces | — |
| Bone | `#EDE6D6` | Text, outlines on dark, primary buttons | 13.2 : 1 |
| Ash | `#B8AFA0` | Secondary text | 7.6 : 1 |
| Hextech gold | `#E0A83A` | Crumbs (decorative) | — |
| Signal teal | `#3FB8AF` | Alive / done, rim light, links | 6.8 : 1 |
| Shimmer | `#E2607C` | Errors | 4.9 : 1 |
| Violet dusk | `#7B6FA3` | Asleep tint | — |

### Typography

**Josefin Sans** (display, 600/700): geometric with art-deco bones, the industrial-elegant register Arcane's titling lives in, without the copyright. **Public Sans** (body): plain, sturdy, civic — right for the money.

### Critter language

Leaner and more knowing: bodies 12 % taller and 8 % narrower, legs 40 % longer, heads slightly smaller, eyes a touch smaller and sharper (more half-lids). Colours in three bands — teal 170–210°, violet 260–300°, gold 60–80° — at lower lightness so they sit on slate. Rendered with a painterly two-tone (a soft-edged shade), a **rim light** in Signal teal on the upper-left edge, a warm gold key from the same side, and a hairline in dark teal or no line. DOM surfaces get a faint brush-grain noise.

Generator dialect: `bodyHeight × 1.12`, `bodyWidth × 0.92`, `legLength × 1.4`, `headSize × 0.95`, `eyeSize × 0.9`, `eyeStyle` weights shifted toward half-lid, lightness 0.50–0.66, chroma 0.07–0.12.

3D: `MeshToonMaterial` two-step ramp plus a fresnel rim term (a small shader chunk; the Technical Spec must cost it), inverted-hull outline in dark teal at 0.012 units. Lighting presets are re-tuned for a dark ground (key gold, fill teal). The six words: "matte" and "quiet" hold; "warm" now means warm-against-cool, not warm-everywhere.

**Flag:** this direction needs the dark theme the design system deferred to v1 (D1). Choosing it moves that work into v0: a second token set, re-tuned lighting, and a contrast pass — about two days.

### Prompts

Style core: `painterly digital illustration with visible brush strokes and hand-painted texture, strong teal rim light and warm gold key light from the upper left, dramatic value contrast, stylized realism, subtle art-deco industrial details, dark slate background, gritty but warm`

1. **Critter sheet** — `character design sheet of a small lean burrow creature, a chimera of a fox and a bat, alert half-lidded eyes, long legs, a soft belly patch, front view, side view and back view in a neutral standing pose, [style core], no text --ar 3:2 --stylize 200 --v 7`
2. **Expression sheet** — `expression sheet of the same creature in a grid of six: curled up asleep, calm, content, pleased, happy, delighted mid-hop, consistent design across all six, [style core], no text --oref <critter sheet image URL> --ow 250 --ar 3:2 --stylize 200 --v 7`
3. **Burrow entrance (arrival scene)** — `the inside of a burrow built into old brick and roots, an art-deco lantern glowing gold, teal moonlight through the entrance, a workbench with a small heap of bread crumbs, painterly brushwork, dark slate and iron tones with gold and teal light, no creatures, no text --ar 16:9 --stylize 350 --v 7`
4. **The feast** — `eight small burrow creatures gathered around a heap of bread crumbs that glows gold, teal rim light on their fur, they are waking and stretching, quiet joy, dramatic warm light against a dark burrow, [style core], no text --ar 3:2 --stylize 300 --v 7`
5. **Mood board** — `flat-lay mood board photographed from above: dark slate stone, brushed brass, oil-paint brush strokes in teal and gold, a torn painterly sketch, a scatter of bread crumbs, small swatches of slate bone teal gold and magenta, moody warm light, no text --ar 4:3 --style raw --v 7`

Chimera bases: fox × bat; badger × gecko; hare × moth; raven × rat.

## 5. Direction C — Saturday Morning

*X-Men '97's cel confidence with Pokémon's creature appeal. The boldest, and the one that must be held back from childish.*

### Palette

| Token | Value | Role | Contrast on ground |
|---|---|---|---|
| Warm white | `#FFF8E8` | Ground | — |
| Paper | `#FFFFFF` | Surfaces | — |
| Ink plum | `#22182E` | Text, outlines, primary buttons | 15.8 : 1 |
| Graphite | `#4E4658` | Secondary text | 8.2 : 1 |
| Comic blue | `#2F6BD9` | Links, alive, focus | 4.6 : 1 |
| Crumb yellow | `#F7C531` | Crumbs (decorative) | — |
| Leaf | `#1F7A44` | Done text | 5.0 : 1 |
| Alarm red | `#C9302C` | Errors | 5.0 : 1 |
| Lavender | `#8C86B5` | Asleep tint, halftone dots | — |

### Typography

**Lilita One** (display): rounded, bold, single weight — a title card, not a toy. **Nunito** (body, 400/700): rounded terminals to match, very readable on phones. If the pair reads too young in the artifact, the fallback within the direction is **Bricolage Grotesque** for display.

### Critter language

Round, big-eyed, saturated. Heads 20 % larger, eyes 45 % larger with two highlights (a large upper-left catchlight and a small lower-right one), pupils slightly larger; bodies a little wider; full hue range at high chroma so every critter has a "type colour". Rendered with a thick uniform outline, flat fill, one hard shadow tone filled with a halftone dot pattern, and no gradients anywhere. Feast staging borrows the confident poses: the settle hop is bigger here (8 % rather than 5 %).

Generator dialect: `headSize × 1.2`, `eyeSize × 1.45`, `pupilSize × 1.1`, `bodyWidth × 1.08`, chroma 0.12–0.20, lightness 0.60–0.78.

3D: `MeshToonMaterial` two-step ramp, inverted-hull outline in Ink plum at 0.035 units (thick), eyes as flat discs with two sprite highlights. "Soft" and "matte" survive; "quiet" is the word under most pressure — the palette must stay off the chrome, which is Paper and Ink only.

### Prompts

Style core: `1990s animated series cel style, bold uniform dark outlines, flat saturated colors, single hard shadow tone with subtle halftone dots, clean geometric shapes, big glossy eyes with two highlights, confident pose, warm white background`

1. **Critter sheet** — `character design sheet of a small round creature, a chimera of a hedgehog and an axolotl, huge glossy eyes, tiny paws, soft belly patch, front view, side view and back view in a neutral standing pose, [style core], no text --ar 3:2 --style raw --stylize 100 --v 7` · anime-flavoured alternative: replace the parameters with `--ar 3:2 --niji 6 --stylize 100`
2. **Expression sheet** — `sticker sheet of the same creature in a grid of six: curled up asleep, calm, content, pleased with rosy cheeks, happy, delighted mid-hop, consistent design across all six, [style core], no text --oref <critter sheet image URL> --ow 300 --ar 3:2 --style raw --v 7`
3. **Burrow entrance (arrival scene)** — `the inside of a cosy burrow looking out through its round entrance, bright afternoon sun, roots and earth walls in flat cel colors with bold outlines, a wooden table with a small heap of bread crumbs, halftone shading, warm white and saturated colors, no creatures, no text --ar 16:9 --stylize 200 --v 7`
4. **The feast** — `eight small round creatures of different shapes gathered around a glowing heap of bread crumbs, golden light burst from above, they are waking and stretching in confident cheerful poses, seen from slightly above, [style core], no text --ar 3:2 --stylize 200 --v 7`
5. **Mood board** — `flat-lay mood board photographed from above: 1990s animation cel sheets, halftone comic paper, bright marker swatches in blue yellow red and green, a scatter of bread crumbs, a small cel-shaded creature sketch, flat daylight, no text --ar 4:3 --style raw --v 7`

Chimera bases: hedgehog × axolotl; otter × chinchilla; sparrow × hamster; frog × kitten.

## 6. Direction D — Field Guide

*The current system, evolved: Pokémon's appeal and Avatar's nature drawn like a naturalist's guide to small mammals.*

### Palette

Today's tokens (Oat, Burrow, Honey, Moss, Clay, Dusk) plus one addition: **Pond** `#2F7F86` (5.0 : 1 on Oat) as a second accent for links and the alive state, so Moss is no longer doing two jobs. Honey warms slightly to `#E0A030`.

### Typography

**Fraunces** (display, opsz 9–144, weight 400/600, the soft axis high): the soft-serif answer to Young Serif with a proper weight range and italics. **Nunito Sans** (body): humanist, rounded enough to belong, more neutral than Nunito.

### Critter language

As today with two adjustments: eyes 15 % larger, and a **soft edge** — a thin darkening at the silhouette (a fresnel term in 3D, a 0.8 px darker stroke in 2D) that reads as a line from arm's length without drawing one. Gouache-matte shading with no steps. The generator's hue range stays full at the current muted chroma.

Generator dialect: `eyeSize × 1.15`; everything else unchanged.

3D: today's `MeshStandardMaterial` plus a fresnel edge (the same small shader chunk direction B needs, without the rim colour). No outline pass. The six words hold exactly.

### Prompts

Style core: `naturalist field-guide illustration, soft matte gouache shading with no outlines, felt and clay textures, muted warm palette of oat, honey, moss and clay, gentle daylight from the upper left, calm and precise`

1. **Critter sheet** — `field-guide plate of a small round burrow creature, a chimera of a vole and a wren, big soft eyes, tiny paws, a lighter belly patch, front view, side view and back view in a neutral standing pose, [style core], cream paper background, no text --ar 3:2 --style raw --stylize 150 --v 7`
2. **Expression sheet** — `field-guide plate of the same creature in a grid of six: curled up asleep, calm, content, pleased with rosy cheeks, happy, delighted mid-hop, consistent design across all six, [style core], cream paper background, no text --oref <critter sheet image URL> --ow 250 --ar 3:2 --style raw --v 7`
3. **Burrow entrance (arrival scene)** — `the inside of a cosy burrow looking out through its entrance, late afternoon sunlight, roots and warm earth walls, a low wooden table with a small heap of bread crumbs, gouache illustration with felt and clay textures, oat and honey light with moss shadows, no creatures, no text --ar 16:9 --stylize 250 --v 7`
4. **The feast** — `eight small burrow creatures of different shapes gathered in a loose circle around a glowing heap of bread crumbs, golden light from above, they are waking and stretching, quiet joy, seen from slightly above, [style core], no text --ar 3:2 --stylize 200 --v 7`
5. **Mood board** — `flat-lay mood board photographed from above: oat-coloured felt, a slice of warm wood, a small clay bowl, moss, honey in a jar, a scatter of bread crumbs, gouache swatches, soft daylight, no text --ar 4:3 --style raw --v 7`

Chimera bases: vole × wren; dormouse × frog; marmot × robin; shrew × bumblebee.

## 7. Prompt conventions

- **Model.** `--v 7` for painterly and cel work; `--niji 6` is the anime model and suits directions C and D when you want more creature-design appeal. Try both on the critter sheet first; commit to one per direction so `--sref` stays coherent.
- **Consistency.** Generate the critter sheet first. Then use `--oref <that image URL> --ow 200–300` (omni-reference) on the expression sheet and the feast so the *same* creature appears; `--cref` is the older v6 mechanism and is not needed. Lock the *look* across different creatures with `--sref <your best image URL>` (or an `--sref` code once you have one) on every later prompt.
- **Sheets.** `--style raw` and low `--stylize` (100–150) for sheets and mood boards, where you want fidelity to the words; `--stylize` 250–350 for scenes, where you want Midjourney's taste.
- **Always end with** `--no text, watermark, logo, signature, humans` (add `weapons` for direction B).
- **Aspect ratios.** Sheets `3:2`; the arrival scene `16:9` and again at `9:16` for phones; the feast `3:2`; mood boards `4:3`; crumb and heap studies `1:1`.
- **Reproducibility.** Note the `--seed` of anything you like; keep a sheet of image URLs per direction.
- **Names of the four shows.** The prompts above describe the *traits* rather than naming the properties. Adding a show's name to a prompt pulls the output closer to its characters; for a product you own, keep names out and let the traits carry it, and never ship anything that reads as an existing character.
- **Rights.** Midjourney's paid plans grant commercial use of what you generate; check the current terms for the plan in use before an image ships in the product. Nothing generated is exclusive to you.

## 8. How the assets feed the product

| Asset | Used for | Not used for |
|---|---|---|
| Critter and expression sheets | Choosing the direction; deriving the generator dialect (head, eye, ear ranges; colour bands) and the render spec (outline width, ramp steps, rim colour) for Design System §4–§5; a `GEN_VERSION` bump before the rehearsal | In-app critters — those stay procedural |
| Burrow entrance | The arrival screen's illustration and the home's empty states (DOM images: WebP, ≤ 120 KB at 2×, inside the app-shell budget); social preview image | Backgrounds behind the critter grid (the stage contract needs a flat ground) |
| The feast scene | A style frame for the feast lighting preset and the feast heap's look; the README | Anything animated |
| Mood boards | Tuning tokens and the DOM surface texture | — |
| Anything | — | Icons (hand-drawn SVG), typography (never generated), the crumb glyph (drawn once from the mood board, by hand) |

## 9. Decision needed

Pick a direction, or name a hybrid (the most likely hybrid is **A's line and palette on D's build** — inked field guide). Then:

1. Design System revision: tokens (§3), materials and lights (§4), the generator dialect and render spec (§5), the six words if they shift, and D1 if the choice is dark.
2. The design-system artifact re-skinned to the choice.
3. Concept sheets generated from §3–§6 and pinned in `docs/explorations/` for the coding agents.
4. The Technical Spec costs the outline pass and the fresnel chunk against the performance budget.

## 10. Controlled comparison set — one critter, one scene, four styles

To judge the styles against each other, hold the subject constant and change only the aesthetic. Two constant blocks are pasted verbatim into every prompt; only the style core and parameters differ.

**Critter constant (verbatim in all four):**
`a single small round burrow critter, a chimera of a dormouse and a robin: egg-shaped body, oversized round head, two small rounded ears, big dark eyes with one catchlight, a tiny button nose, rosy cheeks, stubby legs, a fluffy puff of a tail, warm ochre-brown coat with a cream belly patch and moss-green inner ears, sitting upright on its haunches holding one bread crumb in both paws, looking at the viewer, calm and pleased, full body, three-quarter view, centered`

**Scene constant (verbatim in all four):**
`the inside of a cosy burrow looking out through its round entrance, late afternoon sunlight pouring in from the upper left, tree roots and packed-earth walls, a low wooden table with a small heap of bread crumbs, a few dried grasses and a clay bowl, no creatures, no people`

**Identity anchor (do this first, once).** Midjourney reads the same words differently in each style, so pin the creature before styling it:
`character reference sheet of [critter constant], simple flat illustration, neutral grey background, front view and three-quarter view --ar 3:2 --style raw --stylize 50 --v 7 --no text, watermark, logo, signature, humans`
Then add `--oref <anchor image URL> --ow 200` to each critter prompt below. Raise `--ow` toward 300 if the creature drifts, lower it toward 120 if the style stops taking.

| | Critter (`--ar 4:5`) | Scene (`--ar 16:9`) |
|---|---|---|
| **A · Ink & Ember** | `[critter constant], hand-inked brush outlines with slight ink bleed, flat two-tone cel shading, watercolor paper grain, warm earthy palette of ochre, rust and deep teal on parchment, elemental nature motifs, plain parchment background --ar 4:5 --style raw --stylize 150 --v 7 --no text, watermark, logo, signature, humans` | `[scene constant], hand-inked brush outlines with slight ink bleed, flat two-tone cel shading, ink-wash background with visible brush texture, watercolor paper grain, warm ochre and rust light with deep teal shadows, elemental nature motifs --ar 16:9 --stylize 300 --v 7 --no text, watermark, logo, signature, humans` |
| **B · Painted Signal** | `[critter constant], painterly digital illustration with visible brush strokes and hand-painted texture, strong teal rim light and warm gold key light from the upper left, dramatic value contrast, stylized realism, plain dark slate background --ar 4:5 --stylize 200 --v 7 --no text, watermark, logo, signature, humans` | `[scene constant], painterly digital illustration with visible brush strokes and hand-painted texture, an art-deco lantern glowing gold on the table, teal light from the entrance against warm gold, dramatic value contrast, stylized realism, dark slate and iron tones, gritty but warm --ar 16:9 --stylize 350 --v 7 --no text, watermark, logo, signature, humans, weapons` |
| **C · Saturday Morning** | `[critter constant], 1990s animated series cel style, bold uniform dark outlines, flat saturated colors, single hard shadow tone with subtle halftone dots, clean geometric shapes, big glossy eyes with two highlights, plain warm white background --ar 4:5 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans` (anime-flavoured alternative: swap the parameters for `--ar 4:5 --niji 6 --stylize 100`) | `[scene constant], 1990s animated series cel style, bold uniform dark outlines, flat saturated colors, single hard shadow tone with subtle halftone dots, clean geometric shapes, bright warm white light and saturated earth tones --ar 16:9 --stylize 200 --v 7 --no text, watermark, logo, signature, humans` |
| **D · Field Guide** | `[critter constant], naturalist field-guide illustration, soft matte gouache shading with no outlines, felt and clay textures, muted warm palette of oat, honey, moss and clay, gentle daylight from the upper left, calm and precise, plain cream paper background --ar 4:5 --style raw --stylize 150 --v 7 --no text, watermark, logo, signature, humans` | `[scene constant], naturalist field-guide illustration, soft matte gouache shading with no outlines, felt and clay textures, muted warm palette of oat, honey, moss and clay, gentle daylight, calm and precise --ar 16:9 --stylize 250 --v 7 --no text, watermark, logo, signature, humans` |

Reading the results: judge the critter on silhouette clarity at thumbnail size, whether the eyes still read as kind, and whether the line and shading could be reproduced by a toon ramp and an outline pass on primitives. Judge the scene on whether the DOM chrome (Oat or Slate surfaces, the type pairing) could sit on top of it without fighting it.

## 11. Render-target prompts — draw what the engine can draw

Midjourney's default output is far more detailed than primitives with a toon ramp can reproduce. That detail costs nothing at runtime, but a concept that promises fur, brushwork or halftone sets an expectation the app cannot meet, and dense scenery under chrome hurts legibility. So a second pass of the §10 set asks for the **render target**: stylized low-poly, cel-shaded, minimal texture. Judge the directions on these, not on §10.

Rules for this pass: `--style raw`, `--stylize 50–100`, the same critter constant and scene constant as §10, the Omni Reference on critters only, and the texture words removed from the style cores (paper grain, halftone and brush texture become DOM overlays in the app, not critter surfaces).

**Critter suffix** (after the style core, before the parameters):
`, depicted as a stylized low-poly 3D character made of simple rounded primitive shapes, flat two-tone cel shading with one soft shadow, matte materials, no fur, no fine texture, no fine detail, clean readable silhouette at small size, mobile game character render, plain background`

**Scene suffix:**
`, simplified into large clean shapes, limited palette of about six colours, minimal texture, soft flat shading, low detail, designed as a calm background illustration for a mobile app with text over it`

| | Critter (`[critter constant]` + …) | Scene (`[scene constant]` + …) |
|---|---|---|
| **A · Ink & Ember** | `ink-brush outlines, flat two-tone cel shading, warm earthy palette of ochre, rust and deep teal, [critter suffix], plain parchment background --ar 4:5 --style raw --stylize 80 --v 7 --no text, watermark, logo, signature, humans` | `ink-brush outlines, flat two-tone cel shading, warm ochre and rust light with deep teal shadows, [scene suffix] --ar 16:9 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans` |
| **B · Painted Signal** | `smooth painterly toon shading, strong teal rim light and warm gold key light from the upper left, dramatic value contrast, [critter suffix], plain dark slate background --ar 4:5 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans` | `smooth painterly toon shading, a small art-deco lantern glowing gold on the table, teal light from the entrance against warm gold, dark slate and iron tones, [scene suffix] --ar 16:9 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans, weapons` |
| **C · Saturday Morning** | `bold uniform dark outlines, flat saturated colors, single hard shadow tone, big glossy eyes with two highlights, [critter suffix], plain warm white background --ar 4:5 --style raw --stylize 60 --v 7 --no text, watermark, logo, signature, humans` | `bold uniform dark outlines, flat saturated colors, single hard shadow tone, bright warm white light and saturated earth tones, [scene suffix] --ar 16:9 --style raw --stylize 80 --v 7 --no text, watermark, logo, signature, humans` |
| **D · Field Guide** | `soft matte gouache shading with no outlines, matte clay materials, muted warm palette of oat, honey, moss and clay, gentle daylight from the upper left, [critter suffix], plain cream paper background --ar 4:5 --style raw --stylize 80 --v 7 --no text, watermark, logo, signature, humans` | `soft matte gouache shading with no outlines, matte clay materials, muted warm palette of oat, honey, moss and clay, gentle daylight, [scene suffix] --ar 16:9 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans` |

What the engine can and cannot reproduce, for reading the results:

| Concept feature | In the app | Cost |
|---|---|---|
| Simple rounded shapes, flat two-tone shading | Primitives + `MeshToonMaterial` ramp | Free |
| A uniform outline | Inverted-hull pass | One extra draw call per critter, counted in the budget |
| A rim light | Fresnel term in the material | Cheap shader chunk |
| Fur, brush texture, paper grain, halftone on the critter | Not reproducible without textures or post-processing | Out of budget — keep these to DOM overlays |
| Detailed scenery behind the grid | Not allowed — the stage needs a flat ground | — |
| A scene as the arrival illustration | One WebP ≤ 120 KB | Free at runtime; legibility is the constraint |

## 12. Spirit critters — the direction after the first generations (2026-09-02)

**What the generations settled.** The scenes converged on Direction A with more teal: ink-brush line, flat colour, warm ochre light against teal-blue shadow, oxblood and rust trees, cream stone, a round entrance. The "inside looking out through the round opening" composition is the arrival screen. Palette pulled from the favourites (approximate):

| Name | Value | From |
|---|---|---|
| Stone cream | `#E8DCC4` | Burrow walls, the ground |
| Sunlit sand | `#F1E2B8` | Lit floor |
| Ochre grass | `#D9A441` | Grass, crumbs, warm accents |
| Rust | `#C8622A` | Tree bark in sun |
| Oxblood | `#7A3B3A` | Tree bark in shadow |
| Teal shadow | `#4A6B7C` | Cast shadow, interiors |
| Deep teal | `#2E4F5C` | The entrance's dark |
| Sky | `#8FC6D8` | Through the opening |
| Ink | `#2B2622` | Every line |

**What the critter got wrong.** The favourite critter is a hamster: fur, pink paws, real anatomy. The request is spirit and element — Avatar's spirit-world creatures, Pokémon's colour identity, Arcane's luminous accents, X-Men '97's flat confident shapes — while staying charming, not childish.

### What makes a critter read as a spirit rather than an animal

| Animal | Spirit |
|---|---|
| Fur, whiskers, claws, skin-pink paws | Smooth soft surfaces, matte like river stone or felt; no fur anywhere |
| Natural colours | An elemental colour identity: jade, ember, deep teal, pale sky — one per critter |
| Anatomy that could exist | One impossible feature: a sprout, a flame tuft, a droplet crest, cloud-puff ears |
| Standing on the ground | Hovering a hand's width above it (the shadow blob still sits beneath) |
| Eyes with animal lids | Very large dark glossy eyes with one bright catchlight; a tiny calm smile |
| No light of its own | Faint luminous markings (cheeks, belly, the tip of the tail) |

### The element hook

Each critter has one of four affinities drawn from its seed — **earth, water, fire, air** — which sets its hue band, its ear and crest and tail shapes, and its glow colour. It is purely visual identity, never a mechanic: nothing in the app treats elements differently, the same way Pokémon's colour tells you who a creature is before anything else does.

| Element | Hue band | Ears | Crest | Tail | Glow | Motif |
|---|---|---|---|---|---|---|
| Earth | jade 130–160°, ochre 60–80° | Leaf | Sprout | Short wisp | Pale gold | Moss patches, pebble paws |
| Water | teal 180–210° | Fin | Droplet | Tadpole wisp | Pale aqua | Dew spots |
| Fire | rust 20–40°, ember 40–55° | Flame tufts | Ember flick | Ember-tipped wisp | Ember orange | Warm belly gradient |
| Air | cream 70–90° at high L, sky 200–220° | Cloud puffs | None | Long trailing wisp | Pale blue | Hovers higher |

Generator implication (proposal, not yet in the Design System): one extra draw, `element`, from the seed; ear/crest/tail types drawn from the element's set instead of the global set; hue snapped to the element's bands; a small emissive part for the glow. In 3D the glow is an emissive colour on a small primitive plus a soft additive sprite — no bloom, so the "no post-processing" rule holds; hovering removes the leg primitives, which is cheaper than today; the wisp tail is a short chain of tapered capsules.

### Style core — the balance of the four

`ink-brush outlines with slight bleed (Avatar), flat cel shading with one hard shadow (X-Men '97), a gentle luminous glow on the elemental markings (Arcane), simple appealing rounded shapes with a clear colour identity (Pokémon), whimsical spirit-creature design, smooth soft surfaces with no fur`

Render-target suffix for spirits: `, depicted as a stylized low-poly 3D character made of simple rounded primitive shapes, flat two-tone cel shading with one hard shadow, matte materials with a faint emissive glow on the markings only, no fur, no fine texture, no fine detail, clean readable silhouette at small size, mobile game character render, plain background`

### Prompts

**Spirit anchor (earth; make this first, then `--oref` it):**
`a small round burrow spirit, a whimsical elemental creature and not a real animal: smooth egg-shaped body with no fur, an oversized round head, two leaf-shaped ears, very large dark glossy eyes with one bright catchlight, a tiny calm smile, softly glowing pale-gold markings on its cheeks and belly, a little green sprout on top of its head, stubby rounded paws holding one bread crumb, a short wisp of a tail, hovering a hand's width above the ground with a soft shadow beneath, jade-green head fading into a warm ochre body with a cream belly, calm and kind, full body, three-quarter view, centered, [style core], [render-target suffix], plain parchment background --ar 4:5 --style raw --stylize 80 --v 7 --no text, watermark, logo, signature, humans, fur`

**Water:** replace the features with `two fin-shaped ears, a single droplet-shaped crest on its head, a tadpole-like wisp of a tail, dew-spot markings glowing pale aqua, deep teal body with a pale aqua belly`

**Fire:** `two small flame-tuft ears, an ember flick on its head, a wisp of a tail tipped with an ember glow, warm rust body fading to ochre with an ember-orange glow on the belly markings`

**Air:** `two cloud-puff ears, no crest, a long trailing wisp of a tail, pale cream body with a soft sky-blue belly and faint pale-blue glowing markings, hovering higher than the others`

**Family sheet (all four together, no reference needed):**
`four small round burrow spirits in a row on a parchment ground, whimsical elemental creatures and not real animals, each with smooth fur-less bodies, oversized round heads, very large dark glossy eyes with one catchlight and tiny calm smiles: an earth spirit in jade and ochre with leaf ears and a sprout, a water spirit in deep teal with fin ears and a droplet crest, a fire spirit in rust and ember with flame-tuft ears, an air spirit in cream and sky blue with cloud-puff ears and a long trailing tail, all hovering slightly with soft shadows beneath, each holding one bread crumb, [style core], [render-target suffix] --ar 16:9 --style raw --stylize 80 --v 7 --no text, watermark, logo, signature, humans, fur`

### Decision this implies

Lock the world to the scenes (Direction A with the teal from the favourites), adopt the spirit language for critters, and carry the four elements into the generator as a visual identity. If confirmed: Design System tokens move to the §12 palette, §5 gains the `element` draw and the element part sets, §4 gains an emissive glow rule, and the design-system page is re-skinned.

## 13. Honing the spirits — Avatar, Arcane, X-Men '97; Pokémon dropped (2026-09-02)

**Why the first spirits read as generic.** (1) They were rendered soft and airbrushed while the scenes are ink line and flat colour, so they do not belong to the same world. (2) They follow the mascot formula: perfect symmetry, eyes at 40 % of the face, glossy, centred, holding a cookie, hovering with a belly glow. (3) Nature was applied as a costume (leaf ears on a generic body) rather than as anatomy. Pokémon is removed from the reference mix because it pulls toward this formula.

### The rules

| Rule | Instead of | Do |
|---|---|---|
| Same treatment as the scenes | Airbrushed softness | Ink outlines of varying weight, flat colour blocking, hard-edged cel shadow shapes with subtle hatching, painterly texture only inside the shadows (Avatar's line, Arcane's shadow shapes and texture, X-Men '97's flat blocking) |
| Eyes with character | Glossy orbs, two highlights | Almond eyes with a heavy upper lid and one small hard highlight; a mouth line rather than a smile |
| Structure from a real animal | A round blob with features attached | A named animal skeleton (badger, otter, fox, owl), kept small and rounded, then infused |
| Nature as anatomy, subtly | Leaf ears stuck on | One plant or stone element that *replaces* a body part: moss as brows, a mane of dry leaves, lily pads as ears, dandelion fluff as a mantle, roots as a beard. One per critter, never a garden |
| Grounded in the world | Hovering on a gradient | Sitting on a root, crouched by a puddle, standing on a warm stone, perched on a root tip — at the burrow |
| Age | Baby mascot | Weathered and wise; asymmetry; a lichen patch, a notched ear, a worn paw |
| Light | A belly glow | One faint luminous point per critter (chest ember, throat, brow, eyes), no more |
| The elements remain the identity | Candy colours | Materials: moss and bark (earth), shaded-pool teal and river stone (water), autumn leaf and ash (fire), seed fluff and grass (air) |

**Technical lever.** Every critter prompt takes the favourite *scene* image as a Style Reference (`--sref <scene URL> --sw 300`), which forces the scene's rendering onto the creature. Low `--stylize` (60–80), `--style raw`, and a negative list that names the mascot look. The render-target suffix is not needed here — ink line and flat cel are already what a toon ramp and an outline pass produce; add it back only if outputs drift painterly.

**Style core:** `in the style of a hand-drawn 2D animated series: confident ink outlines of varying weight with slight brush bleed, flat colour blocking with hard-edged cel shadow shapes, subtle hatching inside the shadows, painterly texture only within the shadow shapes, a single warm key light from the upper left with a cool teal rim, muted natural palette of ochre, rust, oxblood, cream stone and teal shadow, folkloric spirit-creature design, weathered and wise rather than cute`

**Negative list:** `--no cute, kawaii, chibi, plush, glossy, toy, mascot, fur, text, watermark, logo, signature, humans`

### Prompts

Earth:
`a small round badger-like burrow spirit sitting low on a gnarled tree root at a stone burrow entrance, moss growing along its brow like eyebrows, two ears shaped like young oak leaves, a patch of lichen on one shoulder, a birch-bark-pale belly with a few dark dashes, stubby paws with one resting on a stone, a single faint amber glow in its chest like an ember under ash, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, three-quarter view, [style core] --sref <scene URL> --sw 300 --ar 4:5 --style raw --stylize 60 --v 7 [negative list]`

Water:
`a small round otter-like burrow spirit crouched at the edge of a shallow puddle on a burrow's stone floor, reed-like whiskers, ears shaped like lily pads, a tail that ends in a curl of river water, skin the deep teal of a shaded pool with a pale river-stone belly, a single faint aqua glow at its throat, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, three-quarter view, [style core] --sref <scene URL> --sw 300 --ar 4:5 --style raw --stylize 60 --v 7 [negative list]`

Fire:
`a small round fox-like burrow spirit standing on a sun-warmed stone by a burrow entrance, a mane of dry autumn leaves that smoulder faintly at the tips, ears like charred bark, ash-grey paws, a rust and ochre coat, a single faint ember glow between its brows, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, three-quarter view, [style core] --sref <scene URL> --sw 300 --ar 4:5 --style raw --stylize 60 --v 7 [negative list]`

Air:
`a small round owl-like burrow spirit perched on the tip of a root, leaning into the wind, a mantle of dandelion seed fluff around its shoulders, ears like tufts of feathered grass, long grass blades where feathers would be, a pale cream body with faint sky-blue markings, the faintest pale glow in its eyes, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, three-quarter view, [style core] --sref <scene URL> --sw 300 --ar 4:5 --style raw --stylize 60 --v 7 [negative list]`

The four at the burrow (replaces the generic family row):
`four small round burrow spirits gathered at the stone entrance of a burrow beneath the roots of one old rust-barked tree in late afternoon: a badger-like earth spirit with moss brows and oak-leaf ears sitting on a root, an otter-like water spirit with lily-pad ears crouched by a puddle, a fox-like fire spirit with a mane of smouldering autumn leaves on a warm stone, an owl-like air spirit with a dandelion-fluff mantle perched on a root tip, each holding one bread crumb, a low wooden table with a heap of crumbs behind them, [style core] --sref <scene URL> --sw 300 --ar 16:9 --style raw --stylize 80 --v 7 [negative list]`

### The scenery they live in

Proposal, from the favourites: **a stone-mouthed burrow beneath the roots of one old rust-barked tree at the edge of a dry ochre meadow, in autumn** — the palette of §12 comes from exactly this. Each element has a place at the entrance: a root (earth), a puddle in the stone floor (water), a sun-warmed stone (fire), a root tip in the wind (air). In the app, only the arrival illustration and empty states show scenery (the stage ground stays flat); the four spots become the arrival image's composition and, later, the four props the 2D portraits can sit on.

Establishing shot:
`a stone-mouthed burrow beneath the roots of one old rust-barked tree at the edge of a dry ochre meadow in autumn, cream stone, dry grass, teal-blue shadows, late afternoon light from the upper left, a few drifting seeds in the air, a faint warm glow from inside the entrance, a low wooden table with a heap of bread crumbs, no creatures, [style core] --sref <scene URL> --sw 200 --ar 16:9 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans`

Once a critter lands, use it as `--oref` for its expression sheet (§3 prompt 2) and keep `--sref` on everything from then on.

## 14. The element animals and the reference style (2026-09-02)

**Animals, chosen:** water = turtle, fire = phoenix, earth = hedgehog, air = flying lemur. Each stays small and rounded, infused with one nature element as anatomy (§13), rendered in the world's palette.

**Reference style, described for prompts** (from the supplied painting of a figure eating fruit in a tree): a visible pencil-and-ink underdrawing left in place, painterly colour blocked over it with soft gradients and crisp form edges, hard-edged cel shadow shapes with textured brush strokes inside them, a warm sunlit key light from the upper left and a cool sky-blue fill, saturated natural colours, big green leaves against a clear sky.

**Fused style core:** `painted in the loose, confident style of animated-feature concept art: a visible pencil-and-ink underdrawing left in place, painterly colour blocked over it with soft gradients and crisp form edges, hard-edged cel shadow shapes with textured brush strokes inside them, a warm sunlit key light from the upper left and a cool sky-blue fill, saturated natural colours, ink outlines of varying weight, folkloric spirit-creature design in the tradition of hand-drawn animated series, weathered and wise rather than cute`

Prompts (complete, no placeholders) — critters `--ar 4:5 --style raw --stylize 80 --v 7`, group and scene `--ar 16:9`:

- **Earth · hedgehog:** a small round hedgehog-like burrow spirit sitting low on a gnarled tree root at a stone burrow entrance, its quills are dry pine needles and young oak leaves growing from its back, moss along its brow like eyebrows, a patch of lichen on one shoulder, a birch-bark-pale belly with a few dark dashes, stubby paws with one resting on a stone, a single faint amber glow in its chest like an ember under ash, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, painterly suggestion of texture rather than rendered fur, three-quarter view, [style core]
- **Water · turtle:** a small round turtle-like burrow spirit crouched at the edge of a shallow puddle on a burrow's stone floor, a shell of smooth river stones with moss growing along its rim and a faint ripple pattern, a small fin-like crest on its head, skin the deep teal of a shaded pool with pale river-stone belly plates, a tiny drop of water on its nose, a single faint aqua glow at its throat, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, three-quarter view, [style core]
- **Fire · phoenix:** a small plump phoenix-like burrow spirit standing on a sun-warmed stone by a burrow entrance, compact and round like a fledgling but weathered and wise, plumage of dry autumn leaves in rust, ochre and ash-grey, a crest of feathers that smoulder faintly at the tips, three long tail feathers ending in soft ember glows, charred-bark texture on its wing edges, a single faint ember glow at its breast, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm beak line, asymmetric details, three-quarter view, [style core]
- **Air · flying lemur:** a small round flying-lemur-like burrow spirit perched on the tip of a root, leaning into the wind with its wing membranes half open, the membranes translucent like sycamore seed wings, a mantle of dandelion seed fluff around its shoulders, large ears like tufts of feathered grass, a long ringed tail ending in a wisp, a pale cream body with faint sky-blue markings, the faintest pale glow in its eyes, expressive almond-shaped eyes with heavy upper lids and one small hard highlight, a calm mouth line, asymmetric details, painterly suggestion of texture rather than rendered fur, three-quarter view, [style core]
- **The four at the burrow:** four small round burrow spirits gathered at the stone entrance of a burrow beneath the roots of one old rust-barked tree in late afternoon, big green leaves overhead against a clear blue sky: a hedgehog-like earth spirit with quills of pine needles and oak leaves sitting on a root, a turtle-like water spirit with a shell of mossy river stones crouched by a puddle, a plump phoenix-like fire spirit with plumage of smouldering autumn leaves on a warm stone, a flying-lemur-like air spirit with sycamore-seed wings and a dandelion-fluff mantle perched on a root tip, each holding one bread crumb, a low wooden table with a heap of crumbs behind them, [style core]
- **Scenery:** a stone-mouthed burrow beneath the roots of one old rust-barked tree at the edge of a dry ochre meadow in autumn, big green leaves overhead against a clear sunlit blue sky, cream stone, dry grass, teal-blue shadows, late afternoon light from the upper left, a few drifting seeds in the air, a faint warm glow from inside the entrance, a low wooden table with a heap of bread crumbs, no creatures, no people, [style core with "environment concept art for a hand-drawn animated series" in place of the creature clause]

Negative list for creatures: `--no cute, kawaii, chibi, plush, glossy, toy, mascot, text, watermark, logo, signature, humans`; for scenery: `--no text, watermark, logo, signature, humans`.

## 15. The locked set (2026-09-02)

The three favourite scenes fix the world's rendering: ink outlines of varying weight, dense pen hatching in the shadows on bark and stone, flat colour blocking with hard-edged cel shadow shapes, a sunlit cream ground with cool blue-teal cast shadows, a clear blue sky, rustic wood and clay. Fused with the painted character reference (visible pencil underdrawing, painterly block-in with soft gradients and crisp form edges). Three settings survive as the burrow across its year: the dry-season entrance, the entrance in snow, and the interior looking out through the round stone window (the arrival screen).

**Creature style tail:** `illustrated like a background painting from a hand-drawn animated series fused with loose concept-art painting: confident ink outlines of varying weight, dense pen hatching in the shadows on bark and stone, flat colour blocking with hard-edged cel shadow shapes, a visible pencil underdrawing left in place beneath painterly colour with soft gradients and crisp form edges, a warm sunlit key light from the upper left, a sunlit cream ground with cool blue-teal cast shadows, saturated natural colours, folkloric spirit-creature design, weathered and wise rather than cute --ar 4:5 --style raw --stylize 80 --v 7 --no cute, kawaii, chibi, plush, glossy, toy, mascot, text, watermark, logo, signature, humans`

**Scene style tail:** `illustrated like a background painting from a hand-drawn animated series: confident ink outlines of varying weight, dense pen hatching in the shadows on bark and stone, flat colour blocking with hard-edged cel shadow shapes, a visible pencil underdrawing left in place beneath the colour, a warm sunlit key light from the upper left, a sunlit cream ground with cool blue-teal cast shadows, a clear blue sky, saturated natural colours, environment art, no creatures, no people --ar 16:9 --style raw --stylize 100 --v 7 --no text, watermark, logo, signature, humans, creatures`

| Prompt | Subject |
|---|---|
| Earth · hedgehog | sitting low on a pale gnarled root beside the cream stone mouth of a burrow beneath an old tan-barked tree in a dry landscape, tufts of dry grass, a clear blue sky; quills of dry pine needles and young oak leaves; moss brows; lichen patch; birch-pale belly with dark dashes; one paw on a stone; faint amber chest glow |
| Water · turtle | crouched at a small puddle on the sunlit floor inside the burrow, dark blue-teal roots overhead, the round stone window and blue sky behind, patches of green grass; shell of mossy river stones with a ripple pattern; fin-like crest; shaded-pool teal skin, river-stone belly plates; drop of water on its nose; faint aqua throat glow |
| Fire · phoenix | standing on a sun-warmed stone at the mouth of the cream stone cave beneath red-brown trees in fresh snow, straw-yellow grass, pale blue sky; plump fledgling build, weathered; plumage of dry autumn leaves in rust, ochre, ash-grey; smouldering crest tips; three tail feathers ending in ember glows; charred-bark wing edges; faint ember breast glow; snow slightly melted around the stone |
| Air · flying lemur | perched on the tip of a dark root beside the round stone window inside the burrow, leaning toward the blue sky with wing membranes half open, translucent like sycamore seed wings; dandelion-fluff mantle; ears like feathered grass tufts; long ringed tail ending in a wisp; pale cream body with sky-blue markings; faint glow in the eyes |
| The four together | inside the burrow: round stone window with blue sky and white clouds, dark blue-teal roots overhead, sunlit floor with green grass and blue-teal shadows, a low wooden table with an orange cloth and a heap of crumbs, wooden shelves with clay pots; the four spirits on their spots, each holding one crumb |
| Scene: dry-season entrance | cream stone mouth beneath one old tan-barked tree with bare branches, dry pale landscape, dry grass, rustic table with a clay jug and a bowl of crumbs, a small wooden chair, long cool shadows |
| Scene: entrance in snow | cream stone mouth beneath red-brown trees in fresh snow, straw-yellow grass and scattered crumbs before the entrance, a clay pot with dry grasses, a small table with two round loaves, pots and a folded red cloth inside, pale blue sky through bare trees |
| Scene: interior, looking out | the arrival screen: round stone window onto a bright blue sky, dark blue-teal roots overhead, wooden shelves with clay pots, low table with an orange cloth and a heap of crumbs, stone steps up to the window, sunlit floor with green grass |
| Expression sheet | with the chosen critter attached as an Omni Reference: six poses on cream paper — curled up asleep, calm, content, pleased, happy, delighted mid-hop — `--ar 3:2` with the creature style tail |

All eyes: expressive almond shapes with heavy upper lids and one small hard highlight; a calm mouth (or beak) line; asymmetric details; painterly suggestion of texture rather than rendered fur. Full prompt text is in the conversation of 2026-09-02 and follows this table's subjects exactly; regenerate from the table if needed.

**What this locks for the Design System revision:** the world palette of §12 plus the three scenes; ink line + flat cel + hatching as the render style (toon ramp, outline pass, a hatching texture only on DOM illustrations); the four element animals with one nature element as anatomy; the round-window interior as the arrival illustration.

## 16. Correction — back to the spirit design, with the reference painting's surface (2026-09-02)

§13–§15 overshot: naming real animals with "weathered", "folkloric" and "dense pen hatching" produced generic animals in illustration density. The set the user liked (§12's spirits) had the right design and the wrong surface (glossy, airbrushed, floating). Earth is a **large squirrel**, not a hedgehog.

**Surface, from the reference painting:** visible pencil underdrawing with loose sketch lines left in; flat matte colour blocked over the sketch; one hard cel shadow with a little pencil hatching inside it; no gloss, no body highlights; warm sunlight from the upper left; cool blue-teal cast shadow on a sunlit cream ground. Simple shapes with few details so it reads at small size and can be built from primitives with a toon ramp.

**Design, kept from §12:** round simple body, large dark matte eyes with one small highlight, a tiny mouth, nature as anatomy (one specific, inventive fusion per creature), one soft glow point, grounded on a root or stone.

**Shared style clause:** `drawn like animated-film concept art with a visible pencil underdrawing and loose sketch lines left in, flat matte colour blocked over the sketch with one hard cel shadow and a little pencil hatching inside the shadow, no gloss and no highlights on the body, simple shapes with few details so it reads at small size, warm sunlight from the upper left with a cool blue-teal cast shadow on a sunlit cream ground, muted natural colours with one soft glow`

**Parameters:** `--ar 4:5 --style raw --stylize 60 --v 7 --no glossy, shiny, 3d render, plastic, realistic fur, photorealistic, hyperdetailed, cute, chibi, text, watermark, logo, signature, humans`. Attach the reference painting as a Style Reference at ~350 on critters.

| Element | Creature concept (the unique fusion) |
|---|---|
| Earth · large squirrel | Bushy tail is a spray of oak branches with leaves and two acorns; bark-ring markings down the back; a tiny sapling between the ears; moss brows; faint amber chest glow; sitting on a pale root |
| Water · turtle | Shell is a cluster of water-worn river stones with a tiny pool on top reflecting the sky; one reed growing from the shell; fin-shaped ears; shaded-pool teal skin, pale stone belly; drop of water on the nose; faint aqua throat glow; crouched by a puddle |
| Fire · phoenix chick | Feathers are dry autumn leaves in rust and ochre; wing edges glow like embers; three tail feathers trail like drifting sparks; a crown of three smouldering seed pods; ash-grey feet; faint ember breast glow; standing on a warm stone |
| Air · flying lemur | Wing membranes translucent like sycamore seeds with dandelion fluff along the edges; ears like unfurling fern fronds; tail trails off into a wisp of cloud; pale cream with sky-blue markings; faint pale-blue glow in the eyes; perched on a root tip |

Full prompts follow this table with the style clause and parameters; the group prompt places the four inside the round-window burrow with the same clause at `--ar 16:9`.
