# Repository adapter: Critter Crumbs

The kit skills (review, debug, plan, ship, research) keep the method; this file holds what is specific to Critter Crumbs. `AGENTS.md` owns the rules; this file points to it and adds only what it does not say. Each skill reads its own section plus `## checks`.

## checks

### Guide
`AGENTS.md` § Commands and § Merging and proof; tiers and their proof in `.agents/merge-policy.json`. Follow those when this summary differs.

### Base
`origin/main`, the pull request base for every branch. Fetch first: a local `main` may be far behind.

### Command rules
Bun 1.4.2 and Node 22.22.1 (`.bun-version`, `.node-version`; `bun run check:toolchain` fails on others). Run tests with `bun run test`, never `bun test` (Bun's own runner; the suites are Vitest and `node --test`). Install with `bun install --frozen-lockfile --ignore-scripts`. Cross-package imports resolve to built `dist`, so compile (`node node_modules/typescript/bin/tsc -b`) before a single Vitest project; the selector's commands already do.

### Selector
`node scripts/select-checks.mjs --intent <intent>` (the kit's selector, policy in `scripts/data/validation-policy.json`); with no `--paths` it reads the branch's changes against `origin/HEAD`. Intents: `ship` (default; the proof a pull request records), `push` (needs `--test-path <shared|core|app>:test/<file>.test.ts`, or `--check full-check`), `review` and `diagnose` (evidence only). Fallback: choose from Tiers below by the change's tier in `.agents/merge-policy.json`, and say the selector failed.

### Tiers
| Tier | Use | Command |
|---|---|---|
| targeted | the smallest proof of one changed behavior | `node node_modules/typescript/bin/tsc -b && CC_API_DATABASE=pglite node node_modules/vitest/vitest.mjs run --project <shared\|core\|app\|api> <test path>` |
| style | non-mutating format and lint | `bun run format:check && bun run lint` |
| checkpoint | a coherent cross-package batch or shared-interface change | `bun run test` |
| push | ready-for-CI gate on the committed tree | `bun run check` |
| readiness | production-readiness review | `bun run check && bun run vercel-build` |
| full | full local gate | `bun run check && bun run vercel-build` |
| release | production deploy plan (print only; executing is afo's) | `bun run deploy --production` |

### Conditional checks
- A change that renders under `packages/app/src` → labeled captures at 375 and 1280 wide from the local stack (`bun run dev:local`), or a line saying why they are pending.
- `tests/e2e/**` or a game screen → `bun run e2e` against a running `bun run dev:local`.
- `tests/deployment/**` or `scripts/deployment/**` → the selector's `deployment-test`.
- `tests/screens/**` → `node node_modules/playwright/cli.js test --config playwright.screens.config.ts` against a running `bun run dev:local`.
- `db/migrations/**` → `bun run test` (the api project migrates PGlite from scratch).
- A dependency → `bun run check:licenses` and `bun run check:audit` (both in `bun run check`), plus a `docs/decisions.md` line.

### Criticality
`.agents/merge-policy.json`: critical (keys, timelock, tally, EAS, generator, phases, client-side encryption, sessions and server writes, `db/`, deploy, dependencies and their allowlists, everything that defines the required check, the git guardrail, `.github/workflows/`), sensitive (`packages/shared/`, `packages/api/`, `api/`, the agent rules), routine (the rest). Critical: the full gate and the production build plus an adversarial review by a fresh agent. Sensitive: `bun run check` plus that review.

### CI
GitHub Actions, workflow `Foundation checks` (`.github/workflows/check.yml`), job `check`: `bun run check`, then `bun run vercel-build`, on every push and pull request. `check` is the one required check. The Playwright suites do not run in CI yet. Actions must be GitHub-owned and pinned by SHA: the wefa-labs organisation allows only listed actions, and one unlisted action fails the whole workflow at startup.

### Rendered proof
The local stack (`bun run dev:local`: Vite on `127.0.0.1:5173`, the API on PGlite at `:3000`, mock encryption, the dev clock) and `bun run seed --phase <phase>` for a feast in any phase (`docs/build/local-core.md`). Captures are labeled with screen, state, width and theme, at 375 and 1280 wide. Captures are advisory: record them or say why they are pending; they never block.

## review

### Scopes
shared → `packages/shared/**`; core → `packages/core/**`; app → `packages/app/**`; api → `packages/api/**`, `api/**`, `db/**`, `tests/api/**`; e2e → `tests/e2e/**`, `tests/screens/**`, `playwright*.config.ts`; tooling → `scripts/**`, `.claude/hooks/**`, `.codex/**`, `.github/**`, `.agents/**`; docs → `docs/**`, `AGENTS.md`, `CONTEXT.md`, `README.md`

### Special scopes
none

### Dependency order
shared → core → app; shared → core → api. Enforced by the `critter-crumbs/imports` lint rule.

### Requirement sources
The pull request body and the issue it links (a GitHub issue as `wefa-labs/critter-crumbs#<n>`, or an issue afo names); the specs `docs/01-prd.md` to `docs/04-technical-spec.md`; `docs/decisions.md`; `docs/adr/`.

### Invariants
`AGENTS.md` § Rules the code must enforce and § Engineering rules: the PRD §5 feast rules, time as an input, a dumb store, no `innerHTML`, a pure and deterministic tally, copy IDs, frozen generator versions, sound cues paired with DOM state.

### Quality bar
`AGENTS.md` § Engineering rules and § Shared engineering guidance.

### Architecture guide
`.agents/skills/codebase-design/SKILL.md`

### State lens
Triggers: phases, the participant freeze, scatter replacement, closing, cancel and the one extension, key release, result records. Matrix: `docs/01-prd.md` §5 and §6. Rules: `docs/04-technical-spec.md`.

### Critical lenses
tally → determinism: arrays in position order, integer arithmetic, no object-key iteration, the same result hash for any ballot order; timelock and keys → nothing opens before the feast, the server never sees an allocation; session → nonce, expiry and the address it binds; server writes → the RepeatableRead snapshot and revision-gated retry in `burrow-transactions.ts`; generator → the version's vector tests unchanged; `db/` → forward-only migrations that apply on PGlite and Neon; workflows → GitHub-owned actions pinned by SHA.

### Test budget
none written; the tally's and generator's tests are the contract (`AGENTS.md`).

### Deep pass
An adversarial review by a fresh agent with no context from the author's session, given the diff and `AGENTS.md`.

### Gap shapes
A string inlined in a component instead of a copy ID; a clock read inside logic; a forbidden word in copy (seal, round, cache, vote, ballot, wallet); a sound cue with no DOM state; a screen change with no captures; a change that grows the shell chunk toward its 120 KB budget.

### Not findings
`ballot` as a code identifier; `devCopy` strings, which only development pages load; dated documents under `docs/reviews`, `docs/explorations` and `docs/build/phase-*`, which record how the app was built and are not maintained.

### Immutable records
`docs/decisions.md` (append-only: a correction is a new entry), `docs/adr/*`, `docs/reviews/**`, `docs/build/phase-*`

### Tracker
None an agent writes to: afo tracks Critter Crumbs in a Linear workspace agents here cannot reach. Report findings in the pull request or to afo.

## debug

### Context
`AGENTS.md`, `CONTEXT.md`, `docs/04-technical-spec.md`, `docs/build/local-core.md`

### Reporters
Burrow members (a council of 6 to 10 people) and afo.

### Safety
Never run `bun run deploy --production --execute` or `bun run register-schemas --execute` (afo's; `.agents/policy.json` asks). Never point the local stack at a production `DATABASE_URL`, never set `SHUTTER_MODE=mock` outside local work, and never read `.env`. Read-only probes: `bun run check:shutter`, `bun run register-schemas --check`.

### Real surface
The testnet beta at `https://www.crittercrumbs.app` (Gnosis Chiado and Base Sepolia). Locally: `bun run dev:local`, then `bun run seed --phase <draft|gathering|scattering|feast|...>`, and the dev clock controls to move a feast between phases.

### Layers
Triage: shared, core, app (screens, Koota world, portraits, 3D, audio), api, db. Data: Neon in production, PGlite locally. Evidence: Playwright traces and the lapses `tests/e2e/watch.ts` records.

### Data path
result on screen → `tally()` in the client → decrypted scatters → the timelock key released at the feast → encrypted scatters stored by the API → the client's encryption at scatter time.

### Environment truth
`SHUTTER_MODE`, `EAS_CHAIN_ID` (84532 on the testnet beta), `APP_ORIGIN`; the deployment record in `docs/build/deployment.md`.

### Boundary probes
API: call the handlers in process as `tests/api/support.ts` does, on PGlite. Shutter: `bun run check:shutter`. EAS: `bun run register-schemas --check`.

### Known errors
none recorded

### UI gotchas
Playwright's WebKit plays the app's sound aloud: silence it in WebKit runs. A failed lazy chunk can leave a screen blank until a reload. Development CSS is unprefixed, so check WebKit-specific styling on the production bundle.

### Known symptoms
| Symptom | Likely cause | Diagnostic |
|---|---|---|
| Phases look wrong locally | The shared dev clock was moved by a seed or a test | The `X-Dev-Clock-Offset` header on any API reply |
| A blank game frame in e2e | A lapse `watchGameScreen` records | The trace of the failing spec |

### Evidence map
routes → `api/` (one-line Vercel exports) → `packages/api/src/api.ts`; migrations → `db/migrations/`; copy → `packages/shared/src/copy.ts`; feel constants → `packages/shared/src/feel.ts`; the world → `packages/app/src/world/`

### Telemetry
none: no analytics and no telemetry is a product rule.

### Known-failure notes
none

### Slices
none

### Tracker
None an agent writes to: afo tracks Critter Crumbs in a Linear workspace agents here cannot reach. Ask afo where a finding goes.

## plan

### Context
`AGENTS.md`, `CONTEXT.md`, `docs/README.md`, the four specs.

### Quality bar
`AGENTS.md` § Engineering rules

### Priorities
the feast rules hold → nothing opens before the feast → the shell stays in its budget → feel

### Design sections
Copy: new lines as IDs in `docs/02-design-system.md` §10. Sound: each cue and the DOM state it pairs with. Bundle: the shell and 3D chunk budgets.

### Architecture guide
`.agents/skills/codebase-design/SKILL.md`

### Seam registry
none

### Plan location
Working notes in `.scratch/<feature>/` (ignored by git); afo keeps the plan of record.

### Plan files
none

### Lanes and proof
The `tdd` skill for anything behind a named seam.

### Dependency order
shared → core → api → app; a migration lands before code that reads it.

### Always-separate
A formatting or codemod pass and a behavior change; a generator output change and anything else; a dependency bump and a feature.

### Plan triggers
A change to a PRD §5 rule or the feast lifecycle: it changes the spec too. A new dependency: it needs a decision. A new generator version.

### Start gate
`git fetch origin` and cut the branch from `origin/main`.

### Tracker mirror
none

### Closeout
Update the owning spec, add a `docs/decisions.md` entry when behavior or a choice changed, and record the proof in the pull request.

### Lifecycle
none

### Templates
none

### Teams
none

## ship

### Branch check
none

### Protected branches
main

### PR issue line
none required; link the GitHub issue when there is one.

### Hooks
No git hooks. The git guardrail runs as an agent hook (`.claude/settings.json`, `.codex/hooks.json`).

### Commit format
`type(scope): subject` in plain words (`feat(app):`, `fix(api):`, `test(e2e):`, `docs:`), then the trailers `~/.agents/AGENTS.md` asks for. Commits are signed: if signing fails, stop and tell afo.

### Push gate
none local; CI's `check` job is the gate.

### PR
`.github/pull_request_template.md`: Why, Measured, Verification (the tier and its proof), Not verified.

### Merge
`.agents/merge-policy.json`: merge commits only (`gh pr merge --merge`), agents merge every tier on its proof, merged branches are deleted.

### After merge
none: nothing deploys from `main`; a production deploy is afo's.

### Report line
none

### Unattended
Dependabot pull requests: refresh the dependency allowlists in one reviewable commit; nothing else.

## research

### Plan entry point
`docs/README.md`, then the owning spec section.

### Neighbor skills
why something is the way it is → `docs/decisions.md` and `docs/adr/` first; a bug → `debug`; a change review → `review`

### Durable evidence
The owning spec section, with its primary source; otherwise the pull request that needs it.

### Mapping workflow
none

### Tracker
None: agents file nothing in Linear, which afo keeps in a workspace they cannot reach.
