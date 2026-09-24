# Phase 3 renderer measurements

Measured 2026-09-19 in the supported Codex in-app Chromium on the task host, against the local Vite mock app. The fixture uses production geometry, Rig updates, View composition and the production renderer policy. Measurements are displayed locally in the development workshop; no telemetry is sent.

## Decision

Keep one R3F canvas with scissored Drei Views. Keep all 49 domain targets and DOM controls. Render up to nine visible meshes in DOM order, retaining portraits for the remainder. Each mesh uses four calls; reserve one for the shared instanced crumb pass. This stricter allocation is at most 37 total calls within the 40-call scene budget. No scene, geometry, chunk, timing or domain budget was raised.

The empty canvas unmounts and releases ticking to RAF when every stage is offscreen. The simulation can still answer visible Results/Skip controls; it pauses when its entire owning surface is offscreen or the document is hidden. Resource disposers run before Koota world destruction and are idempotent.

## Measurements and limits

The workshop retains 1200 frame intervals, discards the first 120 for displayed percentiles, and updates its DOM measurements every 30 samples. The steady window is roughly 18 seconds at 60 Hz. Reported intervals are CPU-observed animation-frame spacing, not GPU time. No CPU or network throttling was applied to these runs. Device pixel ratio was 1 for the final production-policy runs; earlier prototype runs used 1.5.

| Fixture | Viewport | Active mesh calls / triangles | p50 / p95 interval | Largest interval in reported window |
|---|---|---|---|---|
| 6 targets, final geometry | 1440×1000 | 24 / 12,132 | 16.7 / 17.4ms | 17.8ms |
| 10 targets,8 visible meshes | 1440×1000 | 32 / 15,736 | 16.7 / 17.3ms | 17.7ms |
| 10 targets,9 mesh cap | 1440×1800 | 36 / 17,690 | 16.7 / 17.4ms | 33.4ms |
| 49 targets,9 mesh cap | 1440×1800 | 36 / 17,690 | 16.7 / 17.6ms | 333ms during browser interaction |

These show a steady desktop cadence near 60 Hz, with interaction/startup outliers. A concurrent Lighthouse/browser-work window raised the 49-target p95 to 32.6 ms and maximum 267.5 ms; this is retained as an observed contention result, not silently removed. The original prototype wrote every hidden portrait each frame and reached a 33.3 ms median with 49 targets. Avoiding offscreen/mesh-covered SVG writes restored the steady cadence above; the orthographic fallback was not required for the optimized desktop path. This does not certify the phone floor.

A 640-identity/variant geometry sweep found a maximum 2,450 triangles per critter, below3,000. Nine such meshes plus 64 octahedral crumbs (eight triangles each) remain below 30,000. The individual material groups and blob total four calls per critter; the shared crumb pass adds one. The prototype's ten-mesh held pour was measured at 41 calls; the final policy reserves that call in advance. Geometry counts are in `.scratch/evidence/geometry-budget.log`.

## Browser fault and layout checks

- 49 stage/control entries remain present. Target 49 accepted a crumb while the context was lost; it still held 1 after retry and Simple/3D toggling.
- Forced context loss immediately exposes portraits. After the 2 s deadline the canvas disappears, the mid-session notice appears, and one retry restores 3D.
- Repeated fixture counts and Simple/3D changes no longer access a destroyed Koota world. Cleanup removes traits, textures, materials, geometry, frame effects and listeners.
- Expanding the first statement updates the visible stage selection. Observed top coordinates moved to 295/885/1348 px with nine selected meshes. Intersection, surface resize, scroll, window resize and details toggles all invalidate layout.
- Actual mobile people-feast scattering and results used the renderer, then Simple view produced the same local result. Screenshots are in the task output; the public portrait results screenshot is retained in `.scratch/evidence/`.

## Still unverified

The host hardware sysctl query was denied by the sandbox. No real phone GPU, calibrated CPU throttle, 4G load timing, total GPU memory, or GPU timer-query evidence was available in this run. Lighthouse's separate browser used HeadlessChrome 152 and reports its own environment. Its accessibility scores are not renderer performance measurements. These remaining device checks belong to the rehearsal gate; do not interpret desktop frame spacing as a phone guarantee.
