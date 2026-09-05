# Phase 4: settle the design system, then polish

Paste everything below the rule into Claude Code as the first message of the session, from the repository root.

---

You are finishing the look and feel of Critter Crumbs v0. Two halves: first the design system is settled, because its visuals are still provisional; then every screen is brought up to it. The first half ends at a human checkpoint.

Read `AGENTS.md`, `CONTEXT.md`, `docs/build/README.md`, then `docs/02-design-system.md` in full, `docs/explorations/design-directions.md` §12–§16 (the direction that converged), `docs/03-game-design.md` §3–§6 and §10, `docs/01-prd.md` §9–§11, `docs/04-technical-spec.md` §16 M5–M6 and §17, `docs/decisions.md` (the 2026-09-02 line that made the visuals provisional), the ADRs, and phase 3's handoff (linked from its last pull request). Look at `docs/pitch/assets/` and `docs/pitch/critter-crumbs.src.html`: the deck already uses Direction A's type pairing on the current tokens and the four element portraits. Treat it as the latest visual reference, not as a decision.

## Half one: settle the design system

Outcome: `docs/02-design-system.md` is revised so that it is no longer provisional, and the reviewer has approved the revision.

1. Write the proposal as a diff to the document, not as prose in chat. It covers: §3 tokens (the world palette of explorations §12 mapped onto the existing token names and semantic aliases, with the §12.2 contrast matrix recomputed and every text pair at 4.5 : 1); §3.2 type (resolve DQ1: the deck's Shippori Mincho and Atkinson Hyperlegible pairing, or Young Serif as written; the one-font-file rule kept or consciously relaxed); §4 materials and lights (the render style of explorations §16: flat matte colour, one hard cel shadow, a toon ramp, whether an outline pass is taken, an emissive rule for the one soft glow point, no post-processing); §5 generator (the `element` draw and element part sets of explorations §12 as the four element critters of §16, the mouth of Game Design G5, the render spec), which changes generator output and therefore needs `GEN_VERSION` `"2"` and a decisions line per D8; §9 the arrival illustration (the round-window interior of explorations §15); §14 the decisions and the resolved DQs. Cost the outline pass and the glow against Game Design §6 in one table.
2. Render the proposal as a static page under `docs/explorations/`: the revised tokens, the type, four generated critters (one per element) as portraits at the §5.7 sizes, and a scatter cell and a results row in the new tokens. No app code changes yet.
3. Present the diff and the page to the reviewer and stop. Do not begin half two until the reviewer answers. Record the answer as a decisions line and, if approved, apply the diff.

## Half two: deep polish

Outcome: every screen matches the settled document, and the accessibility and performance bars are met.

- Tokens: `tokens.css` and `tokens.ts` generated from one source; no colour, size, radius, shadow or duration in a component that is not a token.
- Generator: `GEN_VERSION 2` with the element draw; fixed-seed tests re-pinned; the portrait and the mesh updated together so a critter is the same critter in both views; the deck's four element portraits are the reference for what reads as earth, water, fire and air.
- Components: every entry of Design System §7.1 has every state it lists, in token values; the heap and the hop of §7.4 feel like §1 describes; `Chip`, `Notice`, `Switch` and `Button` variants match; `<dialog>` is native.
- Screens: every row of §9 checked against a screenshot at 375 px and 1,280 px, in 3D and Simple view, with reduced motion on and off.
- Motion: Design System §3.6 tokens and Game Design §8 in the DOM; the bump, chew, wake and feast timings of Game Design §3–§4 in the canvas, with the sim tests still green.
- Copy: an audit of every string in `copy.ts`, every `aria-label`, every `<title>` and every error against §10.1 and the banned list; nothing inline; plurals through `Intl.PluralRules`; deadlines through `Intl` per §8.
- Accessibility: axe in CI on every route (one dev dependency, with a decisions line); the §12 structure, contrast, target, keyboard, focus, announcer and forced-colours rules met; Lighthouse accessibility ≥ 95 on the scatter pass and the results; the §12.8 "still required" list done where a desktop can do it, with the VoiceOver and TalkBack passes filed as `needs-human` with the script to run.
- Performance: `npm run build` inside Technical Spec §17; the arrival and read routes load no `three`; the degradation ladder observed on a throttled profile; the Game Design §6 frame budget measured on the slowest desktop profile you can emulate, with the phone measurement filed as `needs-human` (GQ3).
- The rehearsal: Game Design §10 turned into a checklist document with the exact steps and expected observations per line, ready for real phones.

## Facts and assumptions

Verified: phases 2 and 3 are merged; `npm run e2e` is green; the tokens are still the pre-revision values; the generator is at version 1 with fixed-seed tests.

Assumed: the reviewer will pick the direction that converged (explorations §16: spirit critters with the reference painting's surface; earth is a large squirrel, water a turtle, fire a phoenix chick, air a flying lemur). If the answer differs, half two follows the answer.

## Scope

In: everything above. Out: any change to `packages/core` outside the generator; the API; the tally; the Koota systems' logic (timings are constants in `feel.ts`; logic is not); new dependencies beyond the axe runner; new features; a dark theme (D1 stands, DQ2 stays deferred unless the reviewer says otherwise); production configuration (M6 becomes a `needs-human` list you write, not a thing you do).

## Method

1. Half one uses the `research` skill for anything that needs a primary source (OKLCH conversion, contrast maths, toon-ramp and outline-pass costs) and `humanize-writing` for the document prose. If `frontend-design`, `design:design-critique` and `design:accessibility-review` are available, run them on the rendered page before presenting it.
2. Half two: `/to-tickets` from the outcome list into GitHub issues; `/implement` per ticket on `phase-4/<slug>` branches; `/tdd` where a seam exists (the generator, the token generator, the CSV, the ladder); visual work verified with screenshots in the browser preview, not by assertion. Load `modern-web-guidance` before any HTML or CSS work. `/code-review` before each PR, the Spec axis against the settled Design System. Push and open PRs with `gh`; do not merge.
3. Nothing here changes a rule. If polish reveals a rule problem (a state the spec never named, a missing copy ID), it becomes a decisions line or a `needs-human` issue, never a quiet fix.

## Rules that bind here

- AGENTS.md in full. Change a token, not a component. Honey is only ever a crumb (D3, D5). Text is only ever Burrow, Soil, Bark, Moss-ink or Clay-ink, or their successors in the settled palette. Nothing in the DOM has a square corner.
- The generator changes only through the version bump the reviewer approved; once it lands it is frozen before the rehearsal.
- Every sound cue keeps its DOM pair. Reduced motion and Still critters stay at least as strict as Design System §3.6 and Game Design §3.5.
- No exclamation marks; no apologies in errors; every error that could make someone fear loss says what was not lost.

## Evidence

Half one: the diff, the rendered page, the cost table, the contrast matrix.

Half two, per PR and in the handoff:

```bash
npm run check
npm run build
npm run e2e
npm run a11y
```

`a11y` is the axe-over-every-route script you add. Plus: the screenshot matrix (screen × viewport × view × motion), the Lighthouse scores, the chunk sizes, the copy audit, the rehearsal checklist document, and the `needs-human` issues for phones, VoiceOver, TalkBack and M6.

## Stop conditions

Stop at the checkpoint after half one, whatever else is ready. Stop and report if the settled palette cannot reach 4.5 : 1 on a text pair without leaving the direction; if `GEN_VERSION 2` cannot keep portrait and mesh in agreement; or if an AGENTS.md rule would have to be broken.
