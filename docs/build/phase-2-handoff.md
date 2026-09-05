# Phase 2 core handoff

The eleven approved core tickets implement Technical Spec §16 column A through the fixture-backed M4 scope. The app remains at its phase 1 baseline. All work is on stacked draft PRs; none is merged. Live chain execution, production setup and browser proof remain separate human/phase 3 work.

## Review stack

Review in dependency order. Each implementation PR records its full check, verbose test output, build and separate Standards/Spec reviews.

| Ticket | Branch | Draft PR |
|---|---|---|
| Preflight | `phase-2/core-contract-plan` | [#3](https://github.com/wefa-labs/critter-crumbs/pull/3) |
| 01 shared contract | `phase-2/shared-contract` | [#4](https://github.com/wefa-labs/critter-crumbs/pull/4) |
| 02 local sign-in | `phase-2/local-sign-in` | [#5](https://github.com/wefa-labs/critter-crumbs/pull/5) |
| 03 account/profile | `phase-2/account-profile` | [#6](https://github.com/wefa-labs/critter-crumbs/pull/6) |
| 04 membership | `phase-2/burrow-membership` | [#7](https://github.com/wefa-labs/critter-crumbs/pull/7) |
| 05 gathering | `phase-2/gathering` | [#8](https://github.com/wefa-labs/critter-crumbs/pull/8) |
| 06 tally | `phase-2/tally` | [#9](https://github.com/wefa-labs/critter-crumbs/pull/9) |
| 07 scatter/close | `phase-2/scatter-close` | [#10](https://github.com/wefa-labs/critter-crumbs/pull/10) |
| 08 local lifecycle | `phase-2/local-lifecycle` | [#11](https://github.com/wefa-labs/critter-crumbs/pull/11) |
| 09 real Shutter adapters | `phase-2/shutter-adapters` | [#12](https://github.com/wefa-labs/critter-crumbs/pull/12) |
| 10 result records | `phase-2/result-records` | [#13](https://github.com/wefa-labs/critter-crumbs/pull/13) |
| 11 complete proof/handoff | `phase-2/core-handoff` | Current handoff PR, based on ticket 10 |

## Agreed seams

The user approved these before tests were written: `tally(input)`; `phaseAt(feast, now)`; `canonicalJSON`; the hand-written validators; `generate(address, variant)` and `layout(params)`; sign-in message builder/verifier; `Timelock`; `Account`/`AccountProvider`; server ballot verifier; close record writer; and each API handler with a fake request and injected clock. EAS encoding/UID/receipt helpers and the API client's fetch/offset interface are also explicit contract surfaces. The [approved plan](phase-2-plan.md) describes their responsibilities and module boundaries.

`GEN_VERSION` is frozen at `"1"`. Copy, interpolation slots, constants, shared wire types and parsers live in shared. Core decrypts and tallies; handlers never receive allocations or compute a tally. The two clock adapters are the only application files that read wall time. The local and Vercel transports call the same handlers.

## Research and decisions

- **V2:** Shutter uses `/api/time/…`, wrapped response objects and integer seconds. Registration returns before confirmation and cannot safely be repeated after an uncertain POST. Recovery persists the original context and verifies finalized state/event/eon key. Chiado observations agree; current official mainnet deployment assets disagree with the API's key. See [API research](../research/shutter-api-v2-v3.md) and [registration recovery](../research/shutter-registration-recovery.md).
- **V3:** Browser fallback is an anonymous GET with credentials omitted. Project bearer keys stay on the server. The recorded CORS probes support that shape; no browser execution is claimed.
- **V4:** EAS SDK 2.10.0 cross-checks pin the complete v2 packed UID, schema encoding and signatures. UIDs omit signer/domain, so accepted sequences remain distinct even for identical UIDs. Domain version is explicitly `0.26`; EAS time is seconds and feast bytes32 is the hash of canonical UUID text. See [off-chain research](../research/eas-offchain-v4.md) and [result receipt research](../research/eas-result-records.md).
- **V6:** PGlite runs the SQL migrations offline. Neon HTTP accepts prepared batches, so writes use a consistent snapshot and revision-guarded transaction, then retry with fresh time. The opt-in Neon suite is implemented; no live database run is claimed. See [Neon/PGlite research](../research/neon-pglite-v6.md).
- **Crypto/runtime:** The untouched Shutter SDK's CommonJS entry passes Node crypto vectors. Native Node ESM has a dynamic-require failure; the runtime browser path remains ESM. Crypto calls are serialized because concurrent cold SDK initialization can lose a readiness callback. Registration checks byte format and chain/API agreement; the SDK validates the key's cryptographic point at encryption. See [SDK research](../research/shutter-sdk-crypto.md). Phase 1's V1/package verification remains in [foundation](../foundation/README.md).
- Independent literals also pin [generator](../research/generator-v1-vectors.md), [tally](../research/tally-fixture.md), [publication](../research/publication-fixture.md) and [ENS](../research/account-ens-fixtures.md) behavior.

The append-only [decision log](../decisions.md) contains the exact decisions and attribution. Phase 2 entries are lines 78–108 and 116–126 (line 110 is retained ticket 08 history):

| Lines | Decisions |
|---|---|
| 78–82 | Re-dated M0–M4; corrected Shutter routes, seconds, original eon, pending registration and anonymous fallback |
| 83–86 | Explicit EAS domain/time/UUID encoding; tally hash inputs; distinct server sequences for identical signed retries |
| 87–92 | Disabled-Issues fallback; PGlite; prepared revision-guarded writes; missing schema state; offline suite; upward key-release rounding |
| 93–98 | Approved eleven tickets; frozen generator; name/option bounds; full-address sign-in; idempotent re-roll/ENS cache; keep-critter lock |
| 99–104 | Freeze-before-membership mutation; returning members; registration metadata seam; target ID bytes; registration reservation; bounded workers |
| 105–108 | Canonical latest-only tally; full signed-object transport; close hash preimage; released-key reservation/cache |
| 116–119 | Client offset/cache; persistent local API; ordinary-handler seeding; exact dev flag/mode/production gates |
| 120–122 | Finalized Shutter confirmation/configuration; durable no-repeat journal; SDK loading and serialization |
| 123–125 | Base result verification; public aggregate null until recording; unsigned schema tooling |
| 126 | Isolated schema per opt-in Neon fixture |

## Run phase 3 locally

Use Bun 1.4.2 and Node 22.22.1. From the repository root:

```sh
bun install --frozen-lockfile --ignore-scripts
LOCAL_API_PORT=4300 bun run dev:local
```

This starts the app shell on 5173 and mock API on 4300, applies migrations and enables dev controls. It needs no Vercel link or credentials. In a second terminal:

```sh
LOCAL_API_PORT=4300 bun run seed --phase gathering > /tmp/critter-seed.json
# Also supported: draft, scattering, feast, cancelled; void with --kind people.
# Use --kind people or --kind options to seed one kind; default is both.
```

Each call creates a fresh burrow with eight public test accounts (private-key integers 1–8) and `fixtures/statements.json`. Never fund those accounts. Advancing time affects all feasts in that local data directory. Seeding a closed feast creates an empty result; the headless lifecycle supplies encrypted scatters and a replacement.

```sh
node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const feast = JSON.parse(readFileSync('/tmp/critter-seed.json', 'utf8')).feasts[0];
writeFileSync('/tmp/critter-scattering.json', JSON.stringify({ now: feast.gatheringEndsAt }));
writeFileSync('/tmp/critter-close.json', JSON.stringify({ now: feast.scatteringEndsAt }));
writeFileSync('/tmp/critter-release.json', JSON.stringify({ identity: feast.registration.identity }));
JS
curl --fail-with-body http://127.0.0.1:4300/api/dev/time \
  -H 'Content-Type: application/json' --data-binary @/tmp/critter-scattering.json
# Submit encrypted scatters through Account, Timelock, EAS and the API client here.
curl --fail-with-body http://127.0.0.1:4300/api/dev/time \
  -H 'Content-Type: application/json' --data-binary @/tmp/critter-close.json
curl --fail-with-body http://127.0.0.1:4300/api/dev/release-key \
  -H 'Content-Type: application/json' --data-binary @/tmp/critter-release.json
```

The body units are integer milliseconds and bytes32 identity. Every response carries `serverNow`; invalidate client GETs after external time changes. Key release never bypasses member/phase gates. Ctrl-C stops the stack. Persistent local secrets/data/offset live outside the tree; `LOCAL_DATA_DIR` selects another directory. Stop the stack before `bun run migrate --local`. Full phase, persistence and deployment-seed details are in [local core](local-core.md).

## Validation and remaining human work

Final ticket 11 validation and reviews are in progress; replace this line with the completed evidence before publishing the handoff PR.

The exact proof commands are `bun run check`, `bun run test -- --reporter=verbose`, and `bun run build`. The [coverage map](core-tests.md) identifies each contract's tests and the explicit `bun run test:api:neon` command. Required verbose names include all eleven §8 tally cases and the seed/sign-in/statements/time/scatter/resubmit/release/two-independent-tallies lifecycle. [Result tooling](result-records.md) documents `bun run register-schemas --chain 84532` and `--chain 8453`; both only prepare requests.

GitHub Issues remains disabled, rechecked on 2026-09-05. The following intended `needs-human` issues are **drafts, not filed issues**, under the root checkout's ignored `.scratch/phase-2/needs-human/`. Their requirements are recorded here so a reviewer can reconstruct them:

1. **PRD Q8** (`01-prd-q8.md`): decide whether and when one member may remove another. Only self-leave is implemented.
2. **Shutter account/key/plan** (`02-shutter-account-plan.md`): the project account must confirm T14 access, plan and gas terms; no signup or credential creation was performed.
3. **Live Chiado/Base Sepolia proof** (`03-live-chiado-base.md`): supply reviewed variables and schemas, then explicitly authorize registration, key release and result posting. No real-chain write was made in this phase.
4. **Mainnet Shutter deployment** (`04-shutter-mainnet-deployment.md`): confirm the registry, key broadcast and registrant actually used by the API before enabling mainnet registration. The adapter fails closed on the observed key mismatch.

Phase 1's setup follow-up also covers enabling Issues, Vercel/Neon linking, RPC configuration and repository protections. No permission policy or repository settings were changed. Local mock work is independent of those steps. The separate cross-repository `dev check` remains red on pre-existing missing Coop/TAS-Hub manifests and guidance; the Critter Crumbs checks are independent of that workbench. No live Neon/Chiado feast, production configuration, browser/Playwright run, portrait, mesh, sound or Koota world is claimed here.

## Suggested skills

For phase 3, use the phase 3 prompt and its game skill, `codebase-design` for app seams, `tdd` for agreed simulation interfaces, and `code-review` before each PR. Use `humanize-writing` for prose and the applicable frontend guidance before UI work. Read `AGENTS.md`, the spec, this handoff and the linked decisions before implementing the app.
