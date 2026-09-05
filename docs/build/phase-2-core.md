# Phase 2: the core contract

Paste everything below the rule into Codex as the first message of the session.

---

You are building the core of Critter Crumbs v0: the shared contract, the pure modules, the cryptography seams, the API and the data layer, all proven by a local test suite. There is no UI in this phase. Read `AGENTS.md`, `CONTEXT.md`, `docs/build/README.md`, then all of `docs/04-technical-spec.md`, then `docs/01-prd.md` §5–§8 and §11, `docs/02-design-system.md` §5.1–§5.2, §5.7 and §10, `docs/03-game-design.md` §2.1, §3.4 and §5.6 (the constants that live in `feel.ts`), the ADRs in `docs/adr/`, `docs/decisions.md`, and `docs/research/` for what phase 1 verified. Phase 1's handoff is linked from its pull request.

## Outcome

Technical Spec §16, column A (core), milestones M0 through M4, built, tested and ready to merge:

- `packages/shared`: the types every layer shares; `copy.ts` holding every string ID of Design System §10 plus `results.unreadable` and `err.notParticipant` (Technical Spec §15), keyed by ID with the `{}` interpolation slots typed; `feel.ts` with every constant of Game Design §2–§4 under the names those sections use; `validate.ts`, hand-written parsers, no schema library; canonical JSON (sorted keys, no whitespace) with tests.
- `packages/core`: `phase.ts` with `phaseAt(feast, now)` as the only place phase is computed; the generator (Design System §5.1–§5.2 draw order, `GEN_VERSION` `"1"`, cyrb53 and mulberry32 inline, the §5.7 layout step) with fixed-seed tests that pin its output; `tally` exactly as §8, pure, no floats, arrays in position order, every test of the §8 list present under its own name; `account/` with the `Account` and `AccountProvider` interfaces of §5, an EIP-6963 + viem adapter and a local private-key adapter for tests and e2e; `timelock/` with the `Timelock` interface of §6 and its `mock`, `chiado` and `mainnet` implementations selected by `SHUTTER_MODE`; `eas/` with the typed data of §7, the off-chain UID, the ballot schema encoding and the result schema encoding; `api-client/` with the `serverNow` offset and the 60-line fetch cache (T9).
- `api/`: every route of §9 with its auth column enforced, `serverNow` on every response, errors as `{ error: '<copy id>' }`, phase gates through `phaseAt(feast, serverNow)`, writes in transactions, the two idempotent "first request after" effects of §4, the session cookie of §2 (T6), the sign-in message of §5, the §2 headers, and the dev endpoints gated by `DEV_ENDPOINTS_ENABLED`.
- `db/migrations/0001_init.sql` as §3, `scripts/migrate.ts`, `scripts/seed.ts` (the eight deterministic critters and `fixtures/statements.json`, §14), `scripts/register-schemas.ts`.
- `npm run dev` as AGENTS.md describes. If the Vercel project is not linked when you get there, add `dev:local`: the same handlers served with `node:http` and the mock timelock, so phase 3 is never blocked on linking.
- Tests per §14: unit; crypto (mock round-trip, the EAS SDK cross-check of §7 and V4, UID stability); API (every phase gate with injected `now`; membership; the close record produced once under concurrent first requests; ballot verification rejecting bad signatures, wrong feast, non-participants, late submissions). Plus one API-level lifecycle test in mock mode: seed → sign in as N local accounts → statements → advance time → scatter and resubmit → advance → release key → two independent tallies produce the same `resultHash`. This is phase 3's e2e without a browser.

## Facts and assumptions

Verified by phase 1: the dependency table and research files; the workspace layout; the ten runtime dependencies are installed and nothing else is; the lint rules for `innerHTML`, wall-clock reads, import direction and inline strings are on.

Assumed until you check: the §18 verify list V2, V3, V4 and V6 is still open (V1 was phase 1's). Do these on day one with `$research` into `docs/research/`; each finding that changes a shape in the spec gets a decisions line before the code that depends on it.

Open questions you must not answer in code: PRD Q8; the plan question inside V2 (T14 says the project account holds the Shutter key; you cannot register for it). File `needs-human` issues.

## Scope

In: everything under Outcome. Out: anything in `packages/app` beyond what phase 1 left; the Koota world; portraits and meshes; audio; Playwright; production configuration; posting anything on a real chain. The `chiado` and `mainnet` timelock adapters are written against the API shapes of §6 and unit-tested with recorded fixtures; they run live only if V2 shows Chiado needs no key and the reviewer has set the `chiado` variables of §13. Otherwise the live Chiado feast is a `needs-human` follow-up.

## Method

1. Day one: the verify list, then `$codebase-design` for the module layout. Name the seams before any test is written (the `$tdd` skill requires agreed seams): `tally(input)`, `phaseAt(feast, now)`, `canonicalJSON`, the validators, `generate(address, variant)` and `layout(params)`, the sign-in message builder and verifier, `Timelock` (two real adapters make it a real seam), `Account`, the ballot verifier on the server, the close record writer, and each API handler called with a fake request and an injected clock. Put the list in the handoff; the reviewer will read it.
2. Turn §16 column A into tickets with `$to-tickets`: tracer-bullet vertical slices with blocking edges, published as GitHub issues labelled `ready-for-agent`. Re-date M0–M4 from today and record the dates in `docs/decisions.md`.
3. Work the frontier with `$implement`, one ticket per branch (`phase-2/<ticket-slug>`): `$tdd` red-green at the seams above, typecheck and the affected test files as you go, the full suite at the end of each ticket, then `$code-review` (Standards against `AGENTS.md`; Spec against the ticket and the spec section it cites) before the pull request. Push and open the PR with `gh`; do not merge.
4. Time is an input everywhere. Handlers receive a clock; tests inject it. The only files that read the wall clock are the clock adapter the handlers use and the api-client's offset code, both on phase 1's allow-list.
5. Hermetic API tests: prefer PGlite as a dev-only dependency (real Postgres in WASM, runs the same `.sql` migrations) with a decisions line, so `npm test` is green offline. Keep a `test:api:neon` script that runs the same tests against `DATABASE_URL` when it is set. If PGlite cannot run the migrations as written, say so in the handoff and fall back to the Neon branch for the API tests only.
6. Keep modules deep: the interface is the test surface. If you find yourself testing past an interface, reshape the module, not the test.

## Rules that bind here

- AGENTS.md in full: the store is dumb (no handler ever reads an allocation or computes a result); phases from server time; `ballot` never in copy; copy IDs, not strings, for API errors; no new dependency without a decisions line; the generator is frozen at `GEN_VERSION 1` when you finish.
- The tally's tests are the contract. If the SDK cross-check disagrees with the runtime EAS code, the runtime code is wrong (§7).
- Ciphertext limit 4 KB; payload as §6; `seq` server-assigned (T11); latest wins with no fallback (T7); `participants` hash bound into the payload.
- Nothing may make a network request during `npm test`. Live calls sit behind adapters with fixtures.
- Secrets never enter the tree; `.env.example` names them.

## Evidence for each pull request, and for the handoff

```bash
npm run check
npm test -- --reporter=verbose 2>&1 | grep -E "tally|phaseAt|generator|canonical|timelock|eas|close record|lifecycle"
npm run build
```

The verbose output must show every test name from Technical Spec §8's list and the lifecycle test. The handoff must list: the agreed seams; the research findings; the decisions lines; the open `needs-human` issues; and the exact commands phase 3 will use to run the API locally in mock mode with a seeded feast in any phase (`POST /api/dev/time` and `/release-key` included).

## Stop conditions

Stop and report if a verify item invalidates a spec shape you cannot resolve with a decisions line (for example the EAS off-chain UID preimage differs from §7 and the cross-check cannot be made to agree); if hermetic tests are impossible in both shapes; or if a rule in AGENTS.md would have to be broken.
