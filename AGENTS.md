# AGENTS.md — Critter Crumbs

Read this before touching anything. The four documents in `docs/` are the spec; this file is the part every agent must keep in its head.

## What this is

A private way for a group (a **burrow**) to decide how something is shared out. Everyone gets the same handful of **crumbs** and **scatters** them to **critters** (people or budget options). Every scatter stays encrypted until the **feast**, then it all opens at once. First real use: a council of 6–10 people in October 2026, real money, rehearsal in September. Docs: `docs/01-prd.md` (what and why), `02-design-system.md` (look, components, copy), `03-game-design.md` (feel, sound, the Koota simulation), `04-technical-spec.md` (how). Decisions not in the docs go in `docs/decisions.md`, append-only.

## Vocabulary — use these words, in code comments and in every UI string

| Term | Meaning |
|---|---|
| Critter | A target. A person or a budget option. Generated from an address. |
| Burrow | The group. Persistent, reused across feasts. |
| Feast | One whole event, and the moment everything opens. |
| Gathering | Phase one: everyone writes what they did, hidden from each other. |
| Scattering | Phase two: statements open, everyone scatters crumbs privately. |
| Crumbs | What you have to give. The same handful for everyone. |
| Scatter | The act of giving crumbs to a critter. |

**Never in user-facing copy:** seal, round, cache, vote, ballot, wallet. Say "connect", never "connect your wallet". `ballot` is allowed as a code identifier only. All copy lives in `src/shared/copy.ts` with the IDs from `02-design-system.md` §10 — never inline a string in a component.

## Rules the code must enforce (PRD §5)

Equal crumbs for everyone · you must scatter all of them · you cannot scatter to yourself (people feasts) · results are proportions of crumbs actually scattered · non-scatterers still receive, and the burrow is told who did not scatter · three critters minimum for a people feast · the participant set freezes when scattering opens · the creator can cancel only before scattering and extend gathering only once · statements are plain text ≤ 2,000 chars, hidden until scattering opens · a scatter is a complete allocation, replaceable until close, latest counts · phases come from server time, never the browser clock · nobody triggers the feast: every client decrypts and tallies locally and gets the same result · no analytics, no telemetry.

## Engineering rules

- **Time is an input.** No `Date.now()` or `performance.now()` inside logic; take `now` as a parameter (`phaseAt(feast, now)`, Koota `Clock`). The server stamps `serverNow`; the client uses it.
- **The store is dumb.** The server never sees an allocation and never computes a result.
- **No `innerHTML`.** Statements render through `textContent`; links are created as elements.
- **No new dependency** without an entry in `docs/decisions.md`. Runtime list is in `04-technical-spec.md` §11.
- **The tally is pure and deterministic.** Arrays in position order, no floats, no object-key iteration. Its tests are the contract.
- **DOM owns layout; the canvas only draws critters** into stage rects (`02-design-system.md` §6.3). Text never renders in WebGL.
- **Portraits first, 3D later.** Every stage renders the 2D portrait, then crossfades to the mesh when the lazy chunk is ready. Simple view is not an error path.
- **Every sound cue pairs with a DOM state.** No cue may carry meaning alone.
- **Copy IDs, not strings.** Errors from the API are copy IDs.
- **Generator is frozen** at `GEN_VERSION 1` before the rehearsal; changing its output needs a version bump and a decision.

## Workstreams

- **A (core):** `src/core`, `api`, `db`, `scripts` — account, timelock, EAS, tally, API, data.
- **B (app):** `src/app`, `public` — screens, components, Koota world, 3D, audio, portraits.
- **Shared:** `src/shared` — types, copy, constants (`feel.ts`), validators. Small reviewed changes only.

## Skills (any agent)

Ten skills from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, licence copied alongside) are vendored in `.agents/skills/` — the cross-agent location Codex reads natively and the `skills` installer treats as canonical. Claude Code reads them through the `.claude/skills` symlink; `CLAUDE.md` is a symlink to this file. For another agent, point it at `.agents/skills/` or run `npx skills@latest add mattpocock/skills` (Node 20+) and pick that agent.

| Skill | Use it when | Claude | Codex |
|---|---|---|---|
| `tdd` | Building or fixing anything behind a named seam (tally, `phaseAt`, ballot verifier, Koota systems, `Timelock`, `Account`) | `/tdd` | `$tdd` |
| `codebase-design` | Laying out a module or an interface; deciding where a seam belongs | `/codebase-design` | `$codebase-design` |
| `code-review` | Before every merge: Standards axis against this file, Spec axis against `docs/` | `/code-review` | `$code-review` |
| `to-tickets` | Turning `docs/04-technical-spec.md` §16 (or any plan) into tracer-bullet tickets with blocking edges | `/to-tickets` | `$to-tickets` |
| `implement` | Working a ticket end to end: TDD, type-check, suite, review, commit | `/implement` | `$implement` |
| `domain-modeling` | Any time a term is fuzzy or new; it edits `CONTEXT.md` and proposes ADRs | model-invoked | model-invoked |
| `wait-what` | A message you do not understand; re-pitched in the glossary's words | `/wait-what` | `$wait-what` |
| `research` | The verify-list in `docs/04-technical-spec.md` §18 and any other question needing primary sources | model-invoked | model-invoked |
| `handoff` | Ending a session with work in flight | `/handoff` | `$handoff` |
| `git-guardrails-claude-code` | Already installed here (Claude Code only): `.claude/hooks/block-dangerous-git.sh` blocks push, reset --hard, clean, branch -D, checkout . — Codex runs in its own sandbox with approvals instead | — | — |

**Configuration the skills expect** (in place of `/setup-matt-pocock-skills`, which is not installed): glossary `CONTEXT.md` (glossary only, no implementation detail) · ADRs in `docs/adr/` (one paragraph each, numbered) · specs in `docs/` · tracker: GitHub issues on this repository (moving to the WEFA organisation) with labels `ready-for-agent`, `blocked`, `needs-human`; local fallback `.scratch/<feature>/issues/` (ignored by git) · decisions that are not ADRs go in `docs/decisions.md`.

## Commands

`npm run dev` (Vite + `vercel dev`, mock timelock, Neon dev branch) · `npm test` · `npm run e2e` (mock-mode lifecycle) · `npm run migrate` · `npm run seed` · `npm run build` (fails on chunk budgets).

Environment variables and modes: `04-technical-spec.md` §13. `SHUTTER_MODE=mock` is the default locally and must never be set in production.
