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

Initial Spec findings: 3, all P2. Corrections add a supervised TypeScript watcher to both dev modes, explicit Vite asset middleware with an HTTP regression, and static import-target handling with regressions for templates, unresolved targets, and TypeScript import-equals. Manual development proof confirmed two source edits rebuilt and both BLST assets matched the published bytes. Final re-review follows the correction commit.

Initial totals: Standards 0 (no issue); Spec 3 (worst P2). Reports remain separate.
