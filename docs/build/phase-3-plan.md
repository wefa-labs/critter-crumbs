# Phase 3 preflight and proposed tickets

Current implementation and validation status: [Phase 3 handoff](phase-3-handoff.md). The approved plan below is preserved; ticket15 remains open for blocked automated browser proof and integration.

Prepared and **approved by Afolabi on 2026-09-06**, including the numbered breakdown and named test seams. Implementation has started against verified merged main. GitHub publication is pending task write access.

The scope is a complete people/options feast in a local mock browser: connect, gather, read, scatter, open locally, export, and review the result. Creator-authorized removal with visible history is included. The reviewed core, GEN_VERSION 1, and the 49-target limit remain fixed inputs.

## Integration verified; implementation in progress

PR #27 was merged on 2026-09-06 at b6602318d987aff7068e5a7394e1a37229496bc5. The merge has both the old main and exact reviewed head as parents. Main CI passed: https://github.com/wefa-labs/critter-crumbs/actions/runs/34019546451/job/101449458779. The API workspace, 49-target/4096-byte limits and capacity research are present.

The original checkout remains unchanged at 6108ca2 because its Git metadata is read-only even with escalation. The task's limited network mode also blocks Git protocol requests and issue POST. A permitted archive GET supplied the merged source; all 305 files were checked against GitHub's blob hashes. Implementation runs in the isolated source snapshot at /Users/afo/Code/wefa/critter-crumbs/.scratch/phase-3-work. Git commits, pushes and issue/PR publication remain pending write access. No TLS verification or permission safeguards were changed.

The 15 approved tickets are retained individually in the configured local fallback at .scratch/phase-3/issues/. Current bodies and comments of issues #16–#20 were read; #16 remains the creator-removal requirement, while #17–#20 concern separate human/live-service work. No parent issue was modified.

Bun 1.4.2 and Node 22.22.1 are verified. The unchanged baseline passed 336 tests in 39 files, nine tooling tests and the development-assets test. The workspace packaging probe passes with a task-local Bun cache. Tickets 01–02 add 31 passing headless world tests and have completed Standards and Spec review, including regression fixes. Local checks pass through tests, workspace packaging, archive integrity and licences; the final npm vulnerability-audit POST is blocked by limited network mode. Ticket 03 portraits/tokens/ticker are implemented and undergoing browser verification/review. The standalone Chromium runner cannot launch under the macOS process policy even after escalation; supported in-app browser checks are recorded separately from unrun Playwright tests.

## Game Studio routing and research

The user supplied the full `game-studio:game-studio` umbrella skill. Its applicable track is **React-hosted 3D with a complete DOM/SVG first version**: the existing React/Vite, Koota and R3F stack settles the engine choice. There is no reason to add Phaser or replace the core.

Game fantasy and verbs remain the specification's: meet a critter, write, read, give, take back, pour, scatter, and see a shared feast. There is no score, progression, reward loop or competitive failure state. Each visit is a short task within a feast lasting days; reading time is unbounded. Preserve the 100-crumb pour at 3.3–3.5 seconds and the eight-critter feast at 6.0–6.6 seconds. Network failure preserves local edits while the server's deadlines continue.

Use these named Game Studio specialists in the tickets below:

| Key | Skill | Concrete use |
|---|---|---|
| F | `game-studio:web-game-foundations` | Simulation/render separation, input ownership, host lifecycle, debugging and performance seams |
| R | `game-studio:react-three-fiber-game` | React integration, one canvas, stage views, imperative Rig application and resource lifetime |
| U | `game-studio:game-ui-frontend` | DOM shell, controls, screen states, responsive layout and accessible feedback |
| P | `game-studio:game-playtest` | Repeatable interaction scripts, screenshots, keyboard proof and measured browser review |

The installed specialist, modern-web-guidance, humanize-writing and agent-instructions files were inaccessible during the first preflight, even after an escalation attempt. After the permission refresh, all four Game Studio specialists above and those three local skills were read. Their applicable guidance is reflected here: simulation outside React/renderers, one canvas, explicit input actions, DOM controls, stable asset keys, and screenshot/interaction/performance proof. The project's procedural primitives, no-physics/no-postprocessing rules and specified shell take precedence over generic starter suggestions. The supplied umbrella and repository research, codebase-design and to-tickets skills were also applied; the research skill explicitly requested the background V5/V7 researcher. Retrieve applicable local modern-web guidance before UI/browser implementation. Reconcile the existing build prompt with the supplied start prompt after integration; do not use the older prompt's permission to stub a missing trust seam.

The [V5/V7 research](../research/phase-3-v5-v7.md) records pinned-source evidence, executable probes and the measured-browser protocol. Key findings:

- **V5:** Koota 0.6.6 accepts world traits in `useTrait`. Keep Clock, Phase, Settings and Viewer on the world; no App entity is required. A server-rendered hook probe does not replace a mounted-browser subscription test.
- **Relation lifetime:** the specified `FlyingTo(critter)` with `autoDestroy: 'target'` destroys the Critter when the Crumb is destroyed in pinned Koota. Propose the narrow spec correction to `'source'`, with both destruction directions tested. Keep the trait name and all core exports.
- **Ticker:** R3F's `useFrame` callback is not a raw rAF timestamp, and its clock resets when frame-loop mode changes. Both ticker hosts must use one consistent injected time origin and transfer ownership without double ticks or elapsed-time jumps. No system reads a wall clock, and simulation time never selects a feast phase.
- **V7:** View is a candidate, not a performance pass. Test 6, 10 and 49 targets, 375 px and desktop, scroll/resize/expanded statements, a pour, feast hops, context loss and host transfer. Count draw calls across every stage render, not just the last render. A throttled desktop is screening evidence; it cannot certify the actual phone/GPU floor.

An additional arithmetic probe found that Game Design §3.4's worked decimals do not all follow its formula. With the frozen `GROWTH` constants, equal shares give fed `0.5029733718731741`, scale `1.176040680155611`; 60% of four gives fed `0.9698474422447793`, scale `1.3394466047856728`; 5% of ten gives fed `0.29906975624424414`, scale `1.1046744146854854`. Propose correcting the explanatory examples and testing independent formula-derived values. Do not tune `feel.ts` to match mistaken examples.

Other interpretation points are explicit in the ticket acceptance criteria: Game Design's stricter four-draw-call budget applies; arrival and read routes make no 3D request despite older prewarming prose; results are available throughout the feast; and the named headless Readable window includes the settle lighting interval. Reduced-motion timing conflicts between the general DOM token rule and the specific frozen Game Design crossfades must be reconciled in documentation before the relevant implementation, preserving the reviewed feel values.

## Named interfaces for approval

Apply the repository's codebase-design skill: concentrate behavior behind these interfaces, with tests crossing the same seams as callers.

| Module / seam | Contract and proof |
|---|---|
| World | `createWorld`, `tick(now)`, the named traits, and Game Design §7.3 actions. Inputs include ordered identity/target data and injected output adapters. No DOM, WebGL, network, audio context or React is needed to run its tests |
| Actions | `giveCrumb`, `takeCrumb`, `startPour`, `stopPour`, `setCount`, `beginFeast`, `skipFeast`, `replayFeast`, `setSettings`; counts and pile remain consistent, no own-person scatter, complete allocations only at submission |
| Tick pipeline | `clock → input → pour → pile → feast → expression → rig → flight → sound → render3d → render2d → sweep`. Retain all slots; headless adapters collect effects or do no rendering. No second scheduling loop inside a system |
| Renderer adapters | SVG and Three.js consume the same Rig and core `layout(params)`. React owns mounting and network-scale state; frame writes and resource cleanup live behind adapters. Neither renderer computes counts, phases, signatures or a tally |
| Ticker host | One active host, stable timestamp units/origin, dt capped at 50 ms, no hidden-tab catch-up pour, clean 2D↔R3F transfer and demand-frame invalidation after input |
| Screen selection | Core `phaseAt(feast, serverNow)` with the core API client's trusted time. Before the first stamped response, time is unknown. Polls/external dev time changes invalidate cached GETs |
| Portrait | Pure parameters/layout-to-SVG-element construction, with independent fixed seeds, part coverage and accessible-role contracts; never serialized SVG injected as markup |
| Hop scheduler | Tap/reverse/release events, feed-order scheduling, at most 60 animated DOM nodes, still/reduced-motion suppression and cleanup |
| Sound tokens | `(ctx, destination, params)` with injected variation and schedule inputs; OfflineAudioContext proves duration/peak, discrete-to-pour crossfade, pitch, silence and event consumption |
| Removal | Existing API handler seam with fake requests, injected time and the existing prepared SQL/revision adapter. Test authorization, atomic history, retry identity, re-admission and deadline races; DOM tests exercise the same action |
| CSV | Pure writer consumes core tally rationals and target metadata; aggregate columns and six-decimal shares, escaping, Unicode, empty options addresses and allowed giver matrix |
| Degradation | Pure sample/time-driven state machine; prescribed thresholds, visibility pauses, context lifecycle and Simple view choice; renderer recreation must retain the world |

Preserve `canonicalJSON`, the validators, account/timelock/EAS seams, pure tally, public exports, copy IDs, feel values and GEN_VERSION 1. UI formatting does not alter tally rationals or hashes. The server receives signed ciphertext and never receives an allocation or computes a result. Narrow shared/API additions need public-seam regressions and a decisions entry. No new dependency is proposed; any later addition, including test tooling, needs the repository's dependency decision and checks.

## Approved ticket plan

Numbers below are planning identifiers, not GitHub issue numbers. All tickets have two common gates: **plan approval (complete) and verified integration (complete)**. Dependencies list actual delivery prerequisites; the working order also preserves the supplied outcome sequence. Final lifecycle verification is accumulated per ticket, not deferred until the last ticket.

### 01 — A held press empties a deterministic pile

**Blocked by:** common gates only. **Milestone:** M0. **Skills:** F, R; codebase-design, tdd, code-review.

Deliver a headless world and replayable action script with the named entities/traits, twelve ordered system slots, input, pour and pile behavior. This foundational slice is verified without a browser, as the start prompt requires.

- A 100-crumb press/hold empties in 3.3–3.5 s; release, pointer-cancel-equivalent and control exit stop immediately, within the one-crumb bound.
- Plus and minus share the scaled curve; keyboard repeats do not control it; typed counts clamp safely; own people targets are ineligible.
- Pile-empty and wall events have the specified multiplicity; no negative counts, missing crumbs or silent event leaks. Identical actions/timestamps reproduce identical traits/events.
- Freeze the world and output-adapter interfaces. Preserve unimplemented renderer slots as headless adapters, not fake UI behavior.

### 02 — The headless feast wakes, feeds and settles in order

**Blocked by:** 01. **Milestone:** M0. **Skills:** F, R; codebase-design, tdd, code-review.

Complete expression, rig, flight, the director and event lifetime so the entire world is verifiable before portraits begin.

- Eight critters reach Readable in 6.0–6.6 s; skip within 200 ms; still/reduced motion takes the specified single crossfade; larger feasts cap at 8 s.
- Feed in grid order, support replay/nobody/one/ties, and never express sadness. Results passed to the world are core tally outputs, not a substitute tally.
- Correct and document FlyingTo cleanup; destroying a Crumb preserves its Critter, while removing its target leaves no orphan flight.
- Correct the arithmetic examples without changing GROWTH; test independent growth/mood values, bump restart, chew release and event token/pitch order. Complete every Game Design §7.5 case.

### 03 — Every critter has a working Simple-view portrait

**Blocked by:** 02. **Milestone:** M0. **Skills:** U, R, P; codebase-design, tdd, code-review.

Render frozen generator identities as SVG elements and apply the world's Rig through the 2D adapter, with a development preview driven by real core-generated identities.

- Core layout proportions, all shape/ear/marking variants, asleep/awake/fed states, feet anchor, 40/64/96 px and stage sizes; independent portrait fixtures.
- Standalone role/title versus decorative portrait behavior; no injected markup.
- One token source generates CSS and TypeScript. Ship the current design tokens and self-hosted font; no Phase 4 redesign or generator change.
- The rAF host supports demand input, hidden-tab pause and cleanup. OS/stored motion choices are read before animated output begins.

### 04 — Connect, meet a critter and enter a burrow

**Blocked by:** 03. **Milestone:** M1. **Skills:** U, P; codebase-design, tdd, code-review.

Build the real shell and first lifecycle routes: arrival, connection/profile, re-roll/keep, home, burrow creation, add/join/leave and empty/unknown states, against the existing mock API.

- Use Account/AccountProvider and the existing session flow. A dev-only provider uses the core local account adapter and shares the dev endpoints' enablement/mock/non-production gates; deterministic keys stay out of production paths.
- Both deadlines, trusted-time screen selection, skip link, route title/main focus and exactly two atomic announcers. Native dialogs restore focus.
- A mounted React test proves world-trait changes/removal update the DOM and subscriptions clean up; the preflight's server-rendered probe alone is insufficient.
- Pre-added admission, four total re-rolls, multi-burrow identity, active versus historical membership, and current 49-target/capacity behavior remain intact.
- Exercise E4, E10, E16–E19, E22; two local accounts can create/add/join/leave. Arrival requests no three chunk.

### 05 — The burrow creator removes a member with visible history

**Blocked by:** 04. Current issue #16 has been reconciled with this scope. **Milestone:** M1. **Skills:** U, P; codebase-design, domain-modeling, tdd, code-review.

Deliver the full removal path: database, authorized API, additive shared contract/copy, creator control and a durable history list visible to remaining members. Track this as a child/follow-up of #16; do not close or modify the parent as part of publishing the plan.

- Only an authenticated active **burrow creator** may remove another member. Feast creation does not confer this power. Self-leave keeps its distinct existing action and authority checks.
- The visible record includes stable event identity, actor, removed address, action and server timestamp in stable order. It survives reload, restart and re-admission; mutable profile names do not erase the address-based history.
- Removal and history insertion commit atomically through the existing revision guard. Failure leaves neither half committed. Repeated and concurrent first requests produce one event/effect for the logical operation.
- Preserve statements, accepted sequences, frozen participants/targets, close records and results. Materialize due freezes/closes before the membership change using fresh injected time on retry.
- Test just before, exactly at and just after gathering freeze, and after close; include the first request materializing the deadline, too-few people, overlapping feasts and concurrent add/leave/remove/freeze/close.
- Re-admission retains existing any-member-add/pre-added-join semantics; no ban, approval queue or reset of history. A delayed old retry after re-admission must not remove the new membership episode.
- Add canonical copy IDs and a narrow decisions entry. Review creator terminology in the glossary/spec with the domain-modeling skill.

Proposed retry interface: a logical operation ID plus an expected membership episode/version, with a durable receipt scoped to burrow/actor/operation. An identical retry returns the original record; reusing an ID for different content fails. A new stale operation for an older episode also fails. Advance the episode only when re-admitting an inactive member, preserving existing joinedAt semantics. This addition must be reconciled with integrated #16 before its tests are written; it must not change scatter retries, which continue receiving new accepted sequences.

### 06 — Set up and open a feast with trusted deadlines

**Blocked by:** 04. **Milestone:** M2. **Skills:** U, P; tdd, code-review.

Create/save/open a real people or options feast with the current validators, privacy combinations, both deadlines and recoverable open state.

- Enforce three people minimum, issued crumbs bounds, duplicate/empty options and deadline order. Reuse MAX_FEAST_TARGETS and render `err.feastCapacity` at the integrated limits; never use the old 256-option rule.
- Registration failure stays a draft and uses the established recovery seam. Cancellation and the single gathering extension retain creator/phase gates.
- Implement E13, E24, E25 and setup/draft component states. Validate at the trusted timestamp, including capacity changes between form display and submission.

### 07 — Write privately, reveal together and read statements

**Blocked by:** 06. **Milestone:** M2. **Skills:** U, P; tdd, code-review.

Implement gathering for people and creator-authored options, then the reveal and read pass from the real phase-aware API.

- Plain text with line breaks, the core's 2,000-character counting convention, live counter and paste cap. Retain edits on failed writes. Do not expose others' text during gathering.
- One http(s) URL regex; element-created links, same-tab navigation, required rel values, 48-character visible URL limit. Test HTML-like text and non-http schemes as text.
- Reveal locks statements; missing statements do not block scattering. Read carousel supports buttons, arrows, Home/End and links without moving focus on snap.
- E8, E23, E27; reveal focus and announcement; no three request on arrival or read, including while idling or advancing cards.

### 08 — Scatter, replace and verify a complete allocation

**Blocked by:** 07. **Milestone:** M3. **Skills:** F, R, U, P; codebase-design, tdd, code-review.

Connect the completed world to the DOM grid, controls, heap/hops, number fields and real mock encryption/signing/submission.

- Every stage has data-critter-id; tap/hold, plus/minus and keyboard share actions. Native repeat is ignored; number keys and commit/revert match Design System §12.4. Own people critter stays asleep without controls.
- Heap shape/depletion and tap/reverse/release hops match the spec; pours use the Simple-view count pulse. Spend-all gates submission, not local editing. All 49 targets remain addressable.
- Position-ordered complete allocation uses canonicalJSON, the core Timelock and EAS signing. Respect 4096 ciphertext bytes; send no plaintext allocation to the server.
- Re-read to verify accepted UID/sequence before confirming; preserve local counts after rejected signatures, uncertain saves, offline transitions and session renewal. Show latest state across two tabs without inventing another sequence policy.
- E2, E3, E10, E12, E15, E19, E23, E26. Two clients submit, replace and observe participation using the real mock API. Late submission preserves the last accepted scatter.

### 09 — Each action has its specified sound and DOM reply

**Blocked by:** 08. **Milestone:** M3. **Skills:** F, R, U, P; tdd, code-review.

Implement the five Web Audio voices and complete token vocabulary, connecting the existing DOM states and world events to one audio graph.

- OfflineAudioContext tests assert duration and peak, seeded variation bounds, pitch steps, third-crumb crossfade, reverse/release behavior and reduced-motion damping. Continuous pour tokens are tested over bounded start/release sessions, not as finite one-shot tokens.
- One gesture-created/resumed AudioContext, 16 voices, 20 ms lookahead, independent 25 ms scheduler and correct visibility cleanup. Off still consumes events; navigation, deadlines and other specified silent states stay silent.
- Persist effects/ambience before first render; ambience defaults off and requests nothing until enabled after a gesture. The absent GQ1 bed stays an explicit placeholder path, not a falsely claimed finished asset.
- Feast tokens have offline fixtures here and gain their actual DOM integration in ticket 10. No audio library is added.

### 10 — Open the feast locally and show readable results

**Blocked by:** 09. **Milestone:** M4. **Skills:** F, R, U, P; tdd, code-review.

Implement waiting, key retrieval, local decryption and pure core tally, then play the completed director through Simple-view portraits and DOM hops.

- Two independent clients produce the same resultHash. Yield between decryptions; use local fixture failures for polling/direct-fallback behavior, with no live provider request.
- Results are in the DOM from the first sequence frame, skip always works, replay is available, and settled/skip/reduced-motion focus lands correctly. Handle nobody, one scatterer, ties and unreadable latest submissions.
- Check the viewer's accepted UIDs against the immutable close record; show the missing-UID evidence. Preserve non-scatterers as receivers and display participation plainly.
- E1, E5–E8, E11, E14, E28; cap hops at 60 concurrent nodes and preserve all 49 targets/order. Play the real paired feast sound events.

### 11 — Export and record the result through reviewed adapters

**Blocked by:** 10. **Milestone:** M4. **Skills:** U, P; codebase-design, tdd, code-review.

Deliver downloadable aggregate and allowed giver CSVs, the giver table, and the public result-recording screen against local/recorded Base Sepolia adapters.

- Aggregate columns are critter, address, crumbs, share. Use six-decimal shares derived from core rationals, ordinary CSV escaping, Unicode/newlines, zero results and empty option addresses. Preserve integer totals and stable target mapping.
- The giver matrix uses only the core tally's counted candidates and is shown/exported only when individual scatters are open to the burrow. No second tally implementation.
- Prepare through the existing EAS result seam, call Account.sendTransaction on the local/recorded chain-84532 adapter, verify the receipt through the established server reader, and show the first recorded result. Preserve public aggregate-null until a verified record exists.
- E20–E22; simulated rejected/failed transactions and two concurrent recorders leave completion available. No real transaction, live EAS execution or production configuration.

### 12 — Persist settings and keep Simple view usable through failures

**Blocked by:** 11. **Milestone:** M5. **Skills:** F, R, U, P; tdd, code-review.

Complete settings in the specified order and the tested renderer lifecycle/degradation state machine before optional 3D is integrated.

- Sounds, Burrow ambience, Still critters, Simple view; four existing storage keys; OS reduced motion cannot be overridden. Reopening honors choices before any motion or sound.
- Simple view completes the same lifecycle and retains allocations. Initial failure, module load failure, mid-session context loss, restore timeout and once-per-session retry follow E9.
- Test exact ladder thresholds with injected samples: >33 ms for 2 s; then >50 ms for 3 s; then >50 ms for 5 s, or un-restored context for 2 s. Announce only the final automatic transition once.
- Antialias changes require context/renderer recreation, not a mutable runtime flag; apply them only after confirming source behavior and preserve world/input state through that transfer.

### 13 — Measure the 3D stage approach before choosing it

**Blocked by:** 12. **Milestone:** M5. **Skills:** F, R, P; research, codebase-design, code-review.

Run a disposable, representative View prototype against the actual DOM stage contract and representative frozen-generator geometry. This is the V7 architecture gate, before committing production layout code.

- Follow the research protocol at 6/10/49 targets: scroll, resize, expanded statements, 375 px and desktop, representative pour and feast, hidden/offscreen transitions, forced context loss, and host transfer. Record browser, hardware, throttling, sample duration, frame percentiles, total draw calls/triangles, memory limits and load timing.
- Use the stricter scene budget: <=3,000 triangles per critter and <=30,000 per scene, <=4 draw calls per critter and <=40 plus one crumb call per scene, <=64 particles, <=60 DOM hops. Instrument across all View renders.
- Record the chosen budgeted mesh/instancing or portrait-retention policy explicitly: 49 maximum-detail meshes would exceed the unchanged scene budget. All 49 targets keep their DOM controls and participation in the feast; any added representation policy needs a decisions entry before production integration.
- Verify 60 fps desktop and screen the 30 fps phone floor; report idle GPU timing/memory as unverified where measurement APIs cannot establish them. No claim that CPU throttling reproduces the phone GPU.
- If View misses the budget, measure the specified single orthographic camera/pixel-mapped fallback under the same fixture. Preserve DOM layout and the complete 49-target allocation. If both fail, stop 3D work and report the cut-line decision; do not loosen rules or conceal targets.

### 14 — Add meshes behind the working portraits

**Blocked by:** 13 passing with a selected approach. **Milestone:** M5. **Skills:** R, U, P; tdd, code-review.

Integrate the proven approach as one lazy 3D entry: primitives from the frozen generator/layout, materials, three lighting presets, blob shadows, instanced crumbs and Rig adapter.

- One transparent decorative canvas, pointer events in the DOM, no text in WebGL. Meshes appear only on scatter/results; portraits are present first and remain mounted for loss/retry.
- Crossfade and tick-host transfer introduce no count loss, double input, time jump or extra context. Repeated mount/unmount and degradation dispose resources without losing the world.
- Prove continuous/demand/paused switching, context recreation, all stage rect changes and Simple-view choice on the integrated app. Do not assume the prototype's measurements apply to final meshes.
- Build measures <=120,000 gzip bytes for the shell and <=250,000 for three; crypto size reported separately. No arrival/read 3D request. Record time to 3D on a declared 4G profile.

### 15 — Prove the browser lifecycle and prepare the handoff

**Blocked by:** 05 and 14; if 3D is explicitly deferred under the cut line, 05 and 12 plus the recorded deferral replace 14. **Milestone:** M5. **Skills:** P, U, R when 3D ships; code-review, handoff.

Complete Technical Spec §14's script for people and options using isolated local accounts: seed, connect, statements, dev-clock advance, scatter/replacement, close, release key, independent hashes and CSV download. Include removal/history and privacy/capacity regressions.

- Run at 375 px in Simple view and 3D when shipped; save lifecycle screenshots or recording. Complete a keyboard-only pass, reporting pass/fail for every Design System §12.4 row.
- Prove fresh arrival/read sessions never request three; Simple view reaches the same results. Cover reduced motion, 200% zoom, 320 px reflow, offline/uncertain-save recovery and 49-target controls.
- Run per-screen accessibility checks and Lighthouse accessibility >=95; any needed new test dependency first gets a decision. Distinguish automated/browser evidence from the still-required VoiceOver/TalkBack and real-phone feel checks.
- Preserve offline core tally and headless lifecycle coverage. Record every E1–E28 owner/result, named simulation evidence, measured chunks and desktop Game Design §10 findings. Keep phone-only checks explicitly outstanding.
- Handoff lists completed/open tickets, mock commands, evidence, #16 status, remaining live-service/asset work, PR bases and actual integration into main. Mock success is not production readiness.

Ticket 06 is not technically blocked by removal ticket 05; the planned order finishes the membership slice first, but independent setup work can continue if the removal implementation encounters a separate blocker. Final acceptance still requires issue #16.

## Coverage and acceptance

| Concern | Tickets |
|---|---|
| M0 world/portraits, all GD §7.5 tests | 01–03 |
| M1 identity and burrow; creator removal | 04–05 |
| M2 setup, gathering and read | 06–07 |
| M3 gestures, encryption/signing, saved state, sounds | 08–09 |
| M4 local feast/results, CSV and recorded result transaction | 10–11 |
| M5 settings, V7, 3D and lifecycle evidence | 12–15 |
| E1, E5–E8, E11, E14, E28 | 07 and 10 |
| E2, E3, E10, E12, E15, E19, E23, E26, E27 | 04, 07 and 08 |
| E4, E13, E16–E18, E24, E25 | 04–06 |
| E9 | 12 and 14 |
| E20–E22 | 04 and 11 |
| Final cross-flow edge verification | 15 |

Each implementation ticket uses the implement/TDD workflow, with tests at its named seam and DOM tests through roles, accessible names and states. Before each draft PR, run Standards review against AGENTS.md and Spec review against that ticket and cited sections. Use explicit `phase-3/<slug>` branches, explicit PR bases, draft status and `automated/codex`; do not merge. A stacked-parent merge does not prove integration to main.

Required evidence remains `bun run check`, `bun run test -- --reporter=verbose`, `bun run build`, and `bun run e2e`. Keep the verbose command's exit code and complete log before extracting pour, wall, feast, sound, growth and portrait cases. Early tickets run the meaningful available browser slices and mark the not-yet-implemented full lifecycle as pending; do not use a placeholder green E2E as completion evidence. The final ticket requires the full lifecycle.

## Proposed dates and assets

Targets start today and assume integration/access is resolved promptly; plan approval is complete. They are planning targets, not elapsed-time estimates or a production commitment: M0 Sep 6–7; **M1 Sep 8–11; M2 Sep 12–14; M3 Sep 15–18; M4 Sep 19–20; M5 Sep 21–25**. Any delay consumes the buffer before rehearsal; re-date rather than silently drop a mandatory slice. M4 here is mock/recorded app proof, not the Technical Spec's real-chain core milestone.

Append the dated schedule, plan approval and settled creator-removal authority to `docs/decisions.md` after the checkout update, without rewriting its history. Exact rows are staged in [the decision additions](../../.scratch/phase-3-preflight/decision-additions.md). The approved technical proposals still require their ticket's implementation and regression proof. A [replacement build prompt](../../.scratch/phase-3-preflight/phase-3-game.md), verified byte-for-byte against the user-supplied start prompt, is also staged for that gate. Existing tracked instructions and the decision history have not been overwritten before the safe checkout update.

Assets: use the current SVG portrait construction and procedural 3D primitives, not generated replacement identities or a GLB asset pipeline. Reuse `scene-day.webp` at under 120 KB for arrival. Keep current tokens/font until Phase 4. GQ1's ambient bed remains an explicitly unfinished placeholder; no commissioned/generated audio is assumed. No sprite, image-generation or 3D-asset dependency is needed for these tickets.

Asset sourcing, clarified after approval:

- Effects are authored in code with Web Audio's five specified voices, envelopes and token table. There is no downloaded sound-effects pack or audio library.
- Visual effects are the specified DOM/SVG hops, count pulses, Rig transforms and instanced 3D crumbs; they need no stock VFX pack.
- Critter portraits and later meshes derive from the existing frozen generator and shared layout. The existing arrival illustration is `docs/pitch/assets/scene-day.webp` (272,836 bytes before the planned resize), whose presence was verified. No new illustration is commissioned or generated by this plan.
- The optional ambience/music bed has no selected file or supplier. GQ1 still covers its authorship/source. Keep it off by default and identify the placeholder in the handoff. The current app public directory contains only `.gitkeep`; no sound or font asset is already shipped there.
- Young Serif remains the specified self-hosted font; obtain the actual font and retain its source/licence record when ticket 03 packages the initial assets. This is distinct from choosing a new visual direction.

The cut line is 3D and audio richness. Mandatory lifecycle, accessible Simple view, paired effects, CSV, removal/history and tests stay in scope. Any deferred ticket remains open with the reason and appropriate blocked status. Live Neon/Shutter/EAS execution, real transactions, production setup, Phase 4 redesign and generator changes remain outside this phase.

## Approval and next action

Afolabi approved this breakdown and its named interfaces on 2026-09-06, asking only for clarification of sound/music/initial-asset sourcing. That clarification is recorded above. Do not request the same plan or seam approval again.

The user subsequently requested full Phase 3 implementation and explicitly deferred sourcing more specific sounds and music. Keep the specified synthesized effects in scope and the optional ambience asset deferred.

After integration verification, publish one ticket per approved slice with `ready-for-agent` and native blocking links where available, then work the frontier without repeating routine permission requests. If the tracker is unavailable, preserve one file per approved ticket in the configured local fallback and report that it was not published. No ticket has been published and no parent issue changed. Integration, plan approval and issue reconciliation are complete. Implementation proceeds in the verified source snapshot; publication awaits task write access.
