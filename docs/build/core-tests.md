# Core test evidence

`bun run test` uses PGlite and denies network access, including loopback. It overrides the Neon selector to PGlite. The full check separately runs the foundation's localhost asset proof and dependency audit. Use Bun 1.4.2 and Node 22.22.1.

```sh
bun run check
bun run test -- --reporter=verbose
bun run build
```

The API tests call the same handlers as both servers with fake requests and an injected clock. Tests observe responses, signatures, publications and results through the approved seams. Recorded Shutter/Base/ENS transport fixtures exercise live protocol shapes without sending requests.

## Coverage map

| Contract | Evidence |
|---|---|
| Canonical JSON, copy interpolation, validators, constants | Shared contract tests |
| Frozen generator and layout, phase boundaries | Core generator and phase tests |
| All eleven named §8 tally cases and corruption cases | Core `tally` |
| Local/injected accounts, sign-in and ENS fallback | Core account tests; API `session`, `profile`, `ens` |
| Every protected route's session gate and all response headers | API `contract`; route-specific tests prove member/creator/participant/author gates |
| Membership history, late first-request freeze and too-few void | API `membership`, `ballots` |
| Draft/open/cancel/extend/statements in both feast kinds | API `gathering` |
| SDK UID/signature/schema cross-check, invalid signatures and payload context | Core `eas`; API `ballot-verification` |
| Server sequence assignment, concurrent immutable close, latest-only ciphertexts | API `ballots`, `scatter-tally` |
| Key first-fetch cache, interrupted instance recovery and retry guidance | API `key`, `shutter`; core timelock tests |
| Seed, time, release and production/mode/flag gates | API `dev` |
| Eight signers, replacement scatter and two independent equal result hashes | API `lifecycle` |
| Recorded real Shutter registration/key/crypto/fallback | Core `shutter*`; API `shutter` |
| Recorded Base provenance, result schema, first-record wins and public pending aggregate | Core `eas-reader`, `eas-result`; API `results` |
| Same migrations and independent schema histories | API `database`, `isolation` |

## Opt-in Neon proof

Use a disposable Neon branch supplied by the reviewer. The command creates a fresh `cc_test_<random UUID>` schema per fixture, applies the same SQL migrations, runs the same API test files, and drops that schema on cleanup. Every batch sets its search path locally inside the transaction; application tables are never used. The selected database user needs schema creation permission.

```sh
# Supply DATABASE_URL through the environment or ignored local configuration.
bun run test:api:neon -- --reporter=verbose
```

The default command never selects this mode. Without `DATABASE_URL`, the explicit command fails before starting tests or making network requests. If an interrupted process leaves test schemas behind, inspect and remove only those generated test schemas on the disposable branch.

The schema-isolation path is tested offline with PGlite. No live Neon run was made during phase 2: PGlite's single connection proves the local contract, while the opt-in suite remains the proof across real PostgreSQL connections. Live credentials are a human setup item.
