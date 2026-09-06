# Phase 2 preflight evidence

2026-09-05. This records research and foundation validation before implementation. **Phase 2 is not implemented and no domain test is claimed as passing.** The ticket breakdown is awaiting approval in [the plan](phase-2-plan.md).

## Repository and tools

- Starting commit: `1f64379` on `main`; clean worktree.
- Phase 1: [PR #1](https://github.com/wefa-labs/critter-crumbs/pull/1), merged at `94a0706`; linked foundation guide, review and tracker guidance read.
- Working preparation branch: `phase-2/core-contract-plan`.
- This checkout initially had no `node_modules` and the shell resolved Node 24.20.0 through a workstation shim. Validation explicitly selected the already-installed Node 22.22.1 and Bun 1.4.2 binaries without changing global configuration.
- `bun install --frozen-lockfile --ignore-scripts` passed: 791 packages installed; no manifest or lockfile change.
- GitHub issue listing returned `the 'wefa-labs/critter-crumbs' repository has disabled issues`. No issue was filed or repository setting changed. Eleven proposed implementation tickets and three human follow-ups are saved under `.scratch/phase-2/`.
- No Vercel project link was present in this checkout, so the approved implementation needs `dev:local`.

## Verification outcomes

| Item | Result | Limit |
|---|---|---|
| V2 Shutter | Current routes, envelopes, registrant derivation, source-documented quotas and API-funded gas established | No registration, commercial plan or mined transaction tested |
| V3 CORS | Anonymous read-only GET and OPTIONS allow the application origin on both deployments | No browser automation or complete release flow |
| V4 EAS | SDK/viem exact UID, signatures, verification and both schema encodings agree on Base and Base Sepolia | Offline reference with explicit `0.26` domain; no claim about a live contract version |
| V6 Neon | Node 22 HTTP batch behavior verified with injected responses | Live Vercel/Neon connection and multi-connection isolation untested |
| PGlite | Version 0.5.8 executes the verbatim §3 migration offline: nine tables, two enums; rollback and idempotent-update probes pass | Single connection serializes calls; permanent handler tests still need implementation |

Sources, fixed vectors, read-only fixtures, probe commands and caveats are in [Shutter V2/V3](../research/shutter-api-v2-v3.md), [EAS V4](../research/eas-offchain-v4.md) and [Neon/PGlite V6](../research/neon-pglite-v6.md). The corresponding shape corrections were appended to the decisions log before dependent code.

## Baseline checks

With Node 22.22.1 and Bun 1.4.2 selected:

```sh
bun run check
bun run build
```

Both commands exited 0. Full check included lint, typecheck, three workspace smoke tests, ten tooling tests, the Vercel built-export probe, nine reviewed runtime dependencies' licence/archive checks, and the high-severity audit. The audit reported zero findings at the high threshold and six below it. Build emitted the unchanged scaffold with gzip bytes: shell 399/120000, three 21/250000, crypto 21 with no numeric cap.

An initial sandboxed `bun run test` passed the three smoke tests and nine tooling tests but failed the existing asset HTTP test with `listen EPERM` on loopback. The full check was then rerun with permission for that existing loopback test and registry audit and passed all ten tooling tests. No test was skipped or relaxed. The phase 2 plan moves that network-using asset proof into a separate required check so the default test command can meet the new zero-network requirement.

The full baseline check output is retained locally at `/tmp/critter-phase2-baseline-check.log`. It contains no named tally or lifecycle tests: those do not exist yet. The temporary research probes are not replacements for the permanent TDD suite.
