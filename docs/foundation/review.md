# Foundation review

Fixed point: `59aed86e467d6e4aa93ace0ac51bac23f5d7233d`. Initial reviewed commit: `7859f91`. The code-review skill ran separate Standards and Spec agents over `git diff 59aed86e467d6e4aa93ace0ac51bac23f5d7233d...HEAD`.

## Standards

No documented-standard violations or actionable baseline smells found. The workspace layout, dependency additions and overrides, built package exports, and licence handling have corresponding decisions. The scaffold contains no domain logic or visible copy that conflicts with the project standards. Repeated dependency pins serve the documented review checks.

Initial Standards findings: 0.

## Spec

1. **P2: Rebuild workspace outputs during development.** Phase 1 requires later agents to work without changing tooling again. Core/shared export `dist`, but the initial dev command compiled only once, leaving later edits stale.
2. **P2: Serve the verified Shutter assets in development.** Disabling install scripts must leave the toolchain working. Rollup `emitFile` supplied the BLST files only during builds; Vite serve needed its own delivery mechanism.
3. **P2: Check static template literals in dynamic imports.** One-way imports must fail the check. Backtick targets bypassed the rule because the initial visitor read only `.value`.

No unrequested scope found. GitHub Issues being disabled remains a documented external constraint.

Initial Spec findings: 3, all P2. Corrections add a supervised TypeScript watcher to both dev modes, explicit Vite asset middleware with an HTTP regression, and static import-target handling with regressions for templates, unresolved targets, and TypeScript import-equals. Manual development proof confirmed two source edits rebuilt and both BLST assets matched the published bytes.

Initial totals: Standards 0 (no issue); Spec 3 (worst P2). Reports remain separate.

## Re-review at `3b48939`

Standards: 0 documented violations. One low-priority baseline smell identified duplicated import-target validation. The shared `checkStaticTarget` helper now handles both dynamic import and require targets; the existing guardrail regressions cover both forms.

Spec: all three P2 findings resolved. The Spec agent reran the four guardrail tests and the HTTP asset regression successfully. Remaining behavior gaps: 0. Introduced unrequested scope: 0. GitHub Issues remains disabled, with the human setup request saved as a draft.

Remaining findings after corrections: Standards 0; Spec 0.

## Bun migration review against `8b8732c`

The user explicitly replaced npm with the latest Bun. Separate Standards and Spec agents reviewed the migration, including the Bun lockfile, policy controls, checksum-pinned bootstrap, CI, and Node function compatibility.

Standards: 0 documented violations and 0 actionable baseline smells.

Spec: the review identified a Vercel function-build fallback that could select managed Bun. Both build routes now use `vercel-build`, which invokes the exact local Bun executable and prepends its directory for nested commands. Root invocation with the older global Bun and function-directory invocation both passed. The Spec agent also verified toolchain checks, runtime licences/integrity, and independently materialized function output through Bun workspace links. Remaining findings: 0. Unrequested scope: 0.
