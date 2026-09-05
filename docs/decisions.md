# Decisions log

Append-only. One line per decision that is not already in `docs/01`–`04`. Format: date · decision · why · who.

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-09-01 | Minimum three critters for a people feast (was four) | Reviewer | Afolabi |
| 2026-09-01 | Multi-burrow membership is v0; one critter per address across burrows | Reviewer; PRD P10 | Afolabi / Claude |
| 2026-09-01 | Four re-rolls; indefinite retention; crumbs 10–1,000 default 100 | Reviewer; PRD P9 | Afolabi |
| 2026-09-01 | Protective all-rights-reserved licence; holder name pending (Q9) | Reviewer | Afolabi |
| 2026-09-02 | Koota (pmndrs) is the simulation core | Game Design G10 | Afolabi |
| 2026-09-02 | Design-system visuals (palette, type, critter parameters) are provisional; exploration in `docs/explorations/` | Reviewer wants to revisit | Afolabi |
| 2026-09-02 | Neon Postgres via Vercel Marketplace; Base for EAS; server-triggered Shutter registration; viem-signed ballots with the EAS SDK as dev-only cross-check | Technical Spec T1–T3 | Claude (pending review) |
| 2026-09-02 | Domain `crittercrumbs.app`; Base confirmed for EAS; rehearsal posts its result on Base; the project account holds the Shutter API key (default tier first); for-profit product, licence holder = the owning company (name pending) | Reviewer answers to TQ1–TQ5 | Afolabi |
| 2026-09-02 | Licence holder is WEFA LLC; repository to be transferred to the WEFA GitHub organisation | Reviewer | Afolabi |
| 2026-09-03 | Ten mattpocock/skills vendored in `.agents/skills` (cross-agent), `.claude/skills` symlink, `CLAUDE.md` → `AGENTS.md`, git guardrail hook, `CONTEXT.md` glossary, ADRs 0001–0004 | Agent-driven build foundation | Afolabi / Claude |
| 2026-09-03 | Repository moved to `wefa-labs/critter-crumbs`; git guardrail narrowed so an ordinary push is allowed while destructive git remains blocked (33 cases in `.claude/hooks/`) | Reviewer | Afolabi |
| 2026-09-04 | Use npm workspaces at `packages/{shared,core,app}`, with one public entry each; keep `api/`, `db/`, `scripts/`, `tests/e2e/` at the root | Package interfaces enforce the workstream seams; Vercel requires root functions | Codex |
| 2026-09-04 | Interpret §11 as nine active runtime packages; do not add `@vercel/functions` | The table counts ten but names nine packages and explicitly rejects the functions helper | Codex |
| 2026-09-04 | Pin runtime `react@19.2.8` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `react-dom@19.2.8` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `three@0.185.1` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@react-three/fiber@9.7.0` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@react-three/drei@10.7.8` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `koota@0.6.6` (ISC) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `viem@2.56.3` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@shutter-network/shutter-sdk@0.0.2` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@neondatabase/serverless@1.1.0` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Shutter 0.0.2 uses MIT in its licence file and ISC metadata; retain WASM CSP and copy BLST assets during the explicit build; use `encryptData(message, identity, eonKey, sigma)` in phase 2 | Verified archive corrects the §6 argument order and resolves V1; see `docs/research/shutter-sdk-v1.md` | Codex |
| 2026-09-04 | Retain Fiber 9.7.0's MIT licence from its published source revision; record Koota as ISC and Neon as MIT | Fiber omits the grant from npm; the other two §11 licence labels differ from their own files | Codex |
| 2026-09-04 | Pin dev `vite@7.3.6` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@vitejs/plugin-react@5.2.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `typescript@5.9.3` | §11 build/test tooling; 5.9.3 stays within the TypeScript ESLint peer range, unlike current TypeScript 7 | Codex |
| 2026-09-04 | Pin dev `vitest@4.1.11` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/node@22.20.1` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/react@19.2.18` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/react-dom@19.2.7` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/three@0.185.4` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `eslint@9.39.5` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@typescript-eslint/parser@8.69.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@typescript-eslint/eslint-plugin@8.69.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@ethereum-attestation-service/eas-sdk@2.10.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `playwright@1.63.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `vercel@59.11.7` | Required by §14 local functions and the actual Node function bundler proof; development only | Codex |
| 2026-09-04 | Keep npm 10.9.4 bundled with Node 22.22.1 and enable `npm audit signatures`; no unsupported cooldown key | Verified npm 10 has signature verification but no release-age setting; `docs/research/npm-policy.md` | Codex |
| 2026-09-04 | Supersede the bundled npm choice with npm 11.19.1; keep Node 22.22.1 for local/CI and permit later Node 22 patches in engines | npm 10.9.4 twice crashes in Arborist while resolving the specified tools; npm 11 supports Node 22 and release-age policy. Vercel selects its managed Node 22 patch | Codex |
| 2026-09-04 | Override dev transitive `path-to-regexp@6.1.0` to `6.3.0` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `path-to-regexp@>=8.0.0 <8.4.2` to `8.4.2` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `undici@5` to `6.28.1` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `tar@7.5.7` to `7.5.22` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `adm-zip@0.4.16` to `0.6.0` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `serialize-javascript@6.0.2` to `7.1.1` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `tmp@0.0.33` to `0.2.7` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `minimatch@10.1.1` to `10.2.6` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `js-yaml@4.1.1` to `4.3.2` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Enable `min-release-age=7` with npm 11.19.1 and keep `ignore-scripts=true` with no exceptions | npm 11 supports a moving seven-day release delay; builds and smoke/guardrail tests work without lifecycle scripts; signatures verify locked versions independently of the delay | Codex |
| 2026-09-04 | Measure `crypto` without a numeric cap; enforce 120,000-byte shell and 250,000-byte three gzip limits plus lazy import separation | §17 specifies only two numeric caps; do not invent a crypto limit | Codex |
| 2026-09-04 | Save one human setup issue draft under `docs/foundation/` and `.scratch/phase-1/issues/` until Issues is enabled | GitHub authenticated and labels were created, but the repository has Issues disabled; repository setting changes are out of scope | Codex |
| 2026-09-04 | Load the dev-only EAS SDK through its public CommonJS entry using `createRequire` in cross-check tests | Its native ESM entry requests an unsupported lodash named export in Node 22; the public require entry passes a tooling smoke test | Codex |
| 2026-09-04 | Export built ESM `dist/index.js` and declarations from each package; compile before Vercel traces root functions | @vercel/node 12.0.1 preserves workspace links; emitted dist invocation succeeds, while source exports fail after TypeScript files are renamed. `npm run check:workspaces` repeats the proof | Codex |
| 2026-09-04 | Supersede `@types/react-dom@19.2.7` with `19.2.5` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `@typescript-eslint/parser@8.69.0` with `8.68.0` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `@typescript-eslint/eslint-plugin@8.69.0` with `8.68.0` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `playwright@1.63.0` with `1.62.1` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `vercel@59.11.7` with `59.9.1` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `viem@2.56.3` with `2.56.0` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Use patched dev transitive `undici@6.28.0` instead of `6.28.1` | Retain the seven-day release delay while selecting a patched version | Codex |
| 2026-09-04 | Use patched dev transitive `serialize-javascript@7.1.0` instead of `7.1.1` | Retain the seven-day release delay while selecting a patched version | Codex |
| 2026-09-04 | Supervise a TypeScript build watcher in both dev modes; serve BLST bytes through Vite middleware and emit them during production builds | Built package exports must refresh during development, and Vite serve does not support Rollup emitFile; verified edits and HTTP asset responses | Codex |
| 2026-09-04 | Require statically known import and require targets in application modules | Check import direction for quoted and template strings; unresolved dynamic paths cannot be checked reliably | Codex |
| 2026-09-05 | Supersede npm with Bun 1.4.2 at the user’s request | Latest stable release verified from Bun’s official release API; commit bun.lock, .bun-version, and exact packageManager/engines pins; retain Node 22 for functions and Node-based tools | Codex |
| 2026-09-05 | Preserve the reviewed dependency versions and version-qualified overrides in Bun lockfile format 3 | Bun 1.4.2 supports these selectors; use the hoisted linker for the existing public-package and Vercel bundler setup | Codex |
| 2026-09-05 | Enforce exact saves, disabled install scripts, and a seven-day dependency release age in bunfig.toml | Frozen installs run in CI and Vercel; no dependency script or release-age exceptions; the explicitly requested latest Bun tool is pinned separately | Codex |
| 2026-09-05 | Use Bun’s high-severity audit and retain reviewed archive integrity checks | Bun has no registry signature or attestation audit command; the earlier npm signature proof is historical, not a current check; see docs/research/bun-policy.md | Codex |
| 2026-09-05 | Bootstrap Bun 1.4.2 in CI and Vercel from official archives with pinned SHA-256 checksums | Vercel’s Bun detection does not guarantee an exact package-manager patch; reuse one local installer without selecting the Bun Functions runtime or changing global tools | Codex |
| 2026-09-05 | Treat Bun as external build tooling, not a shipped runtime dependency | Bun itself is MIT; its own licence also lists linked LGPL libraries; no Bun binary enters the app output | Codex |
| 2026-09-03 | PRD gains an explicit problem statement (P13, §1); pitch deck built from docs 01–04 | The PRD stated what the product is but never what goes wrong without it | Afolabi / Claude |
