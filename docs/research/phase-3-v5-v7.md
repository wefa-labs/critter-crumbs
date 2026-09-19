# Phase 3 preflight: Koota world traits and stage rendering

Verified 2026-09-06 against the installed versions and primary sources below. **V5 is resolved: Koota 0.6.6 supports `useTrait(world, Trait)`; keep the singleton world traits. V7 remains open: the stage API fits, but no browser or device performance measurements have been made.** This note proposes implementation seams and a measurement protocol for ticket approval; it does not approve or implement Phase 3.

## Evidence and version boundary

| Package | Installed and locked version | Primary version evidence |
|---|---|---|
| Koota | 0.6.6 | [Published metadata](https://registry.npmjs.org/koota/0.6.6), [published archive](https://registry.npmjs.org/koota/-/koota-0.6.6.tgz) |
| React / React DOM | 19.2.8 | [App manifest](../../packages/app/package.json) and installed manifests |
| React Three Fiber | 9.7.0 | [Published metadata](https://registry.npmjs.org/@react-three%2Ffiber/9.7.0); source revision `0a107412ac64667b1908422e859447952f57feef` |
| Drei | 10.7.8 | [Published metadata](https://registry.npmjs.org/@react-three%2Fdrei/10.7.8); source revision `ffa15b956e320391b0e86084cb58c8da0445abe3` |
| Three.js | 0.185.1 | [App manifest](../../packages/app/package.json) and installed manifest |

The three fetched Koota/Fiber/Drei metadata integrity strings match [bun.lock](../../bun.lock). Koota's version metadata did not provide a `gitHead`; its installed published code and versioned archive are the pin, rather than an assumed Git tag. Runtime probes used `/Users/afo/.bun/bin/bun` **1.4.2**. The normal Bun/Node shims failed with an operating-system permission error; no different Node version was substituted. No dependency was added or upgraded.

## V5: use the world traits

The installed `node_modules/koota/dist/react.d.ts` declares `useTrait<T extends Trait>(target: Entity | World | undefined | null, trait: T | RelationPair<T>): TraitRecord<T> | undefined`. Its published runtime, `dist/react.js`, recognizes a world, selects that world's internal singleton entity, and subscribes to matching trait add/change/remove events. Removal produces `undefined`; the hook also reads the initial value before its effect attaches. These are pinned-package facts, not an inference from the latest README. [Koota 0.6.6 archive](https://registry.npmjs.org/koota/-/koota-0.6.6.tgz), [installed declarations](../../node_modules/koota/dist/react.d.ts), [installed hook implementation](../../node_modules/koota/dist/react.js).

A local TypeScript and runtime probe passes for `useTrait(world, Settings)`: an initial server render reads `false`, a fresh render after `world.set` reads `true`, and a fresh render after removal reads `undefined`. **This exercises the hook's read path; server rendering does not run React effects, so reactive mounted-DOM updates and cleanup remain an implementation-ticket test.** The source explicitly supplies those subscriptions.

Reproduce the probe from the repository root; the scratch file is local and ignored:

```sh
/Users/afo/.bun/bin/bun node_modules/typescript/bin/tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 .scratch/phase-3-preflight/v5-koota-probe.ts
/Users/afo/.bun/bin/bun .scratch/phase-3-preflight/v5-koota-probe.ts
```

Both final commands exited 0. The second also verifies the relation issue below. [Local probe](../../.scratch/phase-3-preflight/v5-koota-probe.ts).

**Recommendation:** keep `Clock`, `Phase`, `Settings`, and `Viewer` on the world; keep `Heap` as an entity and all entity/trait names from Game Design §7.2. Do not add the fallback `App` entity. Subscribe React only to display-relevant values such as `Count`, `Pile`, `Phase`, and `Settings`; renderers read `Rig` directly. This preserves the documented simulation boundary and avoids a React render for every pose channel. World traits are excluded from ordinary queries. [Game Design §7](../03-game-design.md#7-simulation-model-koota), [Koota world-trait API](https://github.com/pmndrs/koota#world-traits).

### Required narrow correction: FlyingTo cleanup direction

Game Design §7.2 currently says `FlyingTo(critter)` has `autoDestroy: 'target'`. **At Koota 0.6.6, that destroys the critter when its flying crumb is destroyed.** The pinned runtime's `destroyEntity` queues relation targets when the source has this option; `'source'` queues sources when their target is destroyed. The runtime probe confirms all four cases:

| Configuration | Destroy the crumb | Destroy the critter |
|---|---|---|
| `autoDestroy: 'target'` | Critter is also destroyed | Crumb remains |
| `autoDestroy: 'source'` | Critter remains | Crumb is also destroyed |

Recommend correcting the document to `autoDestroy: 'source'` (the `'orphan'` alias has the same direction) in the world ticket, with a decisions entry and public world-seam regression cases. Preserve `FlyingTo`, `Crumb`, and `Critter`; no core-contract change is involved. [Installed destruction implementation](../../node_modules/koota/dist/chunk-ZWIGMIL4.js), [upstream relation documentation](https://github.com/pmndrs/koota#auto-destroy).

## V7: API fit is verified; cost is unmeasured

Drei 10.7.8 `View` tracks a DOM rectangle, configures viewport/scissor, and renders that stage through the shared WebGL renderer. Its defaults are `index = 1` and `frames = Infinity`: rectangle measurement continues on frames, and each visible stage invokes a separate `gl.render`. Offscreen checks can skip rendering, but do not eliminate every mounted view's subscription/measurement work. This meets the one-canvas stage model, but does not prove the ten-stage budget. [Pinned View source](https://github.com/pmndrs/drei/blob/ffa15b956e320391b0e86084cb58c8da0445abe3/src/web/View.tsx), [View usage](https://drei.docs.pmnd.rs/portals/view).

Do not apply `frames={1}` to the responsive scrolling grid without a rectangle-refresh strategy. The optimization assumes stationary bounds; expanding statements, font/layout changes, orientation, and scrolling invalidate that assumption. Start the proof with live tracking and measure its cost. Also test clearing old stage positions, canvas offsets, clipping, and pointer targets on scroll. Keep interaction and accessible names on the DOM stage/control contract; WebGL picking must not become the authority for scattering. [Pinned View source](https://github.com/pmndrs/drei/blob/ffa15b956e320391b0e86084cb58c8da0445abe3/src/web/View.tsx), [Design System §6.3](../02-design-system.md#63-the-critter-grid-and-the-stage-contract).

### Proposed world and renderer seams

- **World:** `createWorld`, `tick(now)`, the specified actions and trait names. Run the twelve systems in their specified order. Keep phase selection delegated to core `phaseAt` using the trusted server-time seam; animation timestamps are not phase authority. Keep network state, signing, encryption, verification, and tally in the reviewed core/app boundary. [Game Design §7](../03-game-design.md#7-simulation-model-koota), [Technical Spec §1](../04-technical-spec.md#1-architecture).
- **Outputs:** `render2d` and `render3d` are adapters over the same `Rig`; the headless world injects no-op or recording outputs for audio/portrait/mesh effects. DOM subscription and renderer setup attach and dispose outside simulation decisions. Keep Three value imports in the single lazy 3D entry and its descendants; do not pull Three into trait defaults or the portrait module. Preserve frozen generator output. [Phase 3 prompt](../../.scratch/phase-3-start.md), [Technical Spec §17](../04-technical-spec.md#17-performance-and-loading).
- **Time host:** one root R3F callback ticks before View's positive render priorities; never one ticker per stage. Fiber `useFrame` receives `(state, delta, XRFrame?)`, **not** the raw animation-frame timestamp. Its `setFrameloop` resets its internal clock. Proposed adapter: capture the raw millisecond timestamp through public `addEffect`, then consume it in the root `useFrame` callback; use the same timestamp origin as the portrait `requestAnimationFrame` host. Unsubscribe on teardown and test that swapping hosts neither doubles nor reverses time. [Pinned Fiber loop](https://github.com/pmndrs/react-three-fiber/blob/0a107412ac64667b1908422e859447952f57feef/packages/fiber/src/core/loop.ts), [pinned Fiber store](https://github.com/pmndrs/react-three-fiber/blob/0a107412ac64667b1908422e859447952f57feef/packages/fiber/src/core/store.ts).
- **Loop policy:** continuously tick during visible awake motion and active interactions/sequences; invalidate on actions and external state changes in demand mode. Hiding the tab or leaving the grid suspends the host, stops held input, and prevents a resumed frame from pouring through the absence. Test resume, context loss, reduced motion, and pending crossfades. This policy needs its own pure state-machine seam using injected time. [Game Design §6–§7](../03-game-design.md#6-performance-budget-for-the-3d-scene).

The automatic ladder's antialias change needs an explicit implementation path. Three passes `antialias` during WebGL context creation; the pinned renderer provides no ordinary `setAntialias` mutation. Plan recreation of the renderer/context with portraits covering the transition while preserving the world, or document an independently verified equivalent. Test the actual context attributes and state preservation. [Installed Three renderer](../../node_modules/three/src/renderers/WebGLRenderer.js).

## Browser proof to put in the 3D ticket

**Status of every row below: planned, not measured.** Run after the headless world, portraits, and Simple-view lifecycle are working. Use the existing pinned stack, deterministic generator inputs, identical action/time traces, and production build settings for both layout candidates. Performance instrumentation stays local/dev-only; no telemetry.

| Fixture | Why | Required variants |
|---|---|---|
| 6 targets | Small council | Awake idle, held plus/minus, typed amount, full feast, skip/replay |
| 10 targets | Spec device-floor acceptance | Same sequence, ten simultaneously visible stages, highest permitted geometry, 64-flight stress, hop cap |
| 49 targets | Reviewed domain capacity | All 49 remain in the DOM and usable; 375 px scroll journey, wide viewport with many visible stages, last-target input, full feast within 8 s |

For each fixture compare **Simple view**, **one canvas with Views**, and, if needed, **one orthographic camera with pixel-mapped positions**. Record initial portraits, crossfade, scroll/resize/statement expansion, viewport exit/reentry, tab hide/resume, Still critters, reduced motion, and context-loss fallback. Verify identical counts, latest allocations and results; no target is discarded to meet rendering budgets.

1. Record exact commit/build, browser/OS, CPU/GPU/device, viewport, refresh rate, DPR, visible-stage count, throttle multiplier, network profile, and cold/warm state. Run desktop unthrottled plus Chrome's calibrated mid-tier CPU profile at 375 px, DPR capped to 1.5. Save the actual network latency/bandwidth used for the 4G case. Repeat on iPhone 11 and the specified Snapdragon 6-series-class Android before claiming the device floor. CPU throttling is a proxy, not a mobile-GPU measurement. [Chrome throttling calibration](https://developer.chrome.com/docs/devtools/settings/throttling/), [Chrome performance reference](https://developer.chrome.com/docs/devtools/performance/reference), [Game Design budgets](../03-game-design.md#6-performance-budget-for-the-3d-scene).
2. Warm the scene for 5 seconds; capture 15 seconds of awake idle and 15 seconds of repeated pour/reverse interaction, plus a full feast. Repeat each three times. Record achieved fps, frame-interval p50/p95/max and intervals over 33/50 ms, JS/style/layout work, rectangle-read count, render-call count, and input-to-visible-response. Identify warm-up and cold-load costs separately. Preserve raw traces and the aggregation script; averages alone do not show sustained stalls. These durations and reporting statistics are proposed measurement methodology, not replacements for the spec's feel constants.
3. Set `renderer.info.autoReset = false` for the proof and reset **once per display frame**, after sampling every View render. Sum draw calls and triangles across all stage passes and the crumb pass. Otherwise the default reset at each `gl.render` can make a ten-stage scene look like one stage. The required budget is ≤4 draws/critter, ≤40 scene draws plus one crumb draw, ≤3,000 triangles/critter and ≤30,000 scene triangles. [Three renderer statistics](https://threejs.org/docs/pages/WebGLRenderer.html), [installed reset logic](../../node_modules/three/src/renderers/WebGLRenderer.js), [Game Design §6](../03-game-design.md#6-performance-budget-for-the-3d-scene).
4. Measure idle GPU time with valid asynchronous `EXT_disjoint_timer_query_webgl2` samples spanning all render passes when available; discard disjoint samples and never block waiting for them. If unavailable, report the ≤8 ms GPU budget as **unverified**, not as the CPU frame interval. Three's geometry/texture counts are not GPU-memory bytes: report byte accounting for owned buffers/textures separately and mark the ≤60 MB total GPU-memory budget unverified unless device tooling can substantiate it. [Khronos timer-query specification](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/), [Three statistics](https://threejs.org/docs/pages/WebGLRenderer.html).
5. Enforce ≤64 flight instances, ≤60 animated DOM hop nodes, DPR caps, no shadow maps/postprocessing, the exact ladder thresholds (33 ms/2 s; 50 ms/further 3 s; 50 ms/further 5 s; context not restored in 2 s), 60 fps desktop and ≥30 fps on the device floor during pouring. Verify the 49-target feast still reaches Readable within 8 s and retains grid order. [Game Design §4.2 and §6](../03-game-design.md).
6. Record shell and lazy chunk gzip sizes; shell ≤120 KB and 3D ≤250 KB. The grid-to-3D cold-load limit is 3 seconds on the recorded 4G profile with portraits visible throughout. Assert arrival/read never request the 3D chunk, and Simple view finishes the same local mock lifecycle without it. [Technical Spec §17](../04-technical-spec.md), [Phase 3 prompt](../../.scratch/phase-3-start.md).

### Capacity and fallback decision

The 49-target domain cap is not a promise that 49 full-detail critters can render inside the budget written for ten. At the stated per-critter maxima, 49 simultaneous critters would allow 196 draw calls and 147,000 triangles before crumbs; those exceed the scene limits. This is arithmetic, not a measured result. **Retain all 49 targets, their positions, controls, statements and results.** The 3D ticket must explicitly choose and measure a budgeted representation/instancing strategy or a documented active-mesh policy with portraits for other stages. Offscreen culling alone must be tested against wide viewports where more than ten are visible. Any policy addition belongs in the approved plan/decision record; do not silently lower `MAX_FEAST_TARGETS` or relax the scene budget. [Game Design §6](../03-game-design.md#6-performance-budget-for-the-3d-scene), [settled capacity constraint](../../.scratch/phase-3-start.md).

If View's measured overhead fails, compare the specified single orthographic scene using the same DOM stage rectangles, geometry/materials, action traces and metrics. That fallback still needs clipping/scroll/resize proof and does not automatically merge draw calls. If both fail, stop the 3D slice, retain working Simple view, and report the failed budget and open ticket as the prompt requires. A desktop throttled pass may authorize further implementation; it cannot close the real-device acceptance item.

## Game Studio use in tickets

The user-supplied Game Studio umbrella routes this existing React + R3F project to the **React Three Fiber** track, shared **web-game-foundations**, **game-ui-frontend**, and **game-playtest**. Do not introduce Phaser or a generated-asset pipeline: the project already specifies a React DOM interface, procedural GEN_VERSION 1 critters, SVG portraits, and optional primitive 3D meshes. Embed the specialist skill paths and concrete uses in world, shell/stage, 3D, and browser-proof tickets, and read those files when accessible before implementation. The umbrella text was available in the conversation; installed external specialist skill files were inaccessible during this preflight, so this note does not claim their contents were applied.

The world ticket should own V5's mounted-hook regression and the cleanup-direction correction. The renderer/ticker ticket should own host handoff and demand-mode behavior. The 3D ticket should own V7's comparison and capacity decision. The final browser ticket should retain real-device and full-lifecycle evidence as separate, visible acceptance items.
