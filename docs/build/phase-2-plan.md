# Phase 2 core contract plan

Prepared 2026-09-05 against `1f64379` on `main`. Status: eleven-ticket breakdown approved by the user on 2026-09-05; implementation tracked in the [phase 2 handoff](phase-2-handoff.md). This document preserves the approved plan; the handoff and PRs carry completion evidence.

The [phase 2 brief](phase-2-core.md) and Technical Spec §16 column A define the work. The [phase 1 PR](https://github.com/wefa-labs/critter-crumbs/pull/1) is merged; its linked foundation guide and review were read. At plan preparation, public shared/core entries and root functions were empty. Use Bun 1.4.2 and Node 22.22.1, as the later decisions require. Do not add UI, browser automation, production configuration, or chain writes.

## Agreed seams

The user named these interfaces in the phase brief; that is the TDD agreement. Tests exercise package exports or handlers, with injected time and external adapters.

| Seam | Interface and responsibility |
|---|---|
| `canonicalJSON(value)` | Canonical JSON text with sorted keys and no whitespace; reject values outside its supported JSON domain. Encoding and hash callers must use the same text. |
| Validators | Parse untrusted request and payload data into shared domain types or copy-ID errors. No schema dependency. Enforce integer, byte, character, address, deadline, and privacy constraints. |
| `phaseAt(feast, now)` | Sole phase calculation, including exact deadline boundaries and terminal states; milliseconds supplied by the caller. |
| `generate(address, variant)` | Version `"1"`, fixed 26-draw order, inline cyrb53/mulberry32; parameters pinned by literal seed fixtures. |
| `layout(params)` | Design System §5.7 unit geometry shared by later portrait and mesh renderers. This phase produces geometry values only. |
| `tally(input)` | Synchronous validation and reduced rational totals; highest sequence only, no fallback; every §8 test named separately. Inputs include the UIDs and close hash needed by the specified result hash. |
| Sign-in message builder and verifier | Exact EIP-191 text; address, nonce, issuance, expiry, and signature verified together; nonce consumed once. |
| `Account` / `AccountProvider` | Local private-key and EIP-6963/viem adapters; signing independent of chain; transaction switching only for result recording. |
| `Timelock` | Mock, Chiado, and mainnet adapters; register, encrypt, get key, decrypt. Randomness, transport, and time supplied at construction; server secrets stay out of browser configuration. |
| Server ballot verifier | Verify EAS domain, fixed fields, signature, schema, feast and Shutter identity, participant membership, server phase, time tolerance, and 4 KB ciphertext cap. Never decrypt. |
| Close record writer | Transactionally freeze the published sequence/UID set and latest candidate per scatterer once; subsequent and concurrent calls return that same record. Never tally. |
| API handlers | Fake request in, status/headers/JSON out; clock and external adapters injected. The same handlers serve Vercel and local `node:http`. |

EAS encoding/UID helpers and the API client's fetch/offset interface are also explicitly requested contract surfaces in the Outcome. Their tests exercise public exports. No tests reach into private fields or inspect database rows instead of using a handler result.

## Module layout

Keep the three existing package entry points and their built ESM exports. `shared` owns domain/wire types, copy with typed interpolation, feel constants, canonical JSON, and parsers. Core owns phase, identity generation/layout, tally, account adapters, EAS encoding and verification, timelock adapters, and the fetch client. Only the two existing clock allow-list paths read wall time: the server clock adapter and core's client offset adapter.

Root route files contain the Vercel request/response adaptation and call handler modules under `api/_lib`. Handlers accept dependencies; they do not construct live transports. The database module hides SQL and transaction retries behind complete domain operations. Its Neon HTTP and PGlite adapters share the same numbered SQL migrations and mutation batches. A transaction is a prepared batch, not an asynchronous callback that branches between queries. `phaseAt` evaluates the snapshot in TypeScript, and conditional SQL commits only while that snapshot remains current; conflicts reread and retry. Concurrency behavior is part of the handler/close-writer interface.

The server owns account/session verification, membership, deadline gates, signed ciphertext storage, the close record, and key retrieval. Only core's client-facing modules decrypt and tally. Route import graphs must make that distinction reviewable. Request-supplied time cannot override the handler clock; only gated local development controls can adjust its adapter.

Network calls belong to adapters. The default test command must make no network requests, including loopback requests: move the existing foundation asset HTTP proof into a separate required check, keep its coverage, and install a deny-by-default network guard for the hermetic suites. Neon tests and asset HTTP verification remain explicit commands outside the offline test command.

## Approved tickets

Each ticket uses its own `phase-2/<slug>` branch and draft PR. Dependent tickets may stack on a completed, validated predecessor branch; record the predecessor as the PR base. No merge is authorized. Readiness is determined by the blocking edges, not label alone. Until GitHub Issues is enabled, keep one reviewable issue body per ticket in `.scratch/phase-2/issues/` and preserve this committed index for reconstruction.

1. **Freeze the shared contract and critter identity** (`shared-contract`, M0). Blocked by: none. Deliver a callable contract with every copy ID, typed slots, all specified feel constants, request/payload types and parsers, canonical JSON, phase computation, and generator/layout fixtures. Treat this shared contract as the necessary prefactor before the vertical flows.
2. **Sign in locally and create a burrow** (`local-sign-in`, M1). Blocked by: 1. Deliver nonce → local account signature → secure session → profile → create/read burrow. Apply migrations with PGlite, introduce the shared database operations, and prove the flow through fake requests with injected time. Establish hermetic test guards and keep the existing asset HTTP proof in a separate required check.
3. **Connect an injected account and keep one critter identity** (`account-profile`, M1). Blocked by: 2. Deliver EIP-6963 discovery/connect, display-name and bounded re-roll updates, and forward-confirmed ENS lookup/failure behavior using recorded RPC fixtures and the persistent 24-hour cache. Test through Account and profile handlers.
4. **Add, join, and leave a burrow** (`burrow-membership`, M1). Blocked by: 2. Deliver pre-added admission, adding by address or ENS, joining, self-leaving, retained membership history, and membership-protected reads. Membership changes must preserve the deadline snapshot needed by later feast freezes. No member-removal policy is invented. ENS address resolution is introduced here if ticket 3 has not already supplied it.
5. **Open people and options feasts and gather statements** (`gathering`, M2). Blocked by: 4. Deliver draft creation, validated setup, retry-safe mock registration, open, draft/gathering cancellation, one valid extension, own statement visibility/editing, and both feast types. Respect PRD draft option statements even where the route table abbreviates the gate to gathering.
6. **Compute the deterministic feast result** (`tally`, M2). Blocked by: 1. Deliver the complete plaintext-to-result contract using canonical participant/close inputs; all eleven Technical Spec §8 cases appear under their own names, plus malformed/corrupt payload cases. Result order and hash literals come from worked independent fixtures.
7. **Scatter privately and close once** (`scatter-close`, M3). Blocked by: 5, 6. Deliver automatic participant/target freeze, too-few void behavior, mock encrypt/sign → verify/store/resubmit → immutable close record → released key → local tally. Include the SDK cross-check, bad-signature/feast/participant/late cases, concurrent first requests, equal-UID retries, and no fallback from an invalid latest scatter. Distinguish current membership reads from frozen participant submission rights.
8. **Run the seeded headless lifecycle locally** (`local-lifecycle`, M3). Blocked by: 7. Deliver eight deterministic accounts/statements, both feast types in selectable phases, migration/seed scripts, gated seed/time/release endpoints, `dev:local` using the same handlers, and the small fetch client with server-time offset. Prove the named API-level lifecycle including resubmission and two independent equal result hashes. No Vercel link or browser is needed.
9. **Use the real Shutter protocol through fixture adapters** (`shutter-adapters`, M4). Blocked by: 7. Deliver Chiado/mainnet registration recovery, exact response parsing, cached key retrieval, SDK hex/byte adaptation, and credential-free browser fallback. Replay recorded success/error/CORS fixtures. A live registration remains a human follow-up unless the brief's environment and access conditions are met.
10. **Encode and verify public result records** (`result-records`, M4). Blocked by: 7. Deliver result schema encoding, recorded Base receipt verification, public-feast/member/phase gates, first-record-wins behavior, and schema-registration tooling prepared for explicit human execution. Verify chain, contract, schema, attester and decoded feast fields; the handler never computes a tally. No real-chain transaction is sent.
11. **Prove the complete core contract and hand it to phase 3** (`core-handoff`, M4). Blocked by: 3, 8, 9, 10. Deliver complete route/auth/header/edge coverage, the explicit Neon suite, clean full check/build evidence, unchanged app source, both code-review axes, and exact local seeded-phase commands. Every prior ticket also runs its affected checks, full suite and both reviews before its own PR.

## Planning dates

Dates preserve the original milestone durations starting today; they are planning targets, not evidence of completion or an estimate for human setup. Live M4 chain execution remains outside this phase's authorized scope.

| Milestone | Revised date | Exit evidence |
|---|---|---|
| M0 | Sep 5–6, 2026 | Shared contract, generator/layout, canonical JSON and phase tests |
| M1 | Sep 7–10, 2026 | Local/injected accounts, sessions, profiles and burrow membership |
| M2 | Sep 11–13, 2026 | Gathering lifecycle and complete pure tally contract |
| M3 | Sep 14–17, 2026 | Signed encrypted scatter, close concurrency and headless mock lifecycle |
| M4 | Sep 18–19, 2026 | Recorded real-protocol adapters, result tooling and handoff; live proof listed separately |

## Known contract corrections to resolve before dependent code

Research owns V2/V3/V4/V6 evidence. Decisions must precede implementation of a changed shape. Track the exact correction in the append-only log rather than quietly changing the normative documents.

- EAS uses seconds, explicit domain version/configured Base chain, the SDK's exact packed UID preimage, and UUID-to-bytes32 encoding shared by signer and verifier. `TallyInput` must carry ballot UIDs and `publishedSetHash` because §8 hashes them.
- The initial schema omits the nonce lifecycle, ENS cache, explicit participant-freeze marker, and concurrency state. Add only the fields needed for the specified behavior. Every state-changing operation must preserve the snapshot/commit invariant, including membership changes crossing a deadline.
- `ballots.uid UNIQUE` contradicts E3's promise that the same signed object can be resubmitted with a new sequence. Preserve each accepted sequence and bind sequence, attester and UID into the close record; do not silently deduplicate or reject a valid retry.
- Draft cancellation and option statements follow PRD R8/P1. The lower-level route table's shorter phase labels must not remove that behavior.
- Public aggregates cannot require server decryption. The result-record ticket must define the read shape around verified public result data and explicitly cover the interval before an optional on-chain record exists; do not claim public totals exist when only member ciphertexts are available.
- Mock timelock is a development adapter, not evidence of Shutter's threshold secrecy. Its implementation and configuration must keep mock material out of any real-mode browser path.

## Human follow-ups and evidence

GitHub Issues remains disabled, confirmed by `gh issue list` on 2026-09-05. Do not change repository settings. Phase 1's existing setup draft already covers enabling Issues, Vercel/Neon, RPC/configuration, and protections. Phase 2 additionally needs local `needs-human` drafts for PRD Q8, the Shutter project account/key/plan decision, and live Chiado/Base Sepolia execution and schema registration.

Validation commands for each implementation PR, with the repository toolchain selected:

```sh
bun run check
bun run test -- --reporter=verbose
bun run build
```

The current test script does not forward reporter arguments to Vitest; ticket 2 must make the evidence command work. Until then, `bunx --no-install vitest run --reporter=verbose` only reports the foundation smoke tests. Phase 2 completion requires every named tally case and the lifecycle case, not the foundation's green scaffold. The final handoff will list executable seed/dev commands only after they exist and are tested.
