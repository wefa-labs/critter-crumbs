# Phase 3 implementation handoff

The mock game system and browser UI are implemented, including creator-authorized removal with durable visible history. The code is in the isolated source checkout at `/Users/afo/Code/wefa/critter-crumbs/.scratch/phase-3-work`. It is not yet integrated into main or accepted as merge-ready: automated browser verification and the remaining acceptance checks are open.

## Integration

PR #27 is merged at `b6602318d987aff7068e5a7394e1a37229496bc5`. A fresh verified HTTPS read on September 19 confirmed that remote main is still exactly that commit. The implementation started from its archive, with all 305 source files checked against GitHub blob hashes. The original checkout remains at `6108ca2`; Git metadata is read-only. Its uncommitted PRD/design/decision/pitch edits and output directory were preserved.

The approved September 17 P14/P15 changes are included: all four privacy combinations are valid, with a database migration and authorization regressions; Gathering offers a copyable local assistant prompt. No prompt or notes are sent to an AI service.

The reviewed core source is byte-identical to merged main. Its only package metadata change is `sideEffects: false` for bundling. GEN_VERSION 1, the 49-target limit, the 4,096-byte ciphertext limit, signing, timelock, canonical encoding and deterministic tally contracts remain intact.

A binary-capable patch and changed-file manifest are prepared under `.scratch/delivery/` against that exact base. Apply them in a clean checkout of the base, preserving the user's existing checkout. The delivery verification report checks every resulting file against the implementation. A fresh GitHub branch-creation POST returned HTTP 403, “Method not allowed in limited mode.” No branch, commit or Phase 3 integration PR was created; issue #16 remains open on GitHub.

## Delivered scope

| Approved tickets | State |
|---|---|
| 01–03 | Deterministic Koota world, complete feast director, portrait renderer, injected-clock host; implemented and reviewed |
| 04–08 | Connect/profile, burrows, removal/history, setup, gathering, reading, complete and replaceable scattering; implemented and reviewed |
| 09 | Five synthesized voices, finite cues, bounded pour, DOM feedback and settings; implemented; specific music/ambience asset deferred by user |
| 10–11 | Local decryption/tally, readable results, receipt/close-record audit, CSV and optional recorded local result; implemented and reviewed |
| 12 | Persistent settings, degradation thresholds, context recovery and one retry; implemented, unit-tested and browser exercised |
| 13 | Desktop View measurements and representation decision complete; phone/GPU/load measurements remain open |
| 14 | Lazy decorative canvas, frozen-generator meshes, shared Rig, lighting, flights, crossfades, visibility and teardown; implemented and reviewed |
| 15 | Lifecycle and renderer E2E scripts written; substantial manual browser proof recorded; automated execution, complete keyboard/accessibility matrix and integration still blocked/open |

Creator removal is the implementation for issue #16: active creator authority, separate self-leave, atomic revision-guarded removal/history, preserved frozen feasts, retries, re-admission and address-based history. Do not close the parent until this implementation has reached main.

The initial assets and licences are documented in [asset provenance](../research/phase-3-assets.md). Rendering decisions and measured limits are in [renderer evidence](../research/phase-3-rendering-evidence.md). [Validation](phase-3-validation.md) records every E1–E28 owner and the keyboard/feel evidence without treating unrun checks as passes.

## Validation

- Separate Standards and Spec reviews are clear through the final renderer fixes. Immutable review snapshots are in `.scratch/reviews/`.
- Final typecheck passes. Lint, generated tokens, development assets, workspace packaging, runtime licences and archive integrity pass. Full check cannot pass the registry audit: the advisory POST returns HTTP 403.
- Targeted policy/runtime/world/director regressions passed; the final lighting suite passed 14 tests. P14/API regressions passed 52 tests across their targeted files before the host became heavily loaded.
- The final full offline suite passes: **437 tests in 57 files, plus 11 tooling tests**, exit 0 in 364.47 s for Vitest. Earlier runs timed out while host load exceeded 130; the successful rerun used the normal two-worker configuration after stopping task-owned browser/server work. No timeout or assertion was loosened. Earlier diagnostic logs remain available; the precise cause of those timeouts was not isolated.
- The separate final core/shared/app suite passes 207 tests in 30 files; the critical API subset also passes 23 tests in three files. The final build passes: shell 114,863/120,000 gzip bytes; 3D 249,233/250,000; crypto 53,955 (no numeric cap). The machine-readable summary and full logs are in `.scratch/delivery/`.
- Playwright could not launch Chromium: macOS rejected MachPortRendezvous bootstrap with EPERM, before assertions ran. The new people/options × Simple/3D script checks independent contexts, replacement, equal hashes, screenshots and downloaded CSV; it remains unrun here.
- Supported browser proof: two participants computed the same people-feast hash, with latest allocations yielding 160/40 from 200 crumbs; Simple and 3D controls worked at 375 px; 320 px had no page overflow; Skip reached Readable and focused Results; context loss preserved target 49 through retry. Earlier options proof covered a tie, Unicode/quoted names, local recording and public aggregate visibility.
- Lighthouse 13.4.1 mobile snapshot accessibility: 100 for arrival and 100 for public results. Complete member-screen audits, actual 200% zoom, VoiceOver/TalkBack, and the slowest phone remain open.

The browser download itself was not observed successfully in the in-app browser. CSV content/escaping/precision tests pass; its E2E download assertion must run before accepting that browser proof. No real transaction, live Shutter rehearsal or production-readiness claim is made.

## Run and finish integration

Use Bun 1.4.2 and Node 22.22.1. From the active implementation root:

```sh
bun install --frozen-lockfile --ignore-scripts
SHUTTER_MODE=mock DEV_ENDPOINTS_ENABLED=1 LOCAL_API_PORT=4300 bun run dev:local
```

From another terminal, `LOCAL_API_PORT=4300 bun run seed --phase gathering --kind both`. Open the printed feast ID at `http://127.0.0.1:5173/feasts/<id>` and connect a rehearsal account. [Local core](local-core.md) documents API time/key commands. Set `LOCAL_DATA_DIR` to a fresh task-local directory for a fresh rehearsal; the task's existing data is `.scratch/local-data-phase3` and must not be packaged or shared.

On a host permitting Git writes and Chromium launch, apply the delivery patch to a clean branch based on `b6602318d987aff7068e5a7394e1a37229496bc5`, run `bun run check`, `bun run test -- --reporter=verbose`, `bun run build`, and `bun run e2e` with the mock stack running. Publish a draft PR with explicit base `main` and labels `automated/codex` and `draft`. Review and merge remain human actions. No credentials, local database or generated test output belongs in the commit.

## Suggested skills

Use `game-studio:game-playtest` for remaining browser/phone proof, `game-studio:react-three-fiber-game` for renderer diagnostics, repository `code-review` for both review axes, and `implement`/`tdd` at the already approved seams for any discovered defect. Use `handoff` if integration cannot finish in the next task. The approved ticket plan is [preserved here](phase-3-plan.md); local ticket bodies remain under the original repository's `.scratch/phase-3/issues/`.
