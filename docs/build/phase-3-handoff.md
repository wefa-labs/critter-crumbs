# Phase 3 implementation handoff

The mock game system and browser UI are implemented, including creator-authorized removal with durable visible history. On 2026-09-23 the delivery patch was applied to the branch `phase-3/integration` and opened as [PR #29](https://github.com/wefa-labs/critter-crumbs/pull/29), and the Playwright lifecycle ran green there for the first time. Merge review and the acceptance checks listed under Validation remain open.

## Integration

PR #27 is merged at `b6602318d987aff7068e5a7394e1a37229496bc5`. A fresh verified HTTPS read on September 19 confirmed that remote main is still exactly that commit. The implementation started from its archive, with all 305 source files checked against GitHub blob hashes. The original checkout remains at `6108ca2`; Git metadata is read-only. Its uncommitted PRD/design/decision/pitch edits and output directory were preserved.

The approved September 17 P14/P15 changes are included: all four privacy combinations are valid, with a database migration and authorization regressions; Gathering offers a copyable local assistant prompt. No prompt or notes are sent to an AI service.

The reviewed core source is byte-identical to merged main. Its only package metadata change is `sideEffects: false` for bundling. GEN_VERSION 1, the 49-target limit, the 4,096-byte ciphertext limit, signing, timelock, canonical encoding and deterministic tally contracts remain intact.

The delivery patch (sha256 `f384d51e…`, 131 files) was applied on 2026-09-23 to a branch from that base as one commit, `39232fe`, with every resulting file checked against the delivery manifest. The branch also merges local `main`'s two docs commits (PRD P14/P15, the Sep 17 decisions and the shared engineering guidance). One test-only correction followed, `c90f134`: the Playwright helper now reads authenticated state through the page, because Playwright's request context withholds the `Secure` session cookie from `http://127.0.0.1`. [PR #29](https://github.com/wefa-labs/critter-crumbs/pull/29) is the draft integration pull request with `Closes #16`; the reviewer merges it with a merge commit. The dependency audit's two development-only advisories, present on `main` before this work, are fixed separately in [PR #28](https://github.com/wefa-labs/critter-crumbs/pull/28).

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
| 15 | Lifecycle and renderer E2E scripts pass (13 specs on the integration branch, 2026-09-23); the keyboard and accessibility rows still marked open in the validation record remain rehearsal-time checks |

Creator removal is the implementation for issue #16: active creator authority, separate self-leave, atomic revision-guarded removal/history, preserved frozen feasts, retries, re-admission and address-based history. Do not close the parent until this implementation has reached main.

The initial assets and licences are documented in [asset provenance](../research/phase-3-assets.md). Rendering decisions and measured limits are in [renderer evidence](../research/phase-3-rendering-evidence.md). [Validation](phase-3-validation.md) records every E1–E28 owner and the keyboard/feel evidence without treating unrun checks as passes.

## Validation

- Separate Standards and Spec reviews are clear through the final renderer fixes. Immutable review snapshots are in `.scratch/reviews/`.
- Final typecheck passes. Lint, generated tokens, development assets, workspace packaging, runtime licences and archive integrity pass. Full check cannot pass the registry audit: the advisory POST returns HTTP 403.
- Targeted policy/runtime/world/director regressions passed; the final lighting suite passed 14 tests. P14/API regressions passed 52 tests across their targeted files before the host became heavily loaded.
- The final full offline suite passes: **437 tests in 57 files, plus 11 tooling tests**, exit 0 in 364.47 s for Vitest. Earlier runs timed out while host load exceeded 130; the successful rerun used the normal two-worker configuration after stopping task-owned browser/server work. No timeout or assertion was loosened. Earlier diagnostic logs remain available; the precise cause of those timeouts was not isolated.
- The separate final core/shared/app suite passes 207 tests in 30 files; the critical API subset also passes 23 tests in three files. The final build passes: shell 114,863/120,000 gzip bytes; 3D 249,233/250,000; crypto 53,955 (no numeric cap). The machine-readable summary and full logs are in `.scratch/delivery/`.
- Playwright could not launch Chromium in the Codex sandbox (MachPortRendezvous EPERM). On 2026-09-23 the suite ran on the integration branch against the mock stack: 13 specs passed in 1.6 minutes, including people and options feasts in Simple view and 3D with equal hashes, replacement, screenshots and the downloaded CSV. The branch's CI run passed all 437 offline tests on a clean runner. See [the evidence](phase-3-test-evidence.txt).
- Supported browser proof: two participants computed the same people-feast hash, with latest allocations yielding 160/40 from 200 crumbs; Simple and 3D controls worked at 375 px; 320 px had no page overflow; Skip reached Readable and focused Results; context loss preserved target 49 through retry. Earlier options proof covered a tie, Unicode/quoted names, local recording and public aggregate visibility.
- Lighthouse 13.4.1 mobile snapshot accessibility: 100 for arrival and 100 for public results. Complete member-screen audits, actual 200% zoom, VoiceOver/TalkBack, and the slowest phone remain open.

The CSV download assertion has now run in Playwright and passed for both feast kinds; the earlier in-app browser could not observe the download. No real transaction, live Shutter rehearsal or production-readiness claim is made.

## Run and finish integration

Use Bun 1.4.2 and Node 22.22.1. From the active implementation root:

```sh
bun install --frozen-lockfile --ignore-scripts
SHUTTER_MODE=mock DEV_ENDPOINTS_ENABLED=1 LOCAL_API_PORT=4300 bun run dev:local
```

From another terminal, `LOCAL_API_PORT=4300 bun run seed --phase gathering --kind both`. Open the printed feast ID at `http://127.0.0.1:5173/feasts/<id>` and connect a rehearsal account. [Local core](local-core.md) documents API time/key commands. Set `LOCAL_DATA_DIR` to a fresh task-local directory for a fresh rehearsal; the task's existing data is `.scratch/local-data-phase3` and must not be packaged or shared.

On a host permitting Git writes and Chromium launch, apply the delivery patch to a clean branch based on `b6602318d987aff7068e5a7394e1a37229496bc5`, run `bun run check`, `bun run test -- --reporter=verbose`, `bun run build`, and `bun run e2e` with the mock stack running. Publish a draft PR with explicit base `main` and labels `automated/codex` and `draft`. Review and merge remain human actions. No credentials, local database or generated test output belongs in the commit.

## Review on the integration branch

On 2026-09-24 the repository `code-review` skill ran both axes against `origin/main`. The Spec axis found nothing blocking: every PRD §5 rule, the #16 acceptance list, the 49-target limit, the encrypted-only submission path, equal local hashes, the CSV columns and the degradation thresholds trace to code and tests; its gaps are the open ticket 15 rows above. The Standards axis found three hard violations, all fixed in `9633929`: a mid-flow action rename in `setup.saved`, a glued " minutes" fragment instead of interpolated plural copy, and error copy used as a page title on two routes. Its judgement calls that were taken: the rehearsal-only signer and opener now raise `err.rehearsalOnly` instead of "store unreachable", `err.publicationChanged` says what was kept, and the assistant prompt says "saving". Browser QA on the same day fixed the unnamed row-level removal controls and the raw address that widened the burrow page at 375 px (`0b73f0f`).

Recorded follow-ups, not changed before merge: `settings.still || settings.reducedMotion` repeated at about twenty sites (one `isQuiet(settings)` helper); case-insensitive address comparisons repeated across ten app modules while the API already has `sameAddress`; the Base Sepolia EAS chain and address literal repeated in six modules; two share formatters (`time.ts` float percent and `csv.ts` exact decimal); the `fed` formula duplicated between `public-results.tsx` and `world/director.ts`; light presets as positional tuples in `three/runtime.ts`; `feast-session.ts` gating on the stale feast prop after a fresh response; a transient 5xx on `/api/me` during a server restart is treated as signed out rather than as a store outage; the ENS fallback warning is announced on every full page load; and the add-member announcement reads the full typed address instead of the §5.5 short form. The browser QA pass and its fixes are summarised in the [validation record](phase-3-validation.md).

## Suggested skills

Use `game-studio:game-playtest` for remaining browser/phone proof, `game-studio:react-three-fiber-game` for renderer diagnostics, repository `code-review` for both review axes, and `implement`/`tdd` at the already approved seams for any discovered defect. Use `handoff` if integration cannot finish in the next task. The approved ticket plan is [preserved here](phase-3-plan.md); local ticket bodies remain under the original repository's `.scratch/phase-3/issues/`.
