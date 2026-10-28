# Build flow for v0

Four phases, three models, one rehearsal deadline. Each phase is a prompt in this directory, written to be pasted whole into the agent that runs it. `AGENTS.md` comes first for every agent; the four documents in `docs/` remain the spec and nothing here overrides them.

| File | Phase | Runner |
|---|---|---|
| `phase-1-foundation.md` | Workspace, toolchain, dependencies, guardrails | Any agent (written for Codex or Claude Code) |
| `phase-2-core.md` | The core contract: shared types, generator, tally, timelock, EAS, API, data | GPT 6 via Codex |
| `phase-3-game.md` | The game system and the first UI | GPT 6 via Codex, with its web game skill |
| `phase-4-polish.md` | Settle the design system, then deep polish | Claude Fable 5.1 in Claude Code |

## What is true at the end of each phase

| # | What is true | Proof |
|---|---|---|
| 1 | npm workspaces with the three packages and `api/` at the root; Node 22 pinned; the ten runtime dependencies of Technical Spec §11 installed, licence-checked and size-measured; lint rules that enforce the AGENTS.md rules; CI; tracker labels | `npm ci && npm run check` green on an empty skeleton; `docs/decisions.md` records the layout |
| 2 | Technical Spec §16 column A (core) through M4: the mock lifecycle runs headless through the API and the tally's §8 test list is green by name | `npm test` green offline; one API-level lifecycle test where two independent tallies reach the same `resultHash` |
| 3 | Technical Spec §16 column B (app) through M5: Koota world, portraits, every screen, the heap and hop, sound, the feast in Simple view, then the 3D layer behind portraits; the lifecycle playable end to end in mock mode | `npm run e2e` green; Game Design §7.5 headless tests green by name; a keyboard-only lifecycle pass |
| 4 | Design System revised to the direction that converged in `docs/explorations/`, `GEN_VERSION` bumped by decision, every screen aligned to tokens, components and copy; accessibility and budgets proven | axe clean; Lighthouse accessibility ≥ 95; `npm run build` inside §17 budgets; the Game Design §10 checklist ready for phones |

Phase 3 reached its integration branch on 2026-09-23 as [PR #29](https://github.com/wefa-labs/critter-crumbs/pull/29); its status, evidence and open gates are in `phase-3-handoff.md`, `phase-3-validation.md` and `phase-3-test-evidence.txt`.

Phase 4 has a human checkpoint in the middle: the design settle needs the reviewer's approval before code is re-skinned. Its first half touches only `docs/`, so it can run any time after phase 1, in parallel with phases 2 and 3. That is the single biggest schedule saver in this plan.

## What each phase hands over

Every phase ends the same way, so the next agent starts from a known state:

1. The suite the phase owns is green, and the command that proves it is in the handoff.
2. Every decision not already in `docs/01`–`04` is a line in `docs/decisions.md` (append-only: date, decision, why, who). No new dependency without one.
3. Work is on branches, pushed, with a pull request per ticket or per milestone. The reviewer merges. Assumption: change the "do not merge" line in a prompt if you want the agent to merge after a green `$code-review`.
4. A handoff document written with the `handoff` skill, saved where the skill puts it and linked from the last pull request: what is done, what is in flight, what is blocked, which skills the next agent should call.
5. Anything only a person can do is a GitHub issue labelled `needs-human`.

The `to-tickets` step in phases 2, 3 and 4 pauses for your approval of the ticket breakdown. That is the moment to re-cut scope.

## Before phase 1 starts

- Commit or stash the uncommitted work on `main` (`docs/01-prd.md`, `docs/decisions.md`, `.gitignore`, `docs/pitch/`, `.claude/launch.json`) so the phase starts from a clean tree.
- Node: the shell reports 18.18.2; mise has 22.22.1 installed. Phase 1 pins 22. Make sure the agent's shell resolves it (`mise use node@22` in the repository, or mise activated in the shell profile).
- `gh auth status` must succeed: phase 1 creates the tracker labels, and phases 2 to 4 publish tickets as issues on `wefa-labs/critter-crumbs`.
- Codex reads `.agents/skills/` natively; Claude Code reads the same skills through `.claude/skills`. Nothing to install.

## Steps only a person can do

These recur across phases; each prompt tells the agent to file them as `needs-human` issues rather than guess.

| Step | Needed by |
|---|---|
| Create the Vercel project, link the repository, provision Neon through the Marketplace, set the Technical Spec §13 variables | Phase 2 (`vercel dev`, API tests against a Neon branch) |
| Register for the Shutter API key (T14); confirm plan and gas coverage (V2) | Phase 2, M4 |
| RPC keys: Base Sepolia and mainnet (ENS) | Phase 2, M1 and M4 |
| Register the ballot and result schemas on Base Sepolia, later Base | Phase 2, M4; phase 4, M6 |
| The domain `crittercrumbs.app` and production configuration | Phase 4, M6 |
| Approve the settled design system (palette, type, the element critters, `GEN_VERSION 2`) | Phase 4, half one |
| Real phones for the Game Design §10 checklist and the device floor (GQ3) | Phase 4 |
| Resolve PRD Q8, Design System DQ1 to DQ4, Game Design GQ1 to GQ3 where a phase needs them | As flagged |
| Enable branch protection and secret push protection on the repository | Phase 1 (recommended) |

## Running the prompts

Phases 2 and 3 include MIT software and separately reserved generator, art and audio material; see the [licence overview](../../LICENSE). When using the private Codex profile, choose the GPT 6 model id with `-m`:

```bash
codex --profile-v2 private -m <gpt-6-model-id> "$(cat docs/build/phase-2-core.md)"
```

Long phases run better as an interactive session than as `codex exec`; the prompt is the first message. If the private profile blocks web access, run the `$research` step (the Technical Spec §18 verify list) in the default profile first: it writes only under `docs/research/`.

Phase 4 runs in Claude Code from the repository root; paste `phase-4-polish.md` as the first message.

## Package layout: the one deviation from the spec

Technical Spec §12 draws a flat `src/{shared,core,app}` tree. This flow asks for npm workspaces instead, because package boundaries make the workstream seams real: a package can only import what another package exports. The mapping phase 1 implements and records:

| Spec path | Workspace |
|---|---|
| `src/shared` | `packages/shared` (`@critter-crumbs/shared`) |
| `src/core` | `packages/core` (`@critter-crumbs/core`) |
| `src/app`, `public/` | `packages/app` (`@critter-crumbs/app`, the Vite root) |
| `api/`, `api/_lib` | `api/` at the repository root, as Vercel requires; thin route files importing from `core` and `shared` |
| `db/`, `scripts/`, `tests/e2e/` | Repository root |

Import direction is one way: `app → core → shared`; `api → core, shared`; never `core → app`. If Vercel's function bundler cannot follow workspace packages (phase 1 checks), the fallback is the spec's flat tree with TypeScript project references and lint-enforced boundaries; the seams and the package names stay the same either way.

## Schedule

Technical Spec §16 planned two agents in parallel from 3 September with a rehearsal-ready build by 25 September. This flow is sequential across models, which is slower. Two things keep it honest: PRD P5's cut line (trust chain, then the scatter flow on phones, then results and CSV, then Simple view; 3D and sound are the flex) is repeated in phases 3 and 4, and the design settle runs in parallel. Each phase's `to-tickets` step re-dates the milestones from the day it starts and records the new dates in `docs/decisions.md`.
