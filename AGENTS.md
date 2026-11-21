# AGENTS.md: Critter Crumbs

Read this before touching anything. The four documents in `docs/` are the spec; this file is the part every agent must keep in its head. The shared rules every agent follows on afo's machines are in `~/.agents/AGENTS.md`; cloud agents never load them. What must hold for every agent is enforced in the repository and CI (lint, tests, the guardrail hook, the required check); `.agents/policy.json` adds rules that only the machine-wide guards read.

## What this is

A private way for a group (a **burrow**) to decide how something is shared out. Everyone gets the same handful of **crumbs** and **scatters** them to **critters** (people or budget options). Every scatter stays encrypted until the **feast**, then it all opens at once. First real use: a council of 6–10 people, real money, after a rehearsal; planned for October 2026 with the rehearsal in September, neither has happened yet, and production is a testnet beta (`docs/decisions.md`, 2026-11-10). Docs: `docs/01-prd.md` (what and why), `02-design-system.md` (look, components, copy), `03-game-design.md` (feel, sound, the Koota simulation), `04-technical-spec.md` (how). Decisions not in the docs go in `docs/decisions.md`, append-only.

## Vocabulary: use these words, in code comments and in every UI string

| Term | Meaning |
|---|---|
| Critter | A target. A person or a budget option. Generated from an address. |
| Burrow | The group. Persistent, reused across feasts. |
| Feast | One whole event, and the moment everything opens. |
| Gathering | Phase one: everyone writes what they did, hidden from each other. |
| Scattering | Phase two: statements open, everyone scatters crumbs privately. |
| Crumbs | What you have to give. The same handful for everyone. |
| Scatter | The act of giving crumbs to a critter. |

**Never in user-facing copy:** seal, round, cache, vote, ballot, wallet. Say "connect", never "connect your wallet". `ballot` is allowed as a code identifier only. All copy lives in `packages/shared/src/copy.ts` with the IDs from `02-design-system.md` §10 (one exception, `copy-why.ts` beside it, holds the lines of the page behind Why nobody can peek, so the shell does not carry them; `docs/decisions.md`, 2026-11-09). Never inline a string in a component.

## Rules the code must enforce (PRD §5)

Equal crumbs for everyone · you must scatter all of them · you cannot scatter to yourself (people feasts) · results are proportions of crumbs actually scattered · non-scatterers still receive, and the burrow is told who did not scatter · three critters minimum for a people feast · the participant set freezes when scattering opens · the creator can cancel only before scattering and extend gathering only once · statements are plain text ≤ 2,000 chars, hidden until scattering opens · a scatter is a complete allocation, replaceable until close, latest counts · phases come from server time, never the browser clock · nobody triggers the feast: every client decrypts and tallies locally and gets the same result · no analytics, no telemetry.

## Engineering rules

- **Time is an input.** No `Date.now()` or `performance.now()` inside logic; take `now` as a parameter (`phaseAt(feast, now)`, Koota `Clock`). The server stamps `serverNow`; the client uses it.
- **The store is dumb.** The server never sees an allocation and never computes a result.
- **No `innerHTML`.** Statements render through `textContent`; links are created as elements.
- **No new dependency** without an entry in `docs/decisions.md`. Runtime list is in `04-technical-spec.md` §11.
- **The tally is pure and deterministic.** Arrays in position order, no floats, no object-key iteration. Its tests are the contract.
- **DOM owns layout; the canvas only draws critters** into stage rects (`02-design-system.md` §6.3). Text never renders in WebGL.
- **Portraits first; the 3D path stays.** Every stage renders the 2D portrait. Garden Spirits, the default look, have no mesh, so the default stage is portraits only (ADR 0006); version 1 at `?critters=1` crossfades to its mesh when the lazy 3D chunk is ready. Keep that path working: it stays (`docs/decisions.md`, 2026-11-21). Simple view is not an error path.
- **Every sound cue pairs with a DOM state.** No cue may carry meaning alone.
- **Copy IDs, not strings.** Errors from the API are copy IDs.
- **Each generator version is frozen.** `GEN_VERSION` 1 (`packages/core/src/generator/index.ts`) and `GEN_VERSION_2` (`versioned.ts`, which Garden Spirits draw) are both frozen; changing either one's output needs a new version and a decision.

## Rules and their enforcers

A rule with no enforcer but review is a candidate for one: a lint rule, a test, a CI check, or a line in `.agents/policy.json`.

| Rule | Enforcer | Where |
| --- | --- | --- |
| Time is an input: clocks only in the named adapters | lint `critter-crumbs/time-as-input` | `scripts/eslint-rules.mjs`, probes in `scripts/guardrails.test.mjs` |
| No `innerHTML` or HTML strings | lint `critter-crumbs/no-html` | same |
| Imports run app → core → shared, api → core and shared, by package name only | lint `critter-crumbs/imports` | same |
| Copy IDs, not strings, in components | lint `critter-crumbs/copy-ids` | same |
| No `<Canvas>` from `@react-three/fiber` | lint `no-restricted-imports` | `eslint.config.mjs` |
| Hooks follow the rules of hooks with complete dependencies; app markup is accessible | lint `react-hooks/*` and `jsx-a11y/*`, held to a shrink-only baseline of today's findings | `eslint.config.mjs`, `scripts/data/lint-baseline.json`, probes in `scripts/lint-rules.test.mjs` |
| No promise is left floating in package or route code | lint `@typescript-eslint/no-floating-promises` (type-aware) | same |
| Source is formatted, and no line runs past 200 characters | `format:check` (Biome), `scripts/line-length.test.mjs` | `biome.json` |
| No eval-style code in the bundle | build policy | `scripts/build-policy.mjs` |
| Shell and 3D chunks stay in budget | build budget | `scripts/build-budget.mjs` (`bun run build`) |
| Every dependency is reviewed: exact version, allowed licence, archive hash | `check:licenses` | `scripts/check-dependencies.mjs` and its two allowlists |
| The tally is pure and deterministic | tests | `packages/core/test/tally.test.ts` |
| Each generator version is frozen | vector tests | `packages/core/test/generator.test.ts`, `generator-v2.test.ts` |
| Generated design tokens match their source | `check:tokens` | `scripts/generate-tokens.mjs` |
| Bun and Node versions are the pinned ones | `check:toolchain` | `scripts/check-toolchain.mjs` |
| No force pushes, hard resets, forced cleans or deletions, wholesale discards, history rewrites | git guardrail hook for Claude Code and Codex; repo guard rules where the machine-wide guards run | `.claude/hooks/block-dangerous-git.sh`, `.codex/hooks.json`, `.agents/policy.json`; cases run by `bun run test` |
| A production deploy and EAS schema registration are afo's to run | credentials only he holds; repo guard rules `production-deploy`, `vercel-production`, `eas-schema-registration` (ask) | `.agents/policy.json` |
| Every pull request passes the full check and the production build before it merges | CI job `check`, the required check once afo applies the merge settings; admins can still bypass it, so agents never merge with `--admin` (repo guard rule `admin-merge`) | `.github/workflows/check.yml`, `.agents/merge-policy.json`, `.agents/policy.json` |
| A pull request records its tier and proof | PR template, review | `.github/pull_request_template.md`, `.agents/merge-policy.json` |
| No em dash in this file | `agents-doctor` (`no-em-dash`) | run locally until the doctor runs in CI |
| Never in user-facing copy: seal, round, cache, vote, ballot, wallet | review | `docs/02-design-system.md` §10 |
| Every sound cue pairs with a DOM state | review | `docs/03-game-design.md` |

## Merging and proof

`main` is the integration branch, and nothing deploys from it: production is a manual deploy. Agents merge every tier into `main` on proof alone, with merge commits. The tiers, their paths and their proof are in `.agents/merge-policy.json`: critical (keys, timelock, tally, generator, phases, encryption, sessions, writes, data, deploy, dependencies, everything that defines the required check, and CI), sensitive (`packages/shared`, `packages/api`, `api/`, the agent rules) and routine (everything else). Each pull request names its tier and its proof in its Verification section. afo's approval is needed only for `bun run deploy --production --execute` and an EAS schema registration, and both are his to run.

## Shared engineering guidance

Use the personal `pragmatic-programming` skill for coding work and
`domain-driven-design` when changing domain meaning, behavior, identity, lifecycle,
consistency, or integration contracts. If not discovered, read the relevant
`~/.agents/skills/<skill-name>/SKILL.md` when available. On an environment without
these personal skills, follow this repository's guidance and report the missing
shared guidance; do not install or duplicate it automatically. Load only relevant
references. Existing repository rules and explicit user decisions govern the work.

Use `.agents/skills/domain-modeling/SKILL.md` for resolved terminology and ADRs;
`CONTEXT.md` remains a glossary. The four specs and `docs/decisions.md` own behavior
and existing decisions. For a behavior change, identify its workstream owner and
verify the affected rule through its public seam, using the existing `tdd` workflow
where applicable. Preserve pure tallying, explicit time, encrypted allocations,
and the server/client responsibility boundary.

For lifecycle work, check the relevant participant freeze, scatter replacement,
and closing boundary against the spec before implementation. Use meaningful
regression examples and the applicable Commands checks. Update the owning spec or
decision when behavior changes; finish with the outcome and actual verification.
Do not create an aggregate hierarchy or a second rule registry merely to adopt DDD.

## Workstreams

- **A (core):** `packages/core`, `packages/api`, `db`, `scripts`: account, timelock, EAS, tally, API, data. Root `api/` contains only Vercel route exports; server implementation belongs in `packages/api/src`.
- **B (app):** `packages/app/src`, `packages/app/public`: screens, components, Koota world, 3D, audio, portraits.
- **Shared:** `packages/shared/src`: types, copy, constants (`feel.ts`), validators. Small reviewed changes only.

## Skills (any agent)

All skills live in `.agents/skills/`, the folder Codex reads; Claude Code reads it through the `.claude/skills` link, and `CLAUDE.md` is a link to this file. Five come from the shared agent kit (`dev-surfaces/agents/kit/skills`) and read `.agents/adapter.md` for this repository's commands and rules. Eight come from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, licence copied alongside). One skill per job:

| Skill | Use it when | Claude | Codex |
|---|---|---|---|
| `review` (kit) | Before every merge: regressions, requirement closure and readiness, ending in a verdict | `/review` | `$review` |
| `debug` (kit) | A bug, a failing test or build, or a QA finding: root cause first, then fresh proof | `/debug` | `$debug` |
| `plan` (kit) | Planning, sequencing or closing a body of work, or running it as parallel lanes | `/plan` | `$plan` |
| `ship` (kit) | Commit, push and open or update a pull request with its proof | `/ship` | `$ship` |
| `research` (kit) | A question that needs repository or primary-source evidence, such as the verify list in `docs/04-technical-spec.md` §18 | `/research` | `$research` |
| `tdd` | Building or fixing anything behind a named seam (tally, `phaseAt`, ballot verifier, Koota systems, `Timelock`, `Account`) | `/tdd` | `$tdd` |
| `codebase-design` | Laying out a module or an interface; deciding where a seam belongs | `/codebase-design` | `$codebase-design` |
| `to-tickets` | Turning a plan into tracer-bullet tickets with blocking edges | `/to-tickets` | `$to-tickets` |
| `implement` | Writing one ticket's code end to end (TDD, type-check, suite); `review` and `ship` take it from there | `/implement` | `$implement` |
| `domain-modeling` | Any time a term is fuzzy or new; it edits `CONTEXT.md` and proposes ADRs | model-invoked | model-invoked |
| `wait-what` | A message you do not understand; re-pitched in the glossary's words | `/wait-what` | `$wait-what` |
| `handoff` | Ending a session with work in flight | `/handoff` | `$handoff` |
| `git-guardrails-claude-code` | Changing the git guardrail. It is installed for both tools: `.claude/settings.json` and `.codex/hooks.json` run `.claude/hooks/block-dangerous-git.sh`, and `.claude/hooks/test-guardrail.sh` (run by `bun run test`) proves both block the cases in `guardrail-cases.txt` | n/a | n/a |

**Configuration the skills expect:** glossary `CONTEXT.md` (glossary only, no implementation detail) · ADRs in `docs/adr/` (one paragraph each, numbered) · specs in `docs/` · tracker: Linear, Product team, Critter Crumbs project (`docs/decisions.md`, 2026-11-21); issues already on GitHub stay there, and the local fallback is `.scratch/<feature>/issues/` (ignored by git) · decisions that are not ADRs go in `docs/decisions.md` · this repository's commands and rules for the kit skills: `.agents/adapter.md`.

## Commands

Use Bun 1.4.2 for package management and scripts; Node 22.22.1 for the function toolchain.

| Task | Command |
| --- | --- |
| Install | `bun install --frozen-lockfile --ignore-scripts` |
| Full check (CI runs it on every pull request) | `bun run check`: toolchain, tokens, formatting, lint, typecheck, tests, the git guardrail, assets, workspaces, licences, vulnerability audit |
| Format | `bun run format` (Biome); `bun run lint -- --shrink` lowers the lint baseline after fixing held findings |
| Tests only | `bun run test` (Vitest, the tooling tests, the guardrail cases) |
| Production build | `bun run build`: compiles workspaces, builds the app, enforces chunk budgets; CI runs `bun run vercel-build` |
| Local stack | `bun run dev:local`: Vite at `http://127.0.0.1:5173`, the API on PGlite at `:3000`, mock encryption and the dev clock (`docs/build/local-core.md`) |
| Browser suites | `bun run e2e:install` once, then `bun run e2e` (lifecycle, `tests/e2e`) or `bunx playwright test --config playwright.screens.config.ts`, against a running `dev:local` |
| Proof for a change | `node scripts/select-checks.mjs` prints the checks its changed paths need, by tier |
| Seed a phase | `bun run seed --phase <phase>` beside a running local stack |

`bun run dev` (Vite with `vercel dev`) needs the human-owned Vercel and Neon setup. The docs index is `docs/README.md`. Environment variables and modes: `04-technical-spec.md` §13. `SHUTTER_MODE=mock` is the default locally and must never be set in production.
