# Versioned critter identity storage

Prepared locally on 16 October 2026 after Afolabi selected painted Garden Spirits, eight species, portraits first, and opt-in migration. This implements storage preparation and records the art handoff. It does not enable the new art or migrate a person's choice.

## Changes

- [Migration 0009](../../db/migrations/0009_critter_identity_versions.sql) stores generator and renderer versions on profiles and appearance data on feast targets. Earlier migration files are unchanged.
- Sign-in, profile and burrow-member responses include stored versions. Existing variants, reroll counts, locks and names are preserved. New profiles and option critters still use v1. Version-changing profile edits are rejected.
- People-feast appearances follow profiles during draft/gathering, then are captured by the existing participant-freeze transaction. Option appearances are captured at creation. Public and member feast reads return the same appearance metadata without changing target IDs or tally inputs.
- Existing targets are labelled `legacy-baseline` with no capture time. Their variants come from the current known profile, not invented historical data.
- [Claude's refinement brief](../explorations/claude-code-critter-refinement-2026-10-16.md), [ADR 0005](../adr/0005-versioned-critter-appearance.md), and [Technical Spec §3.1](../04-technical-spec.md#31-versioned-critter-appearances-16-october-2026) record the approved direction, storage contract and remaining integration work.

## Verification

The focused profile, membership, feast-portrait and schema-upgrade suites pass: 27 tests. They cover preservation across reconnects, rejection of version-changing edits, concurrent first freeze reads, option independence, upgrade from migrations 0001–0008, idempotent migration reruns, and database rejection of unsupported version pairs. The schema-upgrade tests use disposable PGlite databases and the real migration runner; no production or existing local review database was migrated.

`bun run check` passed toolchain, generated tokens, lint, type checking, all **597 tests in 79 files** with the normal two-worker configuration, all **21 tooling tests**, and the development-asset check. It then stopped at the workspace probe because Bun could not write to its default temporary directory (`EPERM`). Re-running `check:workspaces` with task-local `TMPDIR`, `BUN_TMPDIR`, and `BUN_INSTALL_CACHE_DIR` passed the built-export deployment probe. `check:licenses` also passed, including archive integrity and both reviewed patches. `check:audit` returned HTTP 403 from the npm advisory endpoint, so the aggregate check is not green and no fresh vulnerability result is claimed.

`bun run build` passes. The shell remains 116,193 gzip bytes against its 120,000-byte budget; the Three.js chunk is 198,469 against 250,000. `git diff --check` passes. No dependency or shipped art asset was added. No browser/e2e run was added for this storage-only change; the prior scene/onboarding verification remains a separate record.

## Release order and remaining integration

The new API expects migration 0009. Use a coordinated release window: drain writes and old API instances, apply the migration through the existing runner, deploy the updated API, then verify profile and feast reads before reopening writes. Audit databases with development-only v2 history separately; an address and variant alone cannot reveal which preview someone saw. Keep the additive columns if reverting the API during this preparation phase.

Production database execution and deployment have not been performed. Production still renders v1 and development retains its existing v2 preview. The browser does not yet render per-profile versions; that belongs to the later art integration review.

Before enabling adoption, define the new-version selection allowance and explicit consent operation, retain previous choices, pin affected active feasts before changing a profile version, add the reviewed generator/renderer and independent vectors, and make every portrait surface read stored versions. The approved opt-in policy does not authorize resetting existing locks or rerolls through ordinary profile edits. Public provenance remains a separate decision.
