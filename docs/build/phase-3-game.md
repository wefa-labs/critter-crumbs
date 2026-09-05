# Phase 3: the game system and the first UI

Paste everything below the rule into Codex as the first message of the session.

---

You are building the app of Critter Crumbs v0 on the core that phase 2 delivered: the Koota simulation, the critter portraits, every screen of the lifecycle, the heap and the hop, the sound vocabulary, the feast, and then the 3D layer behind the portraits. At the end a burrow can run a whole feast in mock mode in a browser, and the same lifecycle runs in Playwright. Use your web game skill for the simulation, the input feel, the feast director and the audio; use the vendored skills for everything else.

Read `AGENTS.md`, `CONTEXT.md`, `docs/build/README.md`, then all of `docs/03-game-design.md`, then `docs/02-design-system.md` in full, `docs/01-prd.md` §6–§9, `docs/04-technical-spec.md` §1, §12, §14, §15, §16 column B, §17 and §18 (V5, V7), the ADRs, `docs/decisions.md`, `docs/research/`, and phase 2's handoff (linked from its last pull request). `packages/shared` and `packages/core` are the contract: their exports, `copy.ts` and `feel.ts` are inputs, not things to change.

## Outcome

Technical Spec §16 column B (app), M0 through M5, built in this order, each slice demoable before the next starts:

1. **The world.** The Koota world of Game Design §7: the entities and traits of §7.2 under those names, the twelve systems of §7.3 in that order run by one `tick(now)`, the actions of §7.3, the ticker hosts of §7.4, and the headless tests of §7.5 (pour timing, the wall, the feast reaching Readable, the sound-event sequence, growth and mood matching §3.4's worked values) with no DOM and no WebGL. Check V5 first (does `useTrait` accept world traits; if not, the `App` entity).
2. **Portraits.** The 2D portrait of Design System §5.7 as a pure function from the generator's parameters (phase 2's `layout` step) to SVG, built from elements, never markup strings; the `render2d` system writes `Rig` into CSS custom properties on it. Sizes and `role="img"` rules per §5.7.
3. **The shell and the screens.** The §6.2 page shell, the routes, the two announcers and the focus management of §12.5–§12.6, the `DeadlineStrip` of §8, and every screen and state of the §9 table, built from the §7.1 component inventory with the state names it uses. All copy from `copy.ts`. The burrow and setup edge states E4, E13, E16, E17, E18, E24, E25 wired to their copy IDs.
4. **Gathering and the read pass.** `StatementEditor`, `StatementText` (one regex, `https?://` only, links as elements), the reveal moment of Game Design §4.1, the read pass carousel of §6.4.
5. **The scatter pass.** The grid and the stage contract of §6.3 with `data-critter-id` on every stage; `ScatterControls`, the number field, the keyboard rules of §12.4 and Game Design §2.3; the heap and the hop of §7.4; the pile bar; the own critter asleep; participation; the signing step and the done state; E2, E3, E10, E12, E15, E19, E23, E26, E27 wired to their copy IDs.
6. **Sound.** The five voices and the token table of Game Design §5 with the implementation notes of §5.7; every token a pure function tested in an `OfflineAudioContext` for duration and peak level; the hold crossfade and the pentatonic pitch of §5.3; the toggles and persistence of §5.6, read before first render; every cue paired with the DOM state the table names, and nothing else makes a sound.
7. **The feast, in Simple view first.** The waiting screen, the director of Game Design §4.2 driving DOM hops (G6), the results of Design System §6.5, the CSV of PRD P4, the giver matrix, the record-on-chain flow against the core's result attestation (Base Sepolia only, behind the account's `sendTransaction`), and E1, E5–E8, E11, E14, E20–E22, E28.
8. **Settings and Simple view as a choice.** Design System §13 order, D9, D10; the fallback rules of §11 including mid-session loss (E9).
9. **The 3D layer, last.** One canvas, drei `View` per stage (check V7 against the Game Design §6 budget on a throttled profile; the fallback is one orthographic camera with pixel-mapped positions), meshes composed from primitives per Design System §5.3 inside the triangle and draw-call budget, the materials and lighting presets of §4, the crumb instances, the `render3d` system, lazy loading from a single entry module (Technical Spec §17), the portrait-to-mesh crossfade, `frameloop` switching, the degradation ladder of Game Design §6. Portraits render first on every stage, always.
10. **E2E.** Playwright in mock mode running the script of Technical Spec §14 in full, through a dev-only account provider (the core's private-key adapter, gated the same way as the dev endpoints), plus assertions that the arrival and read routes never request the `three` chunk (Design System D6) and that Simple view completes the same lifecycle.

## Facts and assumptions

Verified by phase 2: the API runs locally in mock mode with seeded feasts in any phase; `copy.ts` carries every ID; `feel.ts` carries every constant; the lint rules for `innerHTML`, wall-clock reads, import direction and inline strings are on. The phase 2 handoff has the exact commands.

Assumed: V5 and V7 are open; the ambient bed file does not exist (GQ1 is open), so the ambience toggle points at a placeholder path and the handoff says so; the arrival illustration is `docs/pitch/assets/scene-day.webp` resized under 120 KB until phase 4 replaces it; the design tokens are the current Design System §3 values, which phase 4 will revise, so nothing here hard-codes a colour, size or duration outside `tokens.css` and `tokens.ts`.

## Scope

In: everything under Outcome. Out: changes to `packages/core` or `api/` beyond additive fixes agreed in a decisions line (if the UI needs a seam the core lacks, file an issue and stub behind the interface); visual polish beyond the tokens and components as specified; the design revision; production configuration; the on-chain record on Base mainnet.

## Method

1. Day one: V5 and V7 with `$research`; `$codebase-design` for the world module (its interface is `createWorld`, `tick`, the actions and the trait names; everything else is internal) and for the two renderers over `Rig`.
2. `$to-tickets` from §16 column B and the order above: tracer bullets with blocking edges, GitHub issues labelled `ready-for-agent`. Re-date M1–M5 from today into `docs/decisions.md`.
3. `$implement` per ticket on `phase-3/<slug>` branches. `$tdd` at these seams: `tick(now)` and the actions (Game Design §7.5 is the test list), the sound tokens, the portrait function, `phaseAt`-driven screen selection, the CSV writer, the hop scheduler, the degradation ladder's state machine. UI components are tested through their DOM contract (roles, names, states from Design System §7.1), never through internals.
4. `$code-review` before each PR: Standards against `AGENTS.md`; Spec against the ticket, the Design System section and the Game Design section it cites. Push, open the PR with `gh`, do not merge.
5. Cut line if time runs out (PRD P5): slice 9 and the richness of slice 6 are the flex. Slices 1–8 and 10 are not. If you cut, the handoff says exactly what, and the ticket stays open, labelled `blocked`, with the reason.

## Rules that bind here

- AGENTS.md in full. The DOM owns layout; the canvas only draws critters into stage rects; text never renders in WebGL. Every sound cue pairs with a DOM state. Portraits first, 3D later; Simple view is not an error path. No `Date.now()` or `performance.now()` inside logic; systems read `Clock` only.
- Game Design numbers ship as written and are tuned only in the rehearsal. If you must change one, change `feel.ts` and the document in the same commit with a decisions line.
- No sad critters (G4); the feast feeds in grid order (G3); no confetti, spotlight or leaderboard (§4.3).
- The banned words never appear in a string, an `aria-label` or a `<title>`. Say "connect".
- Budgets are enforced: `npm run build` fails over Technical Spec §17; the sim tests fail if the pour or the feast leaves its timing window.

## Evidence for each pull request, and for the handoff

```bash
npm run check
npm test -- --reporter=verbose 2>&1 | grep -E "pour|wall|feast|sound|growth|portrait"
npm run build
npm run e2e
```

Plus: a recording or screenshots of the lifecycle on a 375 px viewport in Simple view and, if slice 9 landed, in 3D; the keyboard-only pass of the lifecycle (Design System §12.8 asks for it) written up pass/fail per §12.4 row; the measured chunk sizes; the Game Design §10 checks that can already run on a desktop, with their result.

## Stop conditions

Stop and report if the core lacks a seam the UI needs and stubbing it would hide a rule (never fake a tally, a phase or a signature); if V7 fails and the fallback also misses the budget; or if an AGENTS.md rule would have to be broken.
