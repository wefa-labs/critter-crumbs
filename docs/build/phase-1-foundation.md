# Phase 1: foundation

Paste everything below the rule into the agent as its first message. Written for Codex (`$skill`) or Claude Code (`/skill`); use whichever syntax your runner reads.

---

You are setting up the repository for Critter Crumbs v0 so that two later agents can build the core and the app inside it without touching tooling again. Read `AGENTS.md` first, then `docs/build/README.md`, then `docs/04-technical-spec.md` §2, §10, §11, §12, §13, §14, §17 and §18, then `docs/decisions.md`. `CONTEXT.md` is the glossary; use its words in every file you write, comments included.

## Outcome

When you are done:

- The repository is an npm workspace with three packages, `packages/shared`, `packages/core` and `packages/app`, plus `api/`, `db/`, `scripts/` and `tests/e2e/` at the root, laid out as `docs/build/README.md` describes. Each package has a `package.json` with an explicit `exports` map, its own `tsconfig.json` extending a root base, and one smoke test. No domain logic: phase 2 writes it.
- Node 22 is pinned (`.node-version`, `engines`, `engine-strict`) and the lockfile is committed.
- The runtime dependencies are exactly the ten in Technical Spec §11, at exact versions, each with its licence verified permissive and its gzipped size recorded. The dev dependencies are §11's dev list. Nothing else without a line in `docs/decisions.md` saying why.
- The rules AGENTS.md states in words are enforced by tooling and fail `npm run check`: no `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `dangerouslySetInnerHTML`; no `Date.now`, `performance.now` or `new Date()` outside an allow-list of adapter files (the server clock, the ticker host, the api-client offset); one-way imports (`app → core → shared`, `api → core, shared`); no inline user-facing string literals in components (mechanism of your choice).
- `npm run check` runs lint, typecheck, the unit suite, the licence check and the dependency audit, and is green. `npm run build` produces the app and fails when a chunk exceeds the §17 budgets; the check is wired now, even though the chunks are near-empty, with the chunk names §17 uses (`three`, `crypto`).
- CI runs `npm ci` and `npm run check` on every push and pull request, actions pinned by commit SHA, `permissions: contents: read`.
- The tracker is ready: labels `ready-for-agent`, `blocked` and `needs-human` exist on `wefa-labs/critter-crumbs`, and `docs/agents/issue-tracker.md` tells the vendored skills how to fetch and file issues with `gh` (the `code-review` skill looks for that file).
- `AGENTS.md` §Workstreams and §Commands describe the new paths and scripts. `docs/decisions.md` has one line for the workspace layout and one per verified fact below.

## Facts you can rely on

- The tree has no `package.json` today: only docs, `AGENTS.md`, `CONTEXT.md`, ADRs, the pitch deck and the vendored skills in `.agents/skills/`.
- The shell may resolve Node 18.18.2; mise has 22.22.1 installed. Use 22.
- The git guardrail in `.claude/hooks/` blocks destructive git; ordinary pushes are allowed.
- The package manager is npm (AGENTS.md's commands use it). Do not switch.
- Vercel Functions live in `api/` at the project root (Technical Spec §10, §12). Keep them there.

## Verify before relying on it

Unknowns. Check each against primary sources, write the finding to `docs/research/<slug>.md` with the `research` skill, and add a decisions line for anything that changes the spec:

1. **V1** (Technical Spec §18): `@shutter-network/shutter-sdk` exports, whether it needs WASM (the §2 CSP carries `'wasm-unsafe-eval'` for it), its gzipped size, and above all its licence. A copyleft licence blocks this proprietary product (§12): stop and report rather than installing it.
2. Vercel's Node function bundler and npm workspaces: whether files in `api/` can import `@critter-crumbs/core` through a workspace symlink, and whether they need built `dist/` output or can consume TypeScript sources. Decide, implement the winning shape, record it. If neither works, fall back to the flat tree named in `docs/build/README.md`.
3. Whether `ignore-scripts=true` in `.npmrc` leaves the toolchain working (Playwright browsers install explicitly with `npx playwright install`). Keep it on if it does; if one package genuinely needs its install script, allow that package only and record it.
4. Whether the npm version in use supports `npm audit signatures` and a minimum release age or cooldown setting. Enable what exists.

## Scope

In: everything under Outcome, plus `vercel.json` with the §10 rewrite and the §2 response headers (`connect-src` hosts as placeholders for phase 2), `.env.example` listing every §13 variable with no values, `.github/dependabot.yml` for weekly grouped updates, and the CI workflow.

Out: domain code of any kind (tally, phase, generator, handlers); UI; changes to `docs/01`–`04` beyond a path correction in Technical Spec §12 if you make one; Vercel project linking and Neon provisioning (a person does those; file one `needs-human` issue listing exactly which variables they must set); branch protection and secret scanning settings (same).

## Method

1. Read the inputs. Invoke `$codebase-design` and lay the packages out as deep modules: each package's `exports` map is its interface and should be small. Write the intended tree and each package's `exports` before creating files.
2. Install runtime dependencies one at a time from the §11 table, recording for each the exact version, the licence read from the package's own `LICENSE` file and `package.json` (not from memory), and the gzipped size measured with a build or `npm pack`. Put the table in `docs/research/dependencies.md`. Any licence outside MIT, Apache-2.0, BSD, ISC or OFL stops the phase for that package and gets a `needs-human` issue.
3. Write `.npmrc` (`save-exact`, `engine-strict`, `ignore-scripts`, `audit-level=high`, plus what item 4 found), `.node-version`, the root `package.json` with workspaces and scripts, the base tsconfig, the ESLint configuration with the rules under Outcome, vitest with a project per package, and the Vite configuration in `packages/app` with the manual chunk names above.
4. One smoke test per package that imports through the package's public entry, so what is tested is the workspace resolution. Then CI, `vercel.json`, `.env.example`, the labels, `docs/agents/issue-tracker.md`, and the `AGENTS.md` updates.
5. `$code-review` with the fixed point at the commit you started from, both axes; act on the findings.
6. Commit on a branch named `phase-1/foundation`, push, open a pull request with `gh pr create`. Do not merge it.
7. Finish with the `handoff` skill: what exists, the exact commands, the open `needs-human` issues, the verify findings.

## Rules that bind here

- AGENTS.md in full. In particular: no new dependency without a decisions line; the vocabulary in every comment and string; `ballot` only as a code identifier.
- Never write a secret anywhere in the tree. `.env*` is ignored already; `.env.example` has names only.
- Do not enable install scripts to "make it work". Find out why and record it.
- Do not create the Vercel project, provision a database, or change repository settings. File them.

## Evidence for the pull request

```bash
node --version
npm ci
npm run check
npm run build
npm audit --audit-level=high
gh label list
```

Paste the output of each, the dependency table, and the decisions lines you added.

## Stop conditions

Stop and report, rather than work around, if: the Shutter SDK licence is not permissive; workspace resolution fails in both shapes; `gh` is not authenticated (file the labels in the handoff instead); or any rule in AGENTS.md would have to be broken to proceed.
