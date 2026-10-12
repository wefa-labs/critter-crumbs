# Critter Crumbs — Design Pass, October 2026

**Exploration, not a numbered document** · 2026-10-02 · Reacts to: `02-design-system.md`, `docs/explorations/design-directions.md` §12–§16, PR #31
Companion artifact: *Critter Crumbs Design Pass* — the same three screens (arrival, scattering, feast) at phone width in each direction below, with the type and palette strips, the review and the costs. One control picks the screen; chips pick which directions are shown.

**Current state:** §8 is the brief as it stands, §20 the eleventh pass (your crumb pile in the middle of the circle, crumbs flying both ways, a desktop that scales, on Inked daylight) and §21 its measured state; the review page lives in `docs/explorations/scatter-layouts/`. §22 holds the background prompts and image tools, §23 and §24 the flow page of every other screen and its states (`docs/explorations/app-screens/`), §25 what this review keeps from PR #31, and `docs/explorations/creature-research.md` the creature ideas for discussion. §1–§7 and §9–§19 are the history that led there.

Purpose: record the review of the shipped screens that Afolabi asked for on 2026-10-02 (the interface does not read as a game, carries too much text, and its type reads as the default serif-on-cream look), and set out the directions the companion page compares. The earlier *design settle* page remains the record of PR #31's checkpoint (D14–D18); this pass sits above it.

## 1. The review

Checked against the running local stack at 375 px on 2026-10-02 (arrival, and the scatter screen of a seeded scattering-phase people feast): the first critter sits below the fold, after the brand, three buttons, the status line, the phase chip, three deadline lines, the title, the burrow link, the instruction and the participation line; the heap is 96 px wide beside an 18 px monospace count.

The brief's own words are the yardstick: a tool adults use to move real money, where the play is in the feel of a few small actions and one big moment (Game Design §1), and where the heap is the signature and honey is the only gold (Design System §1, D5). The screens do not yet act on those rules.

| Finding | Severity | What the screens do today | Change |
|---|---|---|---|
| The chrome is a form around a game | High | On the scatter screen at 375 px: brand, three text buttons, status line, phase chip, two deadlines, title, burrow link, instruction, participation and "not yet" come before the first critter. | One bar (where you are, your critter), one pill carrying phase and deadline in the existing `deadline.scattering` string, faces instead of names for who has scattered. |
| The heap is not yet the signature | High | 96 × 56 px beside an 18 px monospace count; the remaining count is smaller than the Disconnect button. | Heap at 132 px or wider, the count at 44 px in the display face with tabular figures, "Scatter these" full width beneath. Card counts become a 24 px numeral between two round controls. |
| The type reads as the default serif-on-cream look | Medium | Young Serif has one weight; titles, names and the feast numbers all sit at 400, with the device sans for everything else. §3.2 made this a one-token choice (DQ1) that was never confirmed. | A face with a weight range and real numerals carrying the whole screen (Playfield), or the inked pairing the art settled on (Ink & Ember). Two tokens change: `--cc-font-display`, `--cc-font-body`. |
| Nothing looks pressable | Medium | Flat dark rectangles, 1 px outlines, a 1 px press nudge; + and − share Settings' shape. | A bottom edge (depth) or a drawn outline with a hard cel shadow; round + and −; the press translates onto the edge. New tokens `--cc-depth`, `--cc-edge`. |
| Hierarchy is flat | Medium | Brand, name, buttons, title and link all between 16 and 28 px at similar weights; cards, dialog, notice and bar share radius, border and surface. | Three sizes per screen (bar 18–20, title 26–30, number 44); one card style for critters; the bar flat on the ground; the pile bar the only raised surface. |
| Statements compete with critters | Low | Each cell shows two lines of a statement under the critter, so the grid reads as paragraphs with pictures. | A "Show statement" control on the card (the copy ID exists), expanding in place. |

What already works and must not be lost: the voice (§10.1) and the vocabulary; generated portraits with expression; 44 px targets, native dialog, live regions, deadlines in the viewer's time zone; honey only on crumbs.

## 2. The directions compared

Every direction keeps: the vocabulary and the copy IDs (the proposed layout drops strings, it adds none); honey and crust only on crumbs, the heap and share bars; every text pair at 4.5 : 1; text in the DOM; the frozen generator (`GEN_VERSION 1`) through the app's portrait renderer; the light theme (D1); no new runtime dependency.

| | Today | Today, re-laid | Playfield | Ink & Ember | Saturday Morning |
|---|---|---|---|---|---|
| Layout | Shipped | Proposed | Proposed | Proposed | Proposed |
| Display · body | Young Serif 400 · device sans | as Today | Rubik 800 · Rubik 500 | Shippori Mincho 700 · Atkinson Hyperlegible | Lilita One · Nunito 600/800 |
| Palette | Shipped tokens | as Today | Shipped tokens; brighter surface and crumb | World palette (explorations §12, PR #31 mapping) | Warm white, ink plum, comic blue action, crumb yellow |
| Shape | 14/22 px radii, 1 px lines, flat | as Today, cards without border | 18/24 px radii, 4 px bottom edge on controls, soft shadow | 10/16 px radii, 1.5 px ink outline, 3 px hard teal shadow | 14/18 px radii, 2.5 px ink outline, 4 px hard shadow |
| Fonts | 1 file, 27 KB | — | 2 files, ≈ 40 KB | 4 files, ≈ 90 KB; D2 relaxed | 3 files, ≈ 70 KB; D2 relaxed |
| Rules under pressure | — | — | None | D14 and D18 of PR #31 answered together | §1 "never cartoon UI", §2 "quiet" |

The proposed layout, screen by screen:

- **Arrival.** The picture full width at the top, the tagline as the only heading, the explainer at body size, one full-width button.
- **Scattering.** A sticky bar: burrow name, your critter. Title row: feast title and one pill, "Scattering closes in 2 days". A row of eight faces, scattered ones marked, the rest dimmed, with the participation count. The instruction as a dismissable line. Two-column cards: stage, name, a "Show statement" control, then − / count / +. The pile bar: the heap large, the count large, "Scatter these" full width, the helper under it.
- **Feast.** Bar, title and "Feast" pill, the total with the summary line, the fed grid with crumb counts, a ranked list with share bars, then the small print: who did not scatter, who can see this, replay and CSV, the fingerprint folded away.

## 3. In order

1. Re-lay the three screens on today's tokens ("Today, re-laid"). No design decision is needed; it removes most of the text.
2. Choose the type: one token pair. Playfield if "game-like" means clarity and weight; Ink & Ember if it means the illustrated world the art converged on.
3. Add depth or line as tokens and apply them to buttons, controls and cards; then the palette (Playfield keeps today's; Ink takes the world palette already costed in PR #31).

Decisions taken from this pass go to `docs/decisions.md`; a chosen direction revises `02-design-system.md` §1, §3, §6.2 and §7.1.

## 4. Second pass — scene layouts (2026-10-02, later the same day)

Companion artifact: *Critter Crumbs Scatter Variants*. Reacts to Afolabi's review of the first pass: two allocations visible at once is too few to compare; critters in cards read as a list and not as one group in one place; the top still spends space; the pile bar earns its space only once the crumbs are all given.

Agreed before building: design for four to eight people; tap gives and holding pours, no dragging; the ring is tried first; the bottom bar holds the heap, the count and the deadline until the heap is empty and then becomes the one action, which the reviewer wants in Title Case ("Scatter These"; §10.1 says sentence case, so a decisions line is needed); palette, style and type stay three independent inputs so options keep being tested, with more palettes in the Arcane, Avatar and X-Men '97 direction; both screens, every state, and the desktop composition.

Four layouts, each with overview, focus, all-scattered and feast states on phone and desktop, all on one scene model (no cards; the critters share one ground):

| Layout | Overview and compare | Focus and read | The fixed tracker |
|---|---|---|---|
| Ring | A ring of one hundred crumbs divided by person in their body colour; slice size is the comparison; the empty arc is what is left; your own critter sleeps in the middle | Tap a critter: it steps into the ring's centre with its statement under the ring | The ring, kept small above the statement |
| Around the table | Everyone around one heap on one piece of ground, each with a pile and a count in front; tap to give, hold to pour | Tap a name: the scene folds into a strip and the critter stands large with its statement | The strip of eight with their piles |
| Lineup | Eight on one ground line with a crumb stack in front of each, a skyline | Tap a name: the lineup shrinks to the top; the critter stands large below it | The compact lineup |
| Ledger | One row per person with a bar, the count and minus and plus; all visible at once | Tap a name: the critter stands large with its statement and a bar-only ledger beneath | The mini ledger |

Inputs on the page: eight palettes (Oat, Stone & Teal, Parchment & Ink, Ochre & Jade, Cel, and three dark ones: Hextech, Night Burrow, Ember & Ash; the dark ones go against D1 and are there to be seen), five styles (Flat, Depth, Inked, Cel, Glow), seven type pairings. Contrast is computed live for every palette. Strings come from `copy.ts` with two reuses: "Critters" as the zoom-out control and "Previous"/"Next" from the read pass.

Still open after this pass: which layout; whether a dark palette is worth moving D1 into v0; the Title Case decision; the exact-number field's place in focus; how the ring and the table grow past eight (a second row or a scroll).

## 5. Third pass — the painted-daylight brief (2026-10-02, evening)

Companion artifact: *Critter Crumbs Painted Daylight*. The second pass was rejected: it changed layouts and colour values, not the art direction, and showed the critters in three places at once (faces row, ring, list). Afolabi then supplied the art direction as a written brief, summarised here and kept verbatim in Appendix A: painted daylight; hand-drawn critters with a loose, tapered sketch line in dark plum (#251C25), never black; three-value soft-cel shading (shadows cool, lights warm); page #F4F2EA, sky #8FAFEC to #D8E4FE, warm neutral #B69993, crumb gold #CAA24F and #F2DD8E; one element accent (fire, earth, water, air, each with a shadow/base/light/soft value) per critter, always with an icon and a label; flat, spacious interface with rounded cards and pill buttons; system sans with bold headings; textures only on critters, crumbs and rough things; motion 140 to 320 ms on cubic-bezier(.2,.8,.2,1); privacy as pods that close while scattering and open together at the reveal; no pressure timers; sentence case. References to borrow one quality from each: Ghibli backgrounds, Wolfwalkers' visible sketch lines, Klaus' soft light, Arcane's brushwork and coloured light (not its palette), Pokémon and Pikmin silhouettes, Avatar's element identity, Neko Atsume and Animal Crossing's calm pacing.

Structure agreed at the same time: header with the burrow name and your critter only; one scene with every critter in it and at least four in view on a phone; each critter with a seed pod, its count once you have given, and a thought bubble; the bubble opens the statement state, where you swipe or arrow between critters and the one you are giving to is unmistakable; a fixed bottom line with the crumbs left that becomes "Scatter these" at zero; no participation count, no faces row, no second list.

Built: two scene compositions (meadow; burrow interior looking out, with your heap on the table), two statement treatments (a rising sheet with a swipeable card per critter; a thought bubble anchored beside the critter), four states (scattering, reading, all scattered, feast with the pods open), phone and desktop. Critters are redrawn from the generator's version 2 draw in the brief's language, with idle breathing, a blink, an ear twitch, a hop and a delighted face when a crumb lands; crumbs arc from the count line into the pod.

Rules this bends, each needing a decisions line if taken: critters stand in a painted scene rather than on a flat ground (Design System §6.3 stage contract); the tokens change wholesale (§3); the participation line and the deadline strip go, with the deadline shown as a day on the count line (§6.2, §7.1); the renderer moves to version 2 (D8). The backdrops are drawn in SVG from the brief's palette and stand in for painted plates at the same composition.

## 6. Fourth pass — the paintings as scenes, four looks (2026-10-02, night)

Companion artifact: *Critter Crumbs Scatter Looks*. Reacts to the review of the third pass: the drawn backdrops did not look good and the project's existing scene paintings should be fused with the art style; a thought bubble on every critter was repetitive; names were hard to read; minus and plus were missing from the scene; the feast title and the closing date belong at the top; and the reviewer wants to keep comparing looks rather than settle on one.

Built on the same locked structure: the three plates the project already has (the entrance by day from `packages/app/public/images/arrival.webp`, and the interior open to the sky and the interior at dusk from the design-settle page) are the scenes, chosen globally; the critters stand on the painted floors, four in a back row at the table and three in front, all seven in view on a phone. Header: burrow name, feast title, closing day, your critter. Per critter: a nameplate above the head with one small speech glyph that opens the statement; below the feet, minus, the pod with its count, plus; tapping the critter still gives one and holding pours. Count line at the bottom only; "Scatter these" at zero. Statement as a swipeable sheet or an anchored bubble; feast with pods open; phone and desktop.

Four looks, each grading the plate and redrawing the critters: Daylight (the written brief: page wash, grain on the fur only), Ink & Ember (Avatar's ink and parchment, a heavier line, hatching in the shadows, teal shade), Dusk glow (Arcane's coloured light on the dusk plate, a rim on every critter; a dark look, against D1), Cel (X-Men '97's thick line, flat two-tone, halftone, each critter in its element colour). Same critters, seed and strings in every look.

Rules bent, each needing a decisions line if taken: the painted scene in place of a flat ground (§6.3); tokens per look (§3); the header's closing day in place of the participation line and the deadline strip (§6.2, §7.1); renderer version 2 (D8); a dark look (D1).

## 7. Fifth pass — three layouts on the floor (2026-10-02, late)

Companion artifact: *Critter Crumbs Scatter Layouts*. Reacts to the review of the fourth pass: four in a row too tight and minus and plus too close; the seed pod confusing; back-row critters not grounded on the plates; the reading panel should be a fixed-height panel with the statement scrolling inside it and the controls pinned; Title Case on the button, reaffirmed; warmer, less saturated colour for Daylight and Ink & Ember; the dark button replaced by a warm one; no "Feast" label; consistent button widths on desktop; one type scale; and the critters still too cartoonish against the attached WEFA reference painting (a figure eating fruit in a tree: visible underdrawing, painterly colour, hard-edged cel shadows with brush strokes inside them).

Agreed before building: explore three layouts equally; build the floor from the existing paintings' flagstones now and write the prompt for a proper top-down plate; move the critters toward the painting ("garden spirit": almond eyes under a heavy lid, calm mouth, smaller head, painterly shading).

Built: Floor (the burrow floor seen from above on a perspective plane cropped from the chosen painting, the wall only along the top, foliage in the corners, three loose rows of two, three and two that recede, scrolling a little), Circle (the same floor with the heap in the middle and everyone around it), Rows (the painting whole, pushed up, three rows of three, two and two on a taller scrolling scene). Never more than three across on a phone; minus and plus 60 px apart with the count between; no pod. Header: burrow, feast title, your critter, and on desktop the closing day. Phone bottom line: count and closing day, "Scatter These" at zero. Desktop bottom bar: count left, a 220 px button right, Results in the same slot at the feast. Reading: a full panel, critter and name fixed at the top with Previous and Next, the statement in a fixed box that scrolls, minus, count and plus pinned at the bottom; on desktop the same as the side panel. Daylight and Ink & Ember warmed, with gold and ember as the one action colour; Dusk glow and Cel kept but off by default. Critters repainted: smaller head on a longer body, almond eyes with a heavy upper lid and one hard highlight, a calm mouth line, a warm-to-cool gradient with a hard-edged cel shadow filled with brush strokes, the sketch line with a fainter pencil line beside it.

The page carries two Midjourney prompts (phone and desktop) for a top-down burrow floor plate in the §16 style clause, to replace the cropped floors.

Decisions this pass needs if taken: Title Case on "Scatter These" (§10.1); the painted scene in place of a flat ground (§6.3); tokens per look (§3); the closing day in place of the participation line and deadline strip (§6.2, §7.1); renderer version 2 (D8).

## 8. The brief as it stands (2026-10-05)

What seven passes of review have settled. Where this summary and Afolabi's own words (Appendices A to D) disagree, Afolabi's words win.

**The page.** A review page, not app code: easy side-by-side comparison of whole looks with few controls. Looks stay comparable; do not settle on one. The direction is Inked daylight (Appendix D, point 3): Daylight's typography, palette and button shape with Ink & Ember's borders; Daylight and Ink & Ember stay beside it. Design for four to ten critters (the council is six to ten), on phone and desktop, in every state (scattering, reading, all given, scattered, feast).

**The screen** (updated 2026-10-05 by the decisions in §10 and §12).

- Header: the burrow name and the feast title, with a profile button at the top right showing your critter's face; on desktop the closing day too.
- One scene holds every critter, yours included, in one circle with one critter in focus at a time. Nothing is shown twice: no faces row, no ring beside a list, no line counting how many members have scattered. Each critter carries its own mark of what you have given it: a tag centred above its head with its name and number (no crumb icon; it never slides off its critter), and a pile of crumbs beside its feet that grows with the amount (proportionally or crumb for crumb; still to choose, §14). A critter you have given nothing shows a muted zero and no pile; its tag keeps the same border.
- Giving: tap any critter to give it a crumb, hold to pour. No dragging. Only the critter in focus can be given less: − and + belong to it, set in from the edges. That a tap gives needs a short first-run hint, to design with the app (Appendix E).
- Moving through the circle: Previous and Next on either side of the bar.
- The dock: the critter in focus (− name and count +) and the bar beneath it are one surface at the bottom, so the scene has more room.
- Your own critter is in the circle so you can read your statement beside the others; it cannot be given crumbs, and its tag says "You".
- Reading a statement: a thought bubble at the right of the focused critter's head opens it. The statement opens at the top of the screen in a taller box of fixed height that scrolls when the text is long, with no position count; the circle does not move, the focused critter stays in view below it, and minus, count and plus stay where they were, with no background behind them; Previous, Next or a swipe moves to the next critter; a tap outside the statement closes it.
- Names: 16 characters at most (decided 2026-10-05). The critter in focus shows its whole name at the largest size that fits; tags show up to ten characters.
- Bottom: the crumbs left in the middle of the bar. At zero the middle becomes the one action, "Scatter These", in Title Case; changing your mind afterwards has to stay simple and intuitive (§10). After scattering the middle is text only. On desktop the middle has a fixed width and Results takes the same slot at the feast. The feast bar carries no "Feast" label.
- Results at the feast: the bar grows into the results card (no separate sheet), the tags go, and the critters huddle together sitting on its top edge, interacting with one another at random.
- Closing day: on the phone, part of the bottom bar's middle under the count; on desktop, in the header.

**The look.**

- Art direction: Appendix A, with the WEFA reference painting Afolabi attached on 2026-10-02 (`.scratch/design-review/reference/wefa-reference-painting.jpg`; the same painting `design-directions.md` §14 describes) as the anchor for surface: a visible pencil-and-ink underdrawing, painterly colour, hard-edged cel shadows with brush strokes inside them.
- Colour: warm and calm, from Daylight's palette (Appendix D). Pass four read as too strong and too vibrant. The primary action is a warm colour from the palette, not the dark ink.
- Type: Daylight's (system sans, bold headings), one scale on every screen (12, 14, 16, 20 and 28 px). The first complaint was type that reads as a default AI choice.
- Shape: Ink & Ember's borders (an ink outline and a hard offset shadow) with Daylight's pill buttons.
- Scenes: the project's own paintings (`docs/pitch/assets/scene-*.webp`), not backdrops drawn for the page. Afolabi wants a game-like space: mostly floor, with walls and foliage only at the top and in the corners. A floor plate painted for that view does not exist yet; the prompts for one are at the foot of the page.
- Critters: generated from primitives, never stored art. Pass five was "getting there" but "still a little too cartoonish" against the reference painting. Eyes: big round dark eyes (decided 2026-10-05), as in Appendix A and `design-directions.md` §16. Colour: each critter's element as an accent on its markings and features, the body kept calm (chosen 2026-10-05).

**Later words that override Appendix A:** the seed pod is out (Afolabi found it confusing); "Scatter These" is Title Case although the brief says sentence case; rounded cards are for panels, not for critters.

**Departures from the specs that the mock-up keeps.** Recorded in `docs/decisions.md` on 2026-10-05: Title Case on one button (Design System §10.1); a painted scene in place of the flat ground (§6.3); the closing day in place of the participation line and the deadline strip (§6.2, §7.1); round eyes; names of 16 characters at most (Design System §5.5 and the 80-character validators). Still needing a line before they reach the app: the Inked daylight tokens (§3); its gold primary button, which breaks D3 and §1 (honey is reserved for crumbs, never a button colour); "You" as a new string in `copy.ts`; the circle with one in focus in place of the critter grid (§6.2, §6.3); the version 2 critter draw (D8, and PR #31's DQ5 on when); a dark look, if Dusk glow is ever chosen (D1).

**Open, for Afolabi** (as of 2026-10-05, after pass eight):

1. Confirming Inked daylight for the app (§12), and whether its gold button stays against D3.
2. Pass ten itself (§18), on top of passes eight and nine (§14, §16): the dock and the results it grows into, the piles, centred tags, the taller statement, the critters at play.
3. Proportional or exact piles (§14).
4. The floor plate, which only Afolabi can generate.

To design with the app: a short first-run hint that a tap on a critter gives a crumb (Appendix E; `scatter.instruction` already reads "Tap to give a crumb. Hold to pour.").

Resolved on 2026-10-05: the eyes (big round dark eyes); per-critter − and + (replaced by − and + on the critter in focus); the feast summary stays, since the PRD requires telling the burrow who did not scatter; names stop at 16 characters; the profile button shows your critter's face.

## 9. Pass five as measured (2026-10-05)

The page moved into the repository unchanged from its published state: `docs/explorations/scatter-layouts/` (see its README for how to run and drive it). Measured there in the Daylight look and the Window scene, frames at scale 1, by reading element rectangles in the page: each critter's nameplate, minus, count badge and plus (`.spot .nm`, `.mini`, `.badge`) against the same controls of every other critter, against the middle of every other critter's figure, and against the scene's left and right edges. Screenshots could not be taken (the preview pane was not rendering frames), so anything that needs an eye is marked unverified. The copy in the repository serves correctly: the page, its module, the three linked paintings and the floor crops for all three scenes load over HTTP.

**Fails**

| Where | What | Measured |
|---|---|---|
| Phone, Floor | Controls collide and clip | 2 controls cut by the frame edge, 2 overlapping pairs (one critter's plus on the next critter's minus) |
| Phone, Circle | Same, worse | 2 cut by the edge, 7 overlapping pairs, 2 controls lying over a neighbour's figure |
| Phone, Rows | Controls collide | 4 overlapping pairs, including the rows of two (centres 120 px apart, control row about 130 px wide) |
| Desktop, Circle | Nameplates over neighbours' controls | 4 overlapping pairs |
| Every layout | Touch targets under 44 px | per-critter minus and plus are 32 px; the nameplate is 22 px tall |
| Phone, reading | Statement box is not a fixed height | it sizes to its text (74 to 148 px across the seed), leaves a gap above the pinned controls, and never scrolls |
| Phone, reading | The panel covers the header | burrow name, feast title and your critter disappear while reading |
| Desktop, all scattered | The closing day shows twice | it reappears in the bottom bar beside the header copy (a CSS specificity slip) |
| Desktop, feast | The summary shows twice | in the header and in the bottom bar |
| Every screen | The sample closing time comes from the clock | "now plus two days", so it changes on every load |

Why the phone rows cannot simply be nudged: three across at 375 px leaves 125 px per critter, and minus, count and plus at 44 px targets need about 150 px. Two across fits (187 px each) only when the pair is spread to the quarter points; the current pairs sit 120 px apart. The arrangement has to change: fewer across, controls placed around the figure and not in a row beneath it, or one shared control for the selected critter.

**Passes**

- Desktop Floor and Rows: no overlaps, nothing clipped, all seven in view.
- Phone: at least four figures in view without scrolling in every layout (5, 7 and 5).
- Phone, all scattered: the bottom line is only the button, full width, reading "Scatter These". Desktop: the button is 220 px in the same slot for "Scatter These" and Results. No "Feast" label. No minus or plus at the feast.
- Reading: minus and plus are 52 px, pinned, and giving through them updates the count and the crumbs left. On desktop the statement box is a fixed 332 px.
- Type: only 12, 14, 16, 20 and 28 px are in use. Text contrast in Daylight and Ink & Ember is 4.87 : 1 or better on the pairs checked (ink and muted text on the page and on the soft panel, button text on the action colour).
- `eslint docs/explorations/scatter-layouts` is clean.

**Unverified**

- Swipe between statements, and the smooth scroll behind Previous and Next on the phone: the checks ran without rendered frames, where scroll events do not fire.
- How the Floor and Circle floors look. They are mirrored crops of the paintings' flagstones laid on a perspective plane; in the pass-five screenshots they looked blurred and patchy (the Window crop repeats the orange cushion). A stopgap until a painted floor plate exists.
- Rows on the phone after the last change (three, two, two on a taller scrolling scene). The painting is cropped to a narrow vertical slice there, mostly tree trunk.
- The critters at full size against the reference painting.

**Strings on the page that are not in `copy.ts`:** "Scatter These" (the Title Case form), "crumbs" under the count in the reading panel, the "2 of 7" position, and both closing-day forms ("Closes Wed 7 Oct", "Scattering closes Wednesday 7 October at 03:41"; `copy.ts` has a relative form and `deadline.absolute`).

## 10. Sixth pass — the circle with one in focus (2026-10-05, evening)

Companion artifact: *Critter Crumbs Scatter Layouts*, published again as a new artifact on 2026-10-05 because the earlier link could not be found. Pass five was not reviewed layout by layout. Instead, §9's finding that three critters across cannot each carry 44 px controls led Afolabi to a new interaction (Appendix C). Decided before building: big round dark eyes; one more mock-up pass before any app work; the look stays open.

The model, from Appendix C: the bottom bar shows the crumbs left in the middle, with Previous and Next on either side; the critters stand in a circle with one in focus; the critter in focus shows − and +; the others still show what they have been given and still take crumbs when tapped or held, but cannot be given less unless in focus; a critter given nothing is clearly marked, not only by its zero; your own critter is in the circle so you can compare your statement with the others.

Proposed by Claude and chosen by Afolabi:

- **Readjusting after every crumb is given.** ‹ and › never move; only the middle of the bar changes. At zero it becomes "Scatter These". The focused critter's − always works, and with no crumbs left a tap turns the circle to the tapped critter instead of giving, with `scatter.none.left` ("No crumbs left. Take some back to move them."). After scattering, the middle reads `scatter.done.title` with `scatter.done.body`; any change brings "Scatter These" back, and returning to the scattered split shows "Scattered." again.
- **The statement as a panel that stays open.** The circle shrinks to an arc at the top, the statement scrolls in a box of fixed height, − count + stay where they were, and ‹ › step through with the panel open. On desktop the panel is always open beside the circle.
- **The circle turns.** The critter in focus comes round to the front. A tap on any other critter gives without turning, so nothing moves under the thumb.
- **Element accents** on markings and features, the body kept calm.

Built:

- One circle on the floor (pass five's cropped-floor stage) with the heap in the middle. The critter in focus stands forward at the front; the rest stand on an ellipse whose places turn with ‹, ›, a swipe across the floor, a name tag or the arrow keys.
- Name tags with name and count. A critter given nothing shows a hollow crumb and 0 and has nothing at its feet; a fed critter has a small pile that grows with the amount. Each tag sits at the feet, above the head or beside the critter facing the middle, whichever covers least of the others, worked out from where the critters will stand once the circle stops. Tags are compact above eight critters on the phone.
- Your critter in the circle, asleep (`scatter.own.body`) and tagged `scatter.own.label`; tapping it turns it into focus without − and +.
- The critter in focus: − and + (52 px) with its name, which opens the statement, and its count, pinned above the bar.
- The bar: ‹ (48 px), the middle, › (48 px). The middle holds the crumbs left with `deadline.scattering` beneath (on desktop the closing day is in the header instead), then "Scatter These", then "Scattered." with the closing day, and Results at the feast.
- The feast: everyone grown by what they received, totals on the tags; Results opens the ranked list with the summary and who did not scatter.
- Critters: big round dark matte eyes with one small highlight; a rounder head set into the body; slightly oversized paws; a soft glow point; each critter's own colour softened toward the look's cream, lights warm and shadows cool; element accents on markings, ears, crest and tail.
- Page controls: State (Scattering, Reading, All given, Scattered, Feast), Critters (4, 6, 8, 10; the council is six to ten), Scene, Device, Looks. The Layout control is gone; pass five is kept outside git at `.scratch/design-review/pass-5/` and in the artifact's history.
- Fixed from §9: the sample closing time is fixed (Wed 7 Oct, 18:00 PDT) instead of "now plus two days"; the statement box is a fixed height and scrolls; the header stays while reading; the closing day and the feast summary each show once.

Strings not in `copy.ts`: only "Scatter These", the Title Case form. Everything else on the frames comes from existing copy IDs.

## 11. Pass six as measured (2026-10-05)

Measured in the review page at true size (phone 375 × 812, desktop 1280 × 800), in Daylight and Ink & Ember on the Window scene, by reading element rectangles: every tag against every other tag and every other critter's drawn figure; every figure against the others and the scene's edges; the focus row's buttons against the circle's figures and tags; the panel against the arc; and every button's size. With the preview pane hidden, CSS transitions do not advance, so the turning checks switched transitions off for the measurement only.

| Check | Result |
|---|---|
| Scattering, reading and all given; 4, 6, 8 and 10 critters; phone and desktop; each critter in focus in turn | No overlaps, nothing clipped |
| Feast, the same | Four small touches on the phone where the biggest receivers grow (76–163 px², a tag's corner on an ear) |
| Targets | − and + 52 px; ‹ and › 48 px; the name in focus 44 px tall; tags 30 px (26 px compact) with a 44 px hit area |
| Reading | The statement box is a fixed 333 px on the phone for every critter; Moss's 608 px statement scrolls inside it |
| Behaviour | Tap gives; hold pours; − works on the critter in focus; at zero "Scatter These" appears and + is disabled; a tap with none left turns to that critter and shows `scatter.none.left`; "Scatter These" leads to "Scattered."; − brings the count back; giving elsewhere brings "Scatter These" back; returning to the scattered split shows "Scattered."; your critter focuses without − and +; ‹ and › step with the panel open; a swipe across the floor turns the circle |
| Console and lint | No errors; `eslint docs/explorations/scatter-layouts` clean |

Unverified: how the turn looks in motion, since frames were not rendering during the checks; the floor crops, still pass five's stopgap; the critters at full size against the reference painting.

## 12. Seventh pass — the thought bubble and Inked daylight (2026-10-05, late)

Companion artifact: *Critter Crumbs Scatter Layouts*, version 2 of the link published for pass six. Reacts to Afolabi's review of pass six (Appendix D: "This is starting to look pretty good"), ten points. Asked before building, with the recommended answer taken each time: names stop at 16 characters; the profile button shows your critter's face; and points 2 and 4 read together as a thought bubble beside the head that opens the statement at the top.

Built:

- **Inked daylight**, a new look shown first: Daylight's tokens (palette, system sans with bold headings, pill buttons) with Ink & Ember's 1.5 px ink outline, its hard teal offset shadow and its heavier critter line with hatching. Daylight and Ink & Ember stay beside it; Dusk glow and Cel are still there, off. Its gold primary button is Daylight's and still breaks D3.
- **Profile button**: a 44 px round button at the top right of the header with your critter's face, cropped to the head; on desktop it sits after the closing day.
- **The thought bubble**: a small thought cloud with three dots at the right of the focused critter's head (mirrored to the left when the right is crowded). It opens the statement as a bubble-shaped panel at the top of the scene, 312 px tall, the text scrolling inside, with a trail of three bubbles from the head up to it. The circle does not move: the panel covers the back of the circle, tags under it are hidden, and the focused critter and the front of the circle stay in view. ‹ and › step through with it open. The name in focus is no longer a button; the bubble is the one way in. On desktop the statement stays open beside the circle, so there is no bubble.
- **No background behind − and +** when the statement is open; the focus row keeps the same light fade as in the circle.
- **− and + set in**: 56 px from the edges instead of 40, leaving 143 px for the name in focus.
- **Names**: 16 characters at most; a longer ENS name is cut with an ellipsis. The name in focus takes the largest size on the type scale that fits (20, 16 or 14 px): measured, typical 16-character names need 150 px at 16 px and 133 px at 14 px, so they show at 14. Tags show up to ten characters, then an ellipsis. The seed's Hazel became "Hazel Montgomery" to exercise the limit.
- **Tags without the crumb icon**: name and number; a critter you haven't given to has a dashed tag (where the look has outlines) and a muted 0, and no pile at its feet.
- **"You"** on your critter's tag and under its name in focus, in place of "Your critter" (a new string; `copy.ts` has only `scatter.own.label`).
- **Scattered**: the middle of the bar is text only, centred.
- **Results**: opening Results hides every tag and gathers the critters above the sheet in two loose rows, pairs facing each other; each one hops, nudges toward its neighbour and settles on its own loop (none with reduced motion). The sheet's summary and who did not scatter now sit on separate lines. On desktop the circle stays, the tags go and the critters play in place.

## 13. Pass seven as measured (2026-10-05)

Measured as in §11, with the thought bubble and the open statement added to the checks: every tag against every other tag and every other critter's drawn figure; every figure against the others and the scene's edges; the bubble against the tags and figures; the open statement against the visible tags and the focused critter; the results sheet against the gathered critters; every button's size; and whether the name in focus fits.

| Check | Result |
|---|---|
| Scattering, reading and all given; 4, 6, 8 and 10 critters; phone and desktop; each critter in focus in turn | No overlaps, nothing clipped; the open statement never covers the focused critter or a visible tag |
| Feast, the same | Three small touches on the phone: two tags on Moss, the biggest receiver, with eight critters (88 and 103 px²); the bubble on Pebble with ten (132 px²) |
| Results open; 4 to 10 critters; phone and desktop | Clean; the sheet covers none of the gathered critters |
| Names in focus | All fit; "Hazel Montgomery" at 14 px, every other seed name at 20 px |
| Targets | Profile button, bubble, − and +, ‹ and › all 44 px or more; tags 30 px (26 px compact) with a 44 px hit area |
| Behaviour | The bubble opens the statement with the circle unmoved (identical positions before and after); › steps with it open, to your critter too ("You", no − or +); close brings the bubble back; "Scattered." has no icon and is centred; Results hides all tags and starts the play animation; closing it brings the tags back |
| Console and lint | No errors; `eslint docs/explorations/scatter-layouts` clean |

Unverified: the play animation and the bubble opening in motion, which no check watched; the floor crops; the critters against the reference painting.

## 14. Eighth pass — the dock, piles and tags above (2026-10-05, night)

Companion artifact: *Critter Crumbs Scatter Layouts*, version 3 of the same link. Reacts to Afolabi's review of pass seven, given on Inked daylight (Appendix E: "We're just about there"). No questions were asked first; each point below is built as read, with the one open choice (the piles) shown both ways.

Built:

- **The dock.** The focus row and the bar are one surface at the bottom: − name and count + above ‹ crumbs left ›, on the page colour, with a rounded top edge (and Inked daylight's top outline) lying over the floor and no gradient. It is 132 px tall against the 160 px the two took before, so the scene gains about 26 px and the critter in focus stands lower. − and + stay 56 px from the edges and the name keeps its 143 px. At Results the focus half folds away. On desktop the dock sits under the circle (− count + above ‹ 240 px middle ›) and the side panel holds only the statement.
- **Piles that grow with the amount.** Each critter's pile is a mound beside its right foot, widest at the bottom, scaled with the critter. A page control compares two rules: Proportional draws one crumb for every four given (24 given is 6 drawn); Exact draws every crumb (24 given is a heap of 24). A thrown crumb now lands in the pile, not on the tag.
- **Tags always above the head**, so the pile stays clear. Front to back, a crowded tag slides sideways (up to 66 px) or rises a little rather than dropping below; the solver also keeps tags off the piles.
- **No border change for zero**: a critter you haven't given to has the same tag border, a muted 0 and no pile.
- **The statement**: taller (378 px instead of 312; the text box 313 px instead of 247), and without "1 of 8". A tap on the floor outside it closes it, and so does Escape; a swipe across the floor still turns the circle without closing it, and taps on critters, − and + keep working while it is open.
- **Geometry for the new scene**: the phone circle uses the extra height (a slightly taller ellipse at ten critters); the desktop circle is wider and taller to keep tags above heads (rx 42 % of the width, ry 30 % of the height, smaller critters above eight).
- **Not built (Appendix E):** the first-run hint that a tap gives a crumb, to design with the app.

## 15. Pass eight as measured (2026-10-05)

Measured as in §13, adding: each tag is above its own critter's head; tags against piles; piles against other critters; the critters and piles against the dock. Both pile rules, 4 to 10 critters, phone and desktop, each critter in focus in turn. The page's timers are throttled while the preview is hidden, so the sweep ran without waits (layout is read synchronously).

| Check | Result |
|---|---|
| Phone, 4 and 6 critters, every state | Clean |
| Phone, 8 critters | One touch with Pebble in focus: Willow's tag on Moss's figure (112 px², 75 at the feast) |
| Phone, 10 critters | Small touches at four focus positions: a tag on a neighbour's figure (126–190 px²), the thought bubble on Pebble (119 px², 372 at the feast), and two tags touching at the feast |
| Desktop, 4 to 10 critters | Clean, apart from one tag touching Acorn's pile at ten |
| Results, phone and desktop | Clean |
| Tags | All above their critters' heads; none outside the scene |
| Dock | No critter or pile under it; − and + 52 px, ‹ and › 48 px |
| Statement | 378 px tall, text box 313 px; Moss's 633 px statement scrolls; a tap on the floor closes it; a swipe turns the circle without closing; Escape closes; a tap on a critter gives (Fern's exact pile went from 20 to 21) and + in the dock gives, both with the statement open |
| Console and lint | No errors; `eslint docs/explorations/scatter-layouts` clean |

Unverified: the piles and the dock in motion; how exact piles look at large amounts (no seed critter has more than 48); the floor crops; the critters against the reference painting.

## 16. Ninth pass — centred tags, a steady dock, the group at play (2026-10-05, night)

Companion artifact: *Critter Crumbs Scatter Layouts*, version 4 of the same link. Reacts to Afolabi's review of pass eight (Appendix F). Asked first, as Afolabi requested: whether the tags should go above or below. Measured before asking: at eight critters on the phone, 9 of 56 tag placements slid sideways off their critter, by up to 52 px. Afolabi chose the recommended answer: above, always centred.

Built:

- **Tags centred above.** A tag never slides off its critter; where it would cover a neighbour it rises by up to 16 px instead. To make room for centred tags, the phone circle at eight critters is a little taller with critters 6 % smaller, and at ten it is taller again with critters 20 % smaller; tags are compact (12 px, 26 px tall) from eight critters.
- **A steady dock.** The height shift Afolabi saw at the feast came from the focus row: "137 crumbs received · 19.6%" wrapped onto two lines, and a long name took a smaller line, so the dock moved between 136 and 140 px as the critters changed. The focus row is now a fixed two lines of 24 px, and at the feast the second line reads "137 · 19.6%" (the full wording stays in the accessible name).
- **The results card** gained 34 px of padding at its foot, so its scrolling list ends above the dock's rounded edge and the last row and the Replay and CSV buttons come fully into view.
- **The group at play.** With Results open, the critters gather as one group: pairs side by side and facing each other, two rows deep, the back row offset, centred in the space above the sheet (on desktop, in the middle of the floor). Partners lean in, boop and hop back together, and the pairs take turns 0.7 s apart round the group, so the group moves as one instead of each critter on its own loop.

## 17. Pass nine as measured (2026-10-05)

| Check | Result |
|---|---|
| Tags | Always centred over their own critter, at every size, state and focus position, phone and desktop |
| Overlaps, 4, 6 and 8 critters, phone and desktop | None |
| Overlaps, 10 critters | A tag on a neighbour's figure or pile by up to 193 px² on the phone and 164 px² on desktop; the thought bubble on a neighbour by up to 372 px² at the feast |
| Heights | Header, dock and scene identical for every critter, burrow size and state: phone 64, 132 and 639 px; desktop 67, 132 and 624 px |
| Results card | Scrolled to the end, the Replay and CSV buttons sit above the dock on the phone, at every burrow size, and inside the panel on desktop |
| The group | 138 to 303 px wide on the phone (4 to 10 critters), never under the sheet; partners face each other |
| Console and lint | No errors; `eslint docs/explorations/scatter-layouts` clean |

Unverified: the boop in motion, which no check watched; the floor crops; the critters against the reference painting.

## 18. Tenth pass — Results grows out of the dock (2026-10-05, night)

Companion artifact: *Critter Crumbs Scatter Layouts*, version 5 of the same link. Reacts to Afolabi's review of pass nine (Appendix G): the results sheet still read as attached to the bar below it, so the bar itself becomes the sheet; and the critters should huddle tightly on top of the results card, sitting on it and interacting at random instead of in fixed pairs.

Built:

- **The dock is an overlay** at the bottom of the screen (it was the frame's last grid row). At rest it is 130 px with the focus row over the bar, as before, and the floor ends at its top edge. The scene now runs under it, so the critters can sit over its edge.
- **Results grows the dock (phone).** There is no separate results sheet. Results grows the same surface upward until 196 px of floor are left, holding the results title and close, the ranked list (with the summary, who did not scatter, the privacy note and the Replay and CSV buttons) and the bar at its foot. The list fades out just above the bar while there is more to scroll, and its last 28 px are padding, so its end always scrolls clear. Results again, the close button, a tap on the floor or Escape shrinks it back. On desktop the results stay in the side panel and the dock folds down to the bar alone, with no empty band above it.
- **The critters huddle on it.** A front row sits shoulder to shoulder (centres 58 % of a critter apart) with their feet just over the card's edge, and a smaller back row peeks from the gaps behind; everyone starts facing the middle of the group. Phone: 158 px wide at four critters to 211 px at ten. They sit above the card in the stacking order.
- **Random play.** A timer picks one critter at random every 0.45–1 s: seven times in ten it turns to a neighbour and boops it while the neighbour turns back and bounces; otherwise it hops on the spot and sometimes turns round. A tap on a critter makes it hop. The play stops when Results closes and does not run with reduced motion.

## 19. Pass ten as measured (2026-10-05)

Measured in a separate Chrome instance (Chrome DevTools), where frames render, transitions run and the page is visible, so the random play could be watched as well as measured.

| Check | Result |
|---|---|
| Scattering, reading, all given and the feast; 4 to 10 critters; phone and desktop; each critter in focus in turn | Clean apart from 10 critters on the phone, where a centred tag can still touch a neighbour by up to 183 px² |
| Results, phone | The dock grows to 552 px; the front row's feet are on its edge at every size; the group is 158–211 px wide; no critter clipped; scrolled to the end, the Replay and CSV buttons sit clear of the fade |
| Results, desktop | The dock folds to 74 px; the group (248–332 px) sits on its edge; the side panel's list scrolls its buttons into view |
| Play | Over three seconds: a random critter booped a neighbour or hopped every half second or so, and their facing changed as they turned to each other |
| Scattering after the change | Dock 130 px, scene 748 px under it, the ring, tags, bubble and piles unchanged |
| Console and lint | No errors; `eslint docs/explorations/scatter-layouts` clean |

Unverified: the growing and shrinking of the dock as an animation on a phone; the floor crops; the critters against the reference painting.

## 20. Eleventh pass — your crumbs in the middle, a desktop that scales (2026-10-06)

Companion artifact: *Critter Crumbs Scatter Layouts*, version 7 of the same link. Reacts to Afolabi's review of pass ten (Appendix H), which was about the desktop view, and to the answer that followed it: Scatter These, Scattered. and Results stay in the bar, and the crumbs left move into the middle of the circle on the phone as well as on desktop. Version 6 also moved the count into the middle, in a pill under the heap, and the closing day into the bar; Afolabi corrected that the same day ("I Only ask for the crumb pile to be placed in the center, not how many is left to go"), so version 7 puts the count, the bar and the desktop header back as pass ten had them.

Built:

- **The crumb pile in the middle, larger.** On both devices the heap of crumbs left sits in the middle of the circle, drawn by the same rule as the critters' piles (the Piles control switches both: one drawn crumb for every four left, or every crumb) and with crumbs about 1.6 times the size they were (18 px on the phone, 23 px at 1280 desktop). Its box is the size of a full heap, so it keeps its place and shrinks toward its base as you give; the box sits between the back row's feet and the critter in focus (its tag on desktop, its thought bubble on the phone) at the height that covers least of the critters and their tags. Empty, it leaves three faint outlines (Design System §7.4). It replaces the 24-crumb heap of §7.4, which had also drawn its last crumbs at the left of its bottom row.
- **The count stays in the bar**, as in pass ten: "12 to go" with the closing day under it on the phone, and on desktop the count in the bar with the closing day in the header. Scatter These, Scattered. and Results follow it there.
- **Crumbs fly both ways.** A crumb hops from the heap to the critter's pile on every give and from the pile back onto the heap on every take-back; a hold pours a stream either way, and the heap gives a small bump as one lands. On the phone, while the statement covers the heap, the crumb icon in the bar stands in for it. This is the hop of Design System §7.4, which the mock-ups had only one way.
- **Your own critter stirs instead of taking the focus** (version 9). A tap on any other critter gives it a crumb and leaves the circle where it is, so a tap on your own, which had turned the circle to it, felt jarring (Afolabi, Appendix H). Now it squashes, wobbles and turns over in its sleep while three z's drift from beside its head toward the middle of the floor; the focus stays put, and the side it turned over to sticks until it is tapped again. At the feast a tap still turns the circle to any critter, yours included, to show its numbers; its tag still turns the circle at any time. Nothing moves with reduced motion.
- **Desktop fixes.** − count + is centred again (pass ten made the dock a flex column, and the row's `justify-self` stopped applying). The critter in focus shows its tag on desktop: the whole name, 16 px, no count (the count sits between − and + under it). The statement sits on the side panel without a card behind it.
- **Whole names.** A tag shows the whole name (up to 16 characters) where it fits and the 10-character form only where the whole name would cover a neighbour, its pile, the heap or a tag still to be placed. The decision is made per tag on every turn of the circle.
- **The results buttons in one row on the phone** (version 11). At the end of the phone's results, the two buttons sit side by side, half the width each, with shorter labels Afolabi asked for: "Replay Feast" and "Download" (proposed as `feast.replay.short` and `results.export.short`; `copy.ts` has "Replay the feast" and "Download CSV"). Download keeps "Download CSV" as its accessible name. Desktop keeps the full labels in its bar. Measured at 4, 8 and 10 critters: both buttons 164 × 48 px on one row, labels unclipped, clear of the bar.
- **Replay Feast on desktop too** (version 12). Afolabi: "Just change on desktop Replay the feast to "Replay Feast"". Both devices now say Replay Feast; desktop keeps Download CSV.
- **The results bar on desktop.** With Results open, Replay Feast and Download CSV sit in a 74 px bar at the foot of the side panel, level with the folded dock, and the list scrolls above it under a fade.
- **A desktop that scales.** The circle's geometry is in units of the floor, `u = min(scene width ÷ 880, floor height ÷ 606)`, which is 1 in a 1280 × 800 window. At u = 1 the critter in focus is 248 px (was 190), the back row 120 and the front 172 (were 86 and 128); the back row stands low enough for its tallest critter's tag to stay on the floor; the circle is deeper (its front pair stands at 95 % of the floor) and at ten critters wider (44 % of the width) and 22 % smaller. The heap and the huddle at the results scale with u; type and controls do not. The side panel is 400 px, or a quarter of the width above 1600 px, up to 480. A Size control shows the desktop at 1280 × 800, 1440 × 900 and 1920 × 1080.

## 21. Pass eleven as measured (2026-10-06)

Measured in a separate Chrome instance (Chrome DevTools) with transitions switched off for the sweep: every state (scattering, reading, all given, scattered, feast), 4 to 10 critters, each critter in focus in turn, on the phone and at the three desktop sizes, 140 layouts each.

| Check | Result |
|---|---|
| Desktop 1440 × 900 and 1920 × 1080 | Clean; every tag fits its whole name at 1920 |
| Desktop 1280 × 800 | One touch: at eight critters, with one particular critter in focus, the back-left tag covers 161 px² of the back critter's ear (113 px² at the feast) |
| Phone | No tag over another tag, the heap or the dock; tags over a neighbour only at ten critters, up to 123 px² (pass ten: 183) |
| The heap | 150 × 111 px box on the phone (62 × 53 px of crumbs at 12 left), 186 × 138 px at 1280 desktop; never over a critter |
| Short names | 49 of 1,080 tag placements on the phone and 23 of 1,080 on desktop at 1280 use the 10-character form; 9 at 1440; none at 1920 |
| Clipping, heights | No tag above the floor or off its sides; the dock keeps one height per state and burrow size |
| Targets | Every button at least 44 px; tags are 24 px tall or more with their hit area extended |
| Crumb flights | Give: a crumb travels from the heap to the pile at the feet; take back: from the pile to the heap, which bumps. A held − poured a stream of crumbs back (11 while one screenshot was taken) |
| Results, desktop | Dock 74 px and the panel's bar 74 px, both at y = 726 in the 800 px frame; the list scrolls 659 px of content in 609 |
| Reading, phone | Heap hidden under the statement; crumbs fly from the bar's crumb icon |
| Console and lint | No errors; `eslint docs/explorations/scatter-layouts` clean |

Unverified: the flights on a real phone; the floor crops; the critters against the reference painting.

## 22. Backgrounds: floor-first plates and the tools to paint them (2026-10-06)

Asked for in Appendix H: "a prompt to update our background images to be more floor based with walls at the top of the screen, suggest what AI image tools we can use". The review page's *Backgrounds to paint* section (version 8) holds the working version: a layout guide, the prompts for each scene, device and tool with copy buttons, and a file input that drops a generated plate into the frames to judge it against the critters, tags and dock.

**The plate.** One painting per scene and device, laid flat behind the circle instead of today's floor cropped from the paintings and tilted onto a plane. The back wall runs straight across the top fifth (17 % of the scene on the phone, 20 % on desktop); the floor fills the rest; the middle of the floor is open, flat and evenly lit with little detail, because critters and their name tags stand on it; props stand only against the wall and in the top corners; the bottom sixth sits under the dock. Phone plates are 1 : 2. Desktop plates are 16 : 9 and are cropped to the circle's side of the screen (the scene is 1.2 : 1 at 1280 × 800 and 1.4 : 1 at 1920 × 1080), so the round window and every prop stay within the middle three fifths. Paint at twice the frame: 750 × 1500 and 2560 × 1440.

**The prompts** keep the scene style that made the three paintings (design directions §15) and add a floor-first view: "a game background seen from high above at a steep three-quarter angle, looking down at the floor like the play area of a cosy top-down life-sim game; the back wall runs straight across the top of the frame and fills only the top fifth; the floor fills everything below it; the middle of the floor is open, flat and evenly lit, with large simple shapes and little detail, so small characters and their name labels read clearly on it; props stand only against the wall and in the top corners; the bottom of the frame is plain floor". Each scene's subject is described from its painting: Window from `scene-feast.webp` (cream stone and roots, the round opening onto sky with steps, the low table with bread), Entrance from `scene-day.webp` (the cream and teal stone face between rust-orange roots, the terrace of flagstones), Dusk from `scene-dusk.webp` (teal stone, the mossy trunk, the gold window, the lantern on a bench).

**Midjourney has changed since the §12–§16 prompts.** V8.2 has been the default since 24 July 2026. `--style raw` is now `--raw`; `--oref` and `--cref` are gone, replaced by the Edit model, which takes up to four reference images; `--sref` with `--sw` still works; `--hd` renders natively at 2048 px; `--q` is gone. The page's prompts use `--v 8.2 --raw --s 80 --hd --sref <painting> --sw 300`. Midjourney's own documentation refused the fetch, so these come from a guide that cites it; a test prompt settles them.

**Tools, in the order to try them** (as of 6 October 2026):

| Tool | Use it for | Why |
|---|---|---|
| Midjourney V8.2 | Painting the plates | Still the strongest at painterly looks; the earlier scenes came from it, and `--sref` on the existing paintings carries their surface across |
| Nano Banana Pro (Gemini 3 Pro Image) | Turning an existing painting into the top-down view; fixing a plate by instruction | Up to 14 reference images, 3 of them for style; 9:16, 16:9 and 21:9 up to 4K; conversational edits |
| GPT Images 2.5 (ChatGPT, 8 September 2026) | Exact layouts | Follows placement instructions best; any size (1024 × 2048 for the phone); comment-based edits that leave the rest alone |
| Scenario | Seasons and later scenes, once four to eight plates are approved | Trains a style model on owned images (the paintings are WEFA's); commercial licence on paid plans |
| Photoshop Generative Expand (Firefly Image 5) | Widening or heightening an approved plate for another screen | Extends a painting rather than repainting it |

Use a paid plan for anything that ships, record the tool beside each file, and train only on images WEFA owns. Asset licences are not a runtime dependency, so `docs/decisions.md` needs no line until a plate ships; when one does, a line naming the tool and plan belongs there.

Sources: [Midjourney V8.x parameters](https://blakecrosley.com/guides/midjourney) (citing the Midjourney docs; [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)); [Nano Banana Pro](https://blog.google/innovation-and-ai/products/nano-banana-pro/) and [Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation); [GPT Images 2.5](https://community.openai.com/t/introducing-gpt-images-2-5-in-the-api-and-chatgpt/1395897) and [gpt-image-2](https://developers.openai.com/api/docs/models/gpt-image-2); [Scenario custom models](https://help.scenario.com/articles/5002595381-scenario-models-custom-trained); the 2026 overview at [Turing Post](https://www.turingpost.com/p/11-options-for-image-generation).

## 23. Every other screen: the flow page (2026-10-06)

Asked for in Appendix H ("design the other screens from the game intro/launcher, login, onboarding, burrows, profile, create a feast, manage burrow, and any other screens we are missing"), on one flow page as Afolabi chose. Companion artifact: *Critter Crumbs Screens*, a new page; its README is `docs/explorations/app-screens/README.md`.

**What it holds.** 28 screens in ten stages, numbered in the order a member meets them, each drawn live on the phone or desktop in any of the five looks (Inked daylight by default): arriving (the launcher, arriving by link), connecting (choosing how, confirming), meeting your critter (your name, the re-roll), first steps (three), burrows (your burrows, none yet, starting one, a burrow, managing its critters, leaving, not in this burrow), starting a feast (people, options, opening it), gathering (your statement, further down), scattering and the feast (statements are open, confirming your scatter, the feast being laid out, the feast, recording a public result), your profile, and when something goes wrong (offline, a feast that ended before scattering). The scatter screen itself stays on its own page and is linked from the feast stage.

**One anatomy.** Every screen is built like the scatter screen: a header with the burrow or the wordmark and your critter's face at the right (the way to your profile); the painted floor with the burrow's critters standing on it, asleep or awake as the phase says; and one surface for the content, which is the dock rising from the bottom on the phone and the side panel on desktop. Dialogs are a sheet on the phone and a centred card on desktop. The launcher is the one exception: the painting fills the screen, with the wordmark on a plate and a card holding Connect and How it works.

**Live where it matters.** Buttons that lead somewhere jump to that screen. Meet your critter re-rolls the real generator up to four times and Keep this one locks it. The second first step lets you tap critters to fly practice crumbs from a heap and hold to pour. The profile's switches switch.

**Decisions it needs:**

- **First steps against Design System §9**, which says first-run guidance is "never a tour". Afolabi has asked for a short onboarding twice (Appendix E, Appendix H). The page proposes three skippable screens after meeting your critter (the same handful; tap to give, with practice crumbs; hidden until the feast, the scatters resting in closed seed pods as Appendix A's "gentle hiding, not locks"), reachable again from the profile and from the launcher's How it works, with the one-line instruction kept on the first scatter. Needs a line in `docs/decisions.md`.
- **New strings**, not yet in `copy.ts`: How it works; "Confirm in {name}" and its sign-in line; the first steps' titles and bodies, Next, Skip and Got it; Copy address; Copy your address. Everything else on the page is existing copy.
- **The launcher** is new: the app opens straight onto the arrival explainer today.
- **Removing a member.** The PRD leaves it open (Q8), but the app already lets a burrow's creator remove a member, with a history line; the members screen shows that, so the PRD needs to catch up.

Measured in Chrome at true size: 28 screens and 180 critters render with no console errors on the phone and desktop; every button is at least 44 px tall (switches 32 px, above the 24 px floor), and nothing in a sheet or panel runs past its edge; the re-roll changes the critter and counts down, Keep locks it and turns into Next, a practice tap leaves 9 to go, and Connect on the launcher jumps to Choose how to connect. Not measured: critters against the painted walls (they stand on the paintings' floors only roughly until the floor-first plates of §22 exist), and the screens on a real phone.

## 24. The flow page, second pass: every state (2026-10-06)

Asked for at the end of Appendix H ("Then lets focus on the other page mocks we need to create to cover the full flow"). Version 2 of *Critter Crumbs Screens*.

**What it adds.** 26 screens, for 54 in all: 31 on the main path and 23 states, each state marked as one. The states are the errors, edge cases and the creator's extras the app's copy already names, so most of them are drawn from existing strings:

- **Connecting:** nothing to connect with (connect.empty) and a signature declined (connect.rejected).
- **Burrows:**
  - New on the main path: a burrow just created, with only you in it; joining a burrow someone added you to (burrow.join).
  - States: a burrow with no feasts, and removing a critter.
- **Starting a feast:**
  - New on the main path: the saved draft.
  - State: too few critters (PRD R6), with Open the feast waiting.
- **Gathering:**
  - New on the main path: an options feast's statements, one per option (PRD P1).
  - States: extending gathering once; cancelling the feast; joining after the set froze (err.notParticipant, PRD R7).
- **Scattering and the feast:**
  - New on the main path: your scatter is in; the result recorded on-chain; a public result seen from outside.
  - States: who has scattered; saving; a declined signature; a save that failed; scattering closing with the screen open; the key not out yet; nobody scattered; one scatterer and a tie; who gave what (Design System §6.5's sideways table, the giver held).
- **When something goes wrong:** the device clock off, ENS names unavailable and the simple view, together; the sign-in running out while writing.

**Seeing the path alone.** A Show control (`show-all`, `show-path`) hides the states, leaving the 31 screens a member meets on a good day. A button that leads to a state while it is hidden shows everything first, then lands on it.

**The moments on the scatter screen** use the scatter page's dock: the focus row over the bar, with the bar's middle as Scatter These, Saving…, Scattered. or the closing line. These are confirming, saving, saved, not signed, could not save and scattering closed. On desktop they follow pass eleven: the dock lies under the circle with − count +, the critter in focus wears its name on a tag, and the statement fills the panel. Passing messages sit at the top of the floor, so they never cover the circle or the critter in focus.

**Changed from version 1.**
- Confirming your scatter now sits over that dock instead of a sheet of its own.
- The last two hard-coded lines are now copy proposals: under a new burrow's name, and while the feast plays. The membership history line uses copy.ts's own string.
- The feast's and the notices' sheets no longer scroll.

**Decisions it adds** to §23's:

- **Who has scattered while scattering is open (PRD R5).**
  - The scatter screen dropped its row of faces in pass six, so today only the burrow's feast card says "5 of 8 have scattered".
  - The page proposes that line open the list: who has, then who has not yet, faces dimmed.
  - Decide whether the scatter screen needs it too.
- **More new strings:**
  - who added you to a burrow;
  - the line under a new burrow's name;
  - the line while the feast plays;
  - Download, for the phone;
  - Replay Feast, which replaces copy.ts's "Replay the feast" as Afolabi asked (the scatter page's versions 11 and 12).
- **The cancel-feast dialog dismisses with Back**, so it never sets "Cancel" beside "Cancel the feast".

Measured in Chrome at true size, in a local copy with the paintings:
- All 54 screens render on the phone and desktop with no script errors.
- Every button is at least 44 px (switches 32 px).
- No passing message leaves its frame or covers a critter.
- The only sheets that scroll are the long ones meant to: the setup form, the statements, the members list and a burrow's feasts.
- A jump from the main path to a state lands with the whole screen in view.

Not measured: real phones, and critters against floor-first plates, which do not exist yet (§22).

## 25. What this review keeps from PR #31 (2026-10-06)

PR #31 (`phase-4/design-settle`, a draft since 2026-09-24) proposed six design system decisions, D14 to D19, and asked DQ5 at its checkpoint. This review has overtaken most of them, so the PR that lands it replaces PR #31 instead of following it. The design settle page and its prototypes stay in PR #31's history; the generator in code is untouched (`GEN_VERSION 1`, D8), and the review pages carry their own port of the version 2 prototype (`scatter-layouts/lib/generator.js`).

| PR #31 | Where it stands | In the design system |
|---|---|---|
| D14, the world palette | Overtaken by Inked daylight's warm palette (§8), pending confirmation | DQ1, reworded |
| D18, Young Serif stays | Overtaken: the type read as a default choice (§1), and Inked daylight uses the system sans | DQ1, reworded |
| D17, the arrival picture through the round window | Floor-first plates asked for instead (§22) | Not carried |
| D15, 3D critters toon-shaded without an outline | The inked direction draws critters with ink lines; the 3D render has not been revisited | Not carried |
| D16, the element draw as version 2 | Every critter on the review pages is drawn with it, painted with the 2026-10-05 eyes and colour; the creature research may add species | The definition of version 2 inside DQ5, not a decision |
| D19, the signing wording and the heap as a scaled mound | The wording is unchanged and the screens page uses it, but only the council can confirm it reads clearly; the heap question is reopened as Exact or Proportional (§14) | DQ3 kept open; DQ4, reworded |
| DQ5, when version 2 lands | Its first answer was "before the rehearsal"; the Technical Spec's rehearsal window (28 Sep to 2 Oct) has passed, and nothing in the repository records the rehearsal | DQ5, reworded: before or after the October feast |

## 26. The floor plates, painted (2026-10-11)

Asked for after using the live app: "are we able to generate better background images for the gameplay that has more of a floor and wall at the time building off the background images we currently have? If you are able to use chatgpt/codex image generator that would be great or whichever best image generator you have access to." The Window and Dusk scenes now have a plate for the phone and one for desktop; the recipe, the words sent and the takes shipped are in `docs/explorations/floor-plates`.

**What §22 had wrong.** It gave the wall the top fifth of the scene, straight across (17 % on the phone, 20 % on desktop). The circle was laid out first, and its back row stands about 14 % down the phone's scene and 22 % down the desktop's, so the first plate painted to §22 stood three critters on the wall: one in the round opening, one on the steps, one against the shelf. Two changes came of it:

- **The wall is an arch.** The critters either side of the back row stand lower than it, so a wall that follows the circle can be low in the middle and tall in the corners. That is a round burrow chamber seen from above, which suits the place, and it leaves the corners for the roots, the shelf and the table.
- **The app raises the plate.** The back row is higher on a short screen than a tall one (a phone inside another app's browser is the common short one), so no single painting fits every screen. Each plate records where its wall ends in the middle (`wallFoot`), and the app raises it until that line is 8 px above the back row (`packages/app/src/game/plate.ts`). More of the top of the wall leaves a short screen; the floor always meets the feet.

**The tool.** §22 put Midjourney first and expected Afolabi to paint. He asked for the Codex image generator, and it did the work: the image tool built into OpenAI's Codex CLI, given the scene's own painting and a rough block-in of the layout drawn with flat shapes. What it showed:

| Observation | Consequence |
|---|---|
| One reference painting is enough for it to hold the hand: the ink line, the hatching, the cel shadows, the colours | No style model or second tool was needed |
| It follows a block-in's arrangement but paints the wall and the props about half as tall again as drawn | Raising the plate absorbs it; words alone ("a tenth of the image") do not |
| Asked for a 1024 × 2048 portrait it returned 887 × 1774; asked for 1536 × 1024 it returned that | A phone plate is 1 : 2 as §22 has it. A desktop plate is 3 : 2, not §22's 16 : 9, which wastes less on a scene that is 1.2 to 1.5 wide |
| A take arrives in about a minute | Nine were painted; four ship |
| Without a block-in the round opening lands in the middle of a tall wall, as in the painting | Every shipped take used one |

**Measured** in Chrome at true size on the scattering screen, by reading the plate's box and every critter's foot line: at 390 × 844, 390 × 664, 375 × 667, 430 × 932, 900 × 700, 1280 × 800 and 1920 × 1080, with 4, 7 and 10 critters, in both scenes, the wall ends at least 7 px above the highest feet and the plate covers the scene (`tests/screens/foundations.spec.ts`). Looked at, not measured: statements open, the feast, the results and the dark look, on the phone and at 1280 × 800.

**Not done.** The Entrance scene, which the live game does not show. The launcher and the screens with a sheet, which still show the whole paintings; their critters stand on the paintings' floors only roughly, as §23 says. A real phone. And §22's condition stands: a paid plan for anything that ships, which is Afolabi's to confirm for the account the plates were painted on.

## Appendix A — the art direction, verbatim (Afolabi, 2026-10-02)

Given in answer to "Which existing game UIs are closest to the bar you want?". Afolabi also answered yes to standing the critters in the illustrated burrow and yes to redrawing them to match the style.

```text
You are designing Critter Crumbs, a private voting and allocation game from
the WEFA universe. Players feed crumbs (their votes) to critters (the
options). [EDIT: one line on how a round works and who plays.]

STYLE
Painted daylight. Hand-drawn critters with a loose, tapered sketch line left
visible, coloured dark plum (#251C25), never black. Three-value soft-cel
shading: shadows shift cool (teal, plum), lights shift warm (lime, peach,
gold). Rounded, chunky shapes that read as a silhouette at 64px. Dry-brush
grain only on rough things: fur, bark, shell, crumbs. No glossy 3D, no neon,
no pure black or pure white.

PALETTE
Page #F4F2EA. Text and line #251C25. Sky field #8FAFEC to #D8E4FE.
Warm neutral #B69993. Crumb gold #CAA24F, highlight #F2DD8E.
Elements (shadow / base / light / soft):
  Fire   #852318 / #EB521D / #F5A95D / #FCE7DE
  Earth  #156152 / #289946 / #ACE676 / #DEF5DA
  Water  #263580 / #2564B8 / #84D3F0 / #E1EDFC
  Air    #52366B / #B26ACC / #E9BBF0 / #F1E3FA
Each screen is about 70% calm field (page or sky), 25% warm neutrals and
gold, 5% one element accent. Element text is shadow on soft. Never show an
element by colour alone; pair it with an icon and a label.

CRITTERS
Small, round, big-eyed, with slightly oversized paws. Each has one feature
taken from a real plant or habitat and one element accent. Friendly and
curious, never fierce. Idle motion: breathing, a blink, an ear twitch.

LOOK
Flat, spacious interface. Rounded cards (16 to 24px radius), pill buttons,
44px minimum touch targets, system sans-serif with bold headings. Painted
critters and crumbs are the only textured things on screen; controls stay
flat. One primary action per screen.

FEEL
Calm, warm and hopeful, like feeding animals in a garden. Motion is soft and
short (140 to 320ms, cubic-bezier(0.2, 0.8, 0.2, 1)). Crumbs arc and land
with a small bounce, and critters react with delight to any amount. Privacy
is shown as gentle hiding, not locks: crumbs go into a burrow or closed seed
pod, and all pods open together at the reveal. No pressure timers, no
scarcity cues, no shaming of low totals.

COPY
Short, warm, plain words in sentence case.

ACCESSIBILITY
Text contrast at least 4.5:1. Respect reduced-motion settings. Keep it light
enough for low-end phones.

REFERENCES
Borrow one quality from each. Do not copy characters, logos or signature
motifs.
- Studio Ghibli background painting: lush, specific foliage and open skies.
- Wolfwalkers: sketch lines left visible in the finished art.
- Klaus: 2D drawing with soft light and a cool rim.
- Arcane: visible brushwork and coloured light only, not its dark palette.
- Pokémon and Pikmin: small creatures with simple shapes and instant
  silhouettes.
- Avatar: The Last Airbender: element identity through colour; creatures
  built from real animals.
- Neko Atsume and Animal Crossing: calm, cosy pacing and a soft, rounded
  interface.
```

## Appendix B — the review of pass four, verbatim (Afolabi, 2026-10-02)

The review pass five answers. Dictated, so read "UEFA" as WEFA and "scatter of these" as the "Scatter These" button. The WEFA reference painting was attached to it.

> Okay so we're making some improvements. I actually do think we could have the scattering, the closing date at the bottom. I actually think that's fine. But we just need to better design it than what we currently have right now. Some feedback is having four creatures on a row is too tight. The plus and minuses are way too close to one another. And could be better improved. So we need to improve the spacing to make this mobile friendly. And a good experience. I'm also not sure what is it the green thing beneath each creature is a little confusing I'm not sure what that's meant to represent but doesn't seem like it should be there So I still think the layout needs to be improved of the creatures, and maybe there's a way to do the circular approach. The interesting thing is that with the background we have, Some of the creatures right now are kind of the ones that are on the second row, higher up on the screen, don't feel grounded in the reality of where they'd be placed. So I think we just need to either move the background up a bit more so there's more ground for the creatures to be. I think we're trending in the right direction. I think I personally like the daylight and ink and ember looks the best right now.
>
> It seems that the screen set you created, when looking at a creature, you're still rendering all the creatures in the scattering view, so it makes it a little bit hard to review. Though, it's not too bad, I am able to review it. And with this to ensure when reviewing a contribution, we have a fixed height. And then you can either scroll or click the next button to view other ones. And the contribution section should be a fixed space that if it overflows, you can scroll it. And we should move the controls to add more to the bottom so there's more space for the contribution statement if it's long. And keep the plus and minus in a fixed position.
>
> I like to scatter these buttons for ink and ember. And it still did not make a title case where both of the button words are capitalized.
>
> The color palette will improve. I feel like the scatter of these being a dark color doesn't look as good as I'd like. So I'd like us to have more warm colors that we're pulling from our color palette to use. Right now in this current iteration, in the two versions I like the most, Daylight, Ink, and Ember, I feel like the colors are a bit strong and not as warm as beforeand So vibrant. .
>
> The fixed bar at the bottom for Feast is not too well designed. We say Feast. and tht feels like it should not be there
>
> I find it odd that we have to scatter these buttons in desktop full width, but then we have the results button. It's not, it's a fixed width, so I think we need to better improve how we have the button for desktop.
>
> Having the scattering details like the date and time it closed at the top on desktop probably makes more sense than having it in the footer, but I'd love to see your thoughts there. I just think I just want this feel more cohesive and better designed. I think before I was noticing a lot of differences in text size and things of that nature and just kind of looked a bit off.
>
> I think for the placement of the creatures, I think we just need that's what we really need to improve. And trying out different layouts. On desktop, even laying them out all in a row, they're all very closely overlapping. And I think we just need to explore different layouts and have that be something we could tweak. And to see different ways to layout things. And maybe this indicates that the background itself should be more fully kind of like a space like you kind of see in games right now we're kind of have the scene have the floor and then the wall and maybe we should just have a background image just mainly just the floor so that it feels more natural placing these creatures across the floors and then having more elements in the corner that indicate the walls, but more following what you see in, like, game, mobile game design and things of that nature. So that's another area we could potentially explore. Bye.
>
> The last thoughts are around the creatures themselves. I think stylistically the art style is starting to get a bit more there, but still feels a little too cartoonish and not well aligned with the art direction and building off of what we have with UEFA. And I'll attach the image for you to be grounded. In what that design look and feel is like.
>
> Feel free to ask me questions to align

Afolabi's answers to the three questions asked before pass five: explore the floor view, the circle and the rows equally; crop the existing plates for the floor now and write the prompt for a real one; and, for the critters, the option discussed in §8's first open point.

## Appendix C — the answers that set pass six, verbatim (Afolabi, 2026-10-05)

Given in answer to four questions: where − and + should live once every target is 44 px; which look goes into the app; which eyes; and how much goes into the app before the council's feast.

On − and +:

> I'm thinking of a user design where we use the action bar at the bottom to show how many crumbs are left in the middle. And then on the left and right, you have buttons. So you can go to the next or previous critter. And then we have the critters be in a circle with one in focus at a time. With one in focus, you see the plus and minus and can remove or add. And even the ones not in focus, you still see the amount allocated. And if you tap and press on them, you can still add to them. But you're not able to subtract unless they're in focus. I think that would help a lot with our space.
>
> We will need to figure out what we do once you fully allocated all crumbs and then now it's showing the scatter button. Because if you do want to then readjust, there needs to be a simple way to do that. That's intuitive. So that's the part that I'd like you to think about. But I like this direction and would like us to explore how we could implement this.
>
> Then the other aspect is currently at the top we show all the people you have contributed, critters that you have given crumbs to. But I think that won't be needed and we can make that more subtle within the design of the circle of creatures that you circle through. With some clear visual indication that you haven't allocated to them, as well as the number being zero. So within this flow, you should even see your own critter because you may be reviewing contribution statements and you want to compare what you wrote against others to help contextualize how you want to allocate to others, even though you can't allocate to yourself. So being able to see your own critter, just not having the ability to allocate to, I think is nice within the flow as well.

On the look: "Not sure yet still need to review and decide". On the eyes: big round dark eyes. On scope: one more mock-up pass first.

Then, to four follow-up questions, Afolabi took each recommended option: the bar keeps ‹ and › while its middle swaps; a statement panel that stays open; the circle turns; element accents on markings only.

## Appendix D — the review of pass six, verbatim (Afolabi, 2026-10-05)

The review pass seven answers.

> Okay, I think we're getting there. This is starting to look pretty good. I'm liking what I'm seeing. A couple points of feedback.
>
> 1. Have profile button is at the top of the screen
> 2. The contribution message should be a thought bubble on the right to their head, so more clear
> 3. I like the inked design though the typography for daylight is better, Also the daylight color palette is better, I love the border of the inked designs but prefer the button shape of the daylight
> 4. I think the contributor message when open could be at the top so the creature that you're focused on you're still able to see and it gives understanding that you're viewing that creature and then we don't have to shift all the other creatures like we currently do.
> 5. When we have the contributor message open, we seem to be putting a background in the controls for plus and minus. And I'm not sure why that's happening. I don't think that's needed. Thank you.
> 6. I think the minus and plus controls that we have could be moved a little bit more in. Not too much, but a bit more inwards. Which then also means we do need to set a pretty clear limit for names. And lengths of the names that people put for their critter. Or if doing a budget allocation.
> 7. Right now, I like the subtle thing where we have creature crumbs next to each creature. I think what I'd like to explore is we also then have the name. When we have their name card, we show the creature, we show the crumbs amount with the crumb icon. And I wonder do we need to have that icon? Feels like it could be a little bit duplicative. Thank you.
> 8. Also your critter can say just "you" no "your critter"
> 9. Once scattered I think we just need the text and not a check icon, so the text stays centered.
> 10. I think once the feast is done, I do like what we have to a degree of that you see the results button and then you're able to click between the different creatures and see their allocations. I think the only thing I would improve here is when you click the results button is you open the sheet up and all the creatures their name and allocation amount go away and they're just at the top of the results sheet since there you're already able to see the name and the details and allocations you just get to see the creatures being around each other and and friendly and it even be cool to have a way for them to be playing with one another when in that state

Afolabi's answers to the three questions asked before pass seven: names stop at 16 characters; the profile button shows your critter's face; points 2 and 4 together mean a thought bubble beside the head that opens the statement at the top.

## Appendix E — the review of pass seven, verbatim (Afolabi, 2026-10-05)

The review pass eight answers, given on the Inked daylight look.

> some great improvements. We're getting there. We're just about there. So right now we're showing in the ink daylight which is what I'm focusing my review on. For people we haven't allocated any crumbs to, we're changing their border and we shouldn't do that. That doesn't need to be the case.  The thought bubble opening up the contribution statement looks good, though I think the contribution panel could be a little bit taller. So you can see more of the contribution statement. And right now we're saying in the contribution statement, one out of eight. But I don't think that's needed. We should have clear way of how we show the pile of crumbs next to a critter that is proportional based on the amount that's been distributed to them. It doesn't need to be fully equal because that might be a lot or maybe we do explore that where the crumb pile next to them is actually the amount of crumbs that have been allocated.
>
> Of course, when we implement, I should be able to just click out of the contributor statement to close it.
>
> Right now we're putting the name labels. Some of them are below, some are above. I think in general I might put them above so that the pile is very clear. And yeah so I think we should in general have the name tags be above them.
>
> Of course, the one that's in focus, its name stays where it is. That looks fine. Thank you.
>
> Just something to note, not something we may need to design here, but we need to still make it clear that you're able to click on a creature and have crumbs be allocated. So that might just be something we do like an intro or something we indicate with some short and quick onboarding flow.
>
> I'm noticing we have a gradient background where we show the focus, critters, name, crumbs received, and percentage. In the different states, we just show the crumbs. But does it mold well with the action bar below it? So I just wonder if we could just make them more fluid and combined than they currently are right now.
>
> And if we were to combine them, I feel like that would help in the spacing because then we could move some things down a bit more and have more space for the scene with the critters.

## Appendix F — the review of pass eight, verbatim (Afolabi, 2026-10-05)

The review pass nine answers.

> Hey looks pretty good. I think one question I have is do you think the name tag should be above or below now? They're not all being placed centered above And you think it'd be better below but first ask me before you go ahead and edit
>
> A slight shift in the header height, one switching between different charts when I'm looking at the results. So this is something we need to ensure that the height remains consistent and doesn't shift. Thank you.
>
> the results card is getting cut off at the bottom so just need to fix that i do like how the critters are above it'd be nice if they were more grouped together like kind of next to each other playing around then currently this kind of be moving erratically in their own space and it'd be more coordinated on how they interact with one another

Afolabi's answer to the question asked before pass nine: name tags above, always centred.

## Appendix G — the review of pass nine, verbatim (Afolabi, 2026-10-05)

The review pass ten answers.

> so when still looking at results the sheet on the bottom still is connected to the bottom action bar so it's still so we either could go the route of just extending the bottom action bar to be a sheet that expands and that might even look better than even having a separate results sheet and then it'd be nice to have the critters still more tightly next to each other and playing with one another um right now we're just kind of grouping them all in twos but it'd be nice to make it have them all be grouped on top of the results card so like they're basically kind of sitting on it to a degree and then interacting with each other in a random manner

## Appendix H — the review of pass ten, verbatim (Afolabi, 2026-10-06)

The review pass eleven answers, with the three general points that set the backgrounds, the creature research and the screens page.

> Some feedback on the desktop view
>
> * The allocation controls shifted and is no longer centered
> * The contribution statement does not need a background
> * Name tags should not overflow if possible
> * The name tag should show on the focus one on desktop
> * We should have the crumbs you have left to allocate in the middle of the critters and be a bit larger so more clear
> * There should be an animation of crumbs moving to a critter when added and moving back to the crumb pile when removed.
> * The results should have a fixed action bar level with the action bar in the main canvas so download and replay are visible
> * We should scale up critter sizes on desktop and make responsive to the viewport size
>
> General thoughts
>
> * We need a prompt to update our background images to be more floor based with walls at the top of the screen, suggest what AI image tools we can use
> * We need to to better design the critters to have a more diverse set of elemental creatures that exhibit the element and have a more spiritual feel as well as have both flying and ground creatures. We should research and discuss different creature ideas
> * We need to design the other screens from the game intro/launcher, login, onboarding, burrows, profile, create a feast, manage burrow, and any other screens we are missing.

Afolabi's answers to the two questions asked before pass eleven. Where Scatter These goes once the crumbs left move into the circle: "Stay in the bar and also the crumbs should be in the middle for mobile as well". How to take on the other screens: all screens on one flow page.

And the correction to version 6, the same day:

> I Only ask for the crumb pile to be placed in the center, not how many is left to go.

And a note on version 8, the same day:

> The thing I'm noticing is that when I press on my own critter, it then moves it into focus, which is a little bit jarring since other critters, it does change the allocation. So I think we should have a better action that happens there. It shouldn't bring me into focus. Thank you. It should also maybe we do a fun animation when you click on your critter.

And on version 10:

> One small change put the result button on mobile in one row by shortening the name to Replay Feast and Download

And on version 11:

> Just change on desktop Replay the feast to "Replay Feast". Then lets focus on the other page mocks we need to create to cover the full flow
