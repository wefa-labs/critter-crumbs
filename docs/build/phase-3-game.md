# Phase 3 session prompt

## Starting point — verify before implementation

Work in `/Users/afo/Code/wefa/critter-crumbs`. The checkout was returned to clean `main` at `6108ca2`. The original Phase 2 core reached main, but PRs #21, #23 and #25 were merged into stacked parent branches and their changes had not reached main. Integration PR **#27** carries the exact reviewed head `16da73ca0f9b640ebde5d96a4779e507c9595782` into main:
https://github.com/wefa-labs/critter-crumbs/pull/27

First inspect the current working tree, fetch main and fast-forward only if safe. Verify #27 is merged and its changes are present on main, including tracked `packages/api/src/index.ts`, `packages/shared/src/limits.ts`, the 49-target validator and hidden-property canonical JSON regression. Check current CI. If ancestry was rewritten, verify the equivalent file content rather than assuming the old SHA must remain an ancestor. If integration is still pending, report it and continue only independent research/planning; do not begin app implementation against the older core. Do not merge #27 yourself under this prompt.

The reviewed source head passed 336 tests across 39 files, 9 tooling tests, full check/build, and separate Standards/Spec reviews with no findings. One initial verbose-run timeout passed unchanged in a full rerun and is recorded in #25. Rediscover current results instead of treating these counts as permanent acceptance criteria.

Use Bun 1.4.2 and Node 22.22.1 throughout; these override older npm examples in build documents. This prompt updates the existing `docs/build/phase-3-game.md` for the merged core and settled user decisions. Applicable AGENTS.md instructions and canonical specs remain authoritative.

You are building the app of Critter Crumbs v0 on the core that phase 2 delivered: the Koota simulation, the critter portraits, every screen of the lifecycle, the heap and the hop, the sound vocabulary, the feast, and then the 3D layer behind the portraits. At the end a burrow can run a whole feast in mock mode in a browser, and the same lifecycle runs in Playwright. Use the applicable game-studio React Three Fiber guidance for the simulation, input, director and rendering. Read modern-web-guidance before UI and browser work, and use the repo skills for research, module design, tickets, TDD and review.

Read `AGENTS.md`, `CONTEXT.md`, `docs/build/README.md`, then all of `docs/03-game-design.md`, then `docs/02-design-system.md` in full, `docs/01-prd.md` §6–§9, `docs/04-technical-spec.md` §1, §12, §14, §15, §16 column B, §17 and §18 (V5, V7), the ADRs, `docs/decisions.md`, `docs/research/`, and `docs/build/phase-2-handoff.md`, `docs/research/scatter-capacity.md`, and issues #16–#20 (read their current status). `packages/shared` and `packages/core` are the contract: preserve their exports, copy, feel values and frozen GEN_VERSION 1. Reuse MAX_FEAST_TARGETS (49), MAX_CIPHERTEXT_BYTES (4096), canonicalJSON, phaseAt, the account/timelock/EAS seams and pure tally. Narrow additive API/shared changes needed for issue #16 require regression tests and a decisions line; do not replace established modules.

## Outcome

Technical Spec §16 column B (app), M0 through M5, built in this order, each slice demoable before the next starts:

1. **The world.** The Koota world of Game Design §7: the entities and traits of §7.2 under those names, the twelve systems of §7.3 in that order run by one `tick(now)`, the actions of §7.3, the ticker hosts of §7.4, and the headless tests of §7.5 (pour timing, the wall, the feast reaching Readable, the sound-event sequence, growth and mood matching §3.4's worked values) with no DOM and no WebGL. Check V5 first (does `useTrait` accept world traits; if not, the `App` entity).
2. **Portraits.** The 2D portrait of Design System §5.7 as a pure function from the generator's parameters (phase 2's `layout` step) to SVG, built from elements, never markup strings; the `render2d` system writes `Rig` into CSS custom properties on it. Sizes and `role="img"` rules per §5.7.
3. **The shell and the screens.** The §6.2 page shell, the routes, the two announcers and the focus management of §12.5–§12.6, the `DeadlineStrip` of §8, and every screen and state of the §9 table, built from the §7.1 component inventory with the state names it uses. All copy from `copy.ts`. Setup and membership controls must respect the 49-target limit and render `err.feastCapacity`. The burrow and setup edge states E4, E13, E16, E17, E18, E24, E25 wired to their copy IDs.
4. **Gathering and the read pass.** `StatementEditor`, `StatementText` (one regex, `https?://` only, links as elements), the reveal moment of Game Design §4.1, the read pass carousel of §6.4.
5. **The scatter pass.** The grid and the stage contract of §6.3 with `data-critter-id` on every stage; `ScatterControls`, the number field, the keyboard rules of §12.4 and Game Design §2.3; the heap and the hop of §7.4; the pile bar; the own critter asleep; participation; the signing step and the done state; E2, E3, E10, E12, E15, E19, E23, E26, E27 wired to their copy IDs.
6. **Sound.** The five voices and the token table of Game Design §5 with the implementation notes of §5.7; every token a pure function tested in an `OfflineAudioContext` for duration and peak level; the hold crossfade and the pentatonic pitch of §5.3; the toggles and persistence of §5.6, read before first render; every cue paired with the DOM state the table names, and nothing else makes a sound.
7. **The feast, in Simple view first.** The waiting screen, the director of Game Design §4.2 driving DOM hops (G6), the results of Design System §6.5, the CSV of PRD P4, the giver matrix, the record-on-chain flow against the core's result attestation (Base Sepolia only, behind the account's `sendTransaction`), and E1, E5–E8, E11, E14, E20–E22, E28.
8. **Settings and Simple view as a choice.** Design System §13 order, D9, D10; the fallback rules of §11 including mid-session loss (E9).
9. **The 3D layer, last.** One canvas, drei `View` per stage (check V7 against the Game Design §6 budget on a throttled profile; the fallback is one orthographic camera with pixel-mapped positions), meshes composed from primitives per Design System §5.3 inside the triangle and draw-call budget, the materials and lighting presets of §4, the crumb instances, the `render3d` system, lazy loading from a single entry module (Technical Spec §17), the portrait-to-mesh crossfade, `frameloop` switching, the degradation ladder of Game Design §6. Portraits render first on every stage, always.
10. **E2E.** Playwright in mock mode running the script of Technical Spec §14 in full, through a dev-only account provider (the core's private-key adapter, gated the same way as the dev endpoints), plus assertions that the arrival and read routes never request the `three` chunk (Design System D6) and that Simple view completes the same lifecycle.

## Membership follow-up included in this phase

Read issue #16 before implementing the membership screens. Only the **burrow creator** may remove another member; remaining members must see a durable, explicit removal record. This authority decision is settled. Implement the narrow API/data/shared support and its UI as a tracked vertical slice. Removal is distinct from self-leave. Preserve membership history through re-admission, frozen participants, statements, accepted sequences, close records and results. Removal and its visible record must be atomic and retries idempotent. Test before, at and after freeze, after close, re-admission and concurrent first requests through the agreed API seam. Preserve existing admission semantics; do not invent a ban policy. If an additional product decision is truly required, isolate it and continue independent work.

## Facts and assumptions

Verified at the reviewed Phase 2 head, subject to the integration check above: the API runs locally in mock mode with seeded feasts in any phase; `copy.ts` carries every ID; `feel.ts` carries every constant; the lint rules for `innerHTML`, wall-clock reads, import direction and inline strings are on. The phase 2 handoff has the exact commands.

Assumed: V5 and V7 are open; the ambient bed file does not exist (GQ1 is open), so the ambience toggle points at a placeholder path and the handoff says so; the arrival illustration is `docs/pitch/assets/scene-day.webp` resized under 120 KB until phase 4 replaces it; the design tokens are the current Design System §3 values, which phase 4 will revise, so nothing here hard-codes a colour, size or duration outside `tokens.css` and `tokens.ts`.

## Scope

In: the Outcome and issue #16. App work lives in `packages/app`; server implementation lives in `packages/api/src`. Root `api/` contains Vercel route exports only. Shared/core changes must be narrow, documented additions or fixes with public-seam regression tests. If the UI lacks a core seam, record the gap; never substitute fake phases, signatures or results.

Out: phase 4 visual redesign, generator changes, production configuration, real chain transactions, and live Neon/Shutter/EAS execution without separate authorization. Implement the Base Sepolia result-recording flow against recorded/local adapters; a real recording is a separately authorized rehearsal. Do not let mainnet Shutter access or hosted setup block local mock development. Contract tooling continues to use Foundry and encrypted keystore accounts; never request a raw deployment private key. Public deterministic test keys remain dev/e2e-only.

## Method

1. Day one: verify V5 with `$research`; research V7 and plan its measured browser proof before committing to the 3D layout; `$codebase-design` for the world module (its interface is `createWorld`, `tick`, the actions and the trait names; everything else is internal) and for the two renderers over `Rig`.
2. `$to-tickets` from §16 column B and the order above: tracer bullets with blocking edges, GitHub issues labelled `ready-for-agent`. Include issue #16 with its blocking edges. Re-date M1–M5 from today into `docs/decisions.md`. Present the ticket plan and named test seams for approval before implementation. The earlier eleven-ticket approval applied to Phase 2 only; after the Phase 3 plan is approved, work its frontier without repeatedly asking for routine implementation permission.
3. `$implement` per ticket on `phase-3/<slug>` branches. `$tdd` at these seams: `tick(now)` and the actions (Game Design §7.5 is the test list), the sound tokens, the portrait function, `phaseAt`-driven screen selection, the CSV writer, the hop scheduler, the degradation ladder's state machine. UI components are tested through their DOM contract (roles, names, states from Design System §7.1), never through internals.
4. `$code-review` before each PR: Standards against `AGENTS.md`; Spec against the ticket, the Design System section and the Game Design section it cites. Push and open PRs with `gh`, ready for review after the checks and both review axes pass. Do not merge. Keep each PR base explicit; a merge into a stacked parent is not proof that the code reached main. The final handoff must verify the complete implementation is integrated or identify the remaining integration PR.
5. Cut line if time runs out (PRD P5): slice 9 and the richness of slice 6 are the flex. Slices 1–8 and 10 are not. If you cut, the handoff says exactly what, and the ticket stays open, labelled `blocked`, with the reason.

## Rules that bind here

- AGENTS.md in full. The DOM owns layout; the canvas only draws critters into stage rects; text never renders in WebGL. Every sound cue pairs with a DOM state. Portraits first, 3D later; Simple view is not an error path. No `Date.now()` or `performance.now()` inside logic; systems read `Clock` only.
- Game Design numbers ship as written and are tuned only in the rehearsal. If you must change one, change `feel.ts` and the document in the same commit with a decisions line.
- No sad critters (G4); the feast feeds in grid order (G3); no confetti, spotlight or leaderboard (§4.3).
- The banned words never appear in a string, an `aria-label` or a `<title>`. Say "connect".
- Budgets are enforced: `bun run build` fails over Technical Spec §17; the sim tests fail if the pour or the feast leaves its timing window.

## Evidence for each pull request, and for the handoff

```bash
bun run check
bun run test -- --reporter=verbose
bun run build
bun run e2e
```

Keep the full verbose log and extract the named pour, wall, feast, sound, growth and portrait cases without masking the test command exit status. Preserve the Phase 2 tally and headless lifecycle coverage. `bun run test` stays offline; Playwright may use the local mock app/API and local fixtures, with no live provider calls.

Plus: a recording or screenshots of the lifecycle on a 375 px viewport in Simple view and, if slice 9 landed, in 3D; the keyboard-only pass of the lifecycle (Design System §12.8 asks for it) written up pass/fail per §12.4 row; the measured chunk sizes; the Game Design §10 checks that can already run on a desktop, with their result.

## Stop conditions

Stop and report if the core lacks a seam the UI needs and stubbing it would hide a rule (never fake a tally, a phase or a signature); if V7 fails and the fallback also misses the budget; or if an AGENTS.md rule would have to be broken.

## Local mock workflow

After the integration check, use the Phase 2 handoff's commands from the repository root:

```sh
bun install --frozen-lockfile --ignore-scripts
SHUTTER_MODE=mock DEV_ENDPOINTS_ENABLED=1 LOCAL_API_PORT=4300 bun run dev:local
```

In a separate terminal:

```sh
LOCAL_API_PORT=4300 bun run seed --phase gathering
```

The handoff documents seeding other phases and the exact `/api/dev/time` and `/api/dev/release-key` requests. Use the API clock adapter for phase changes. Keep local dev controls disabled in production. Check existing processes before choosing ports and stop only processes started for this work.

## First response and completion

Begin with preflight findings, V5/V7 research and the proposed Phase 3 ticket plan with agreed seams. After approval, implement to the browser lifecycle and evidence above. The handoff must identify completed and unfinished tickets, exact local commands, test/browser evidence, measured budgets, issue #16's status, remaining human integration work, and PR bases/merge status. Do not claim production readiness from mock-mode proof.
