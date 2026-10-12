# Deployment

## Production on testnet

Production runs on testnet until the mainnet Shutter API key arrives: Shutter on Chiado and EAS on Base Sepolia (decision of 2026-10-08). **It was first deployed on 11 October 2026, from `main` at `c86d8b1`.** Until that day the project's only deployment was the old repository's first commit, and the address answered 404. The app could not have run there before either: the production bundle was blank under the page policy, could not connect, and could not scatter or open a feast (`docs/decisions.md`, 9 and 10 October; `docs/reviews/october-qa`). The address is https://www.crittercrumbs.app, and the apex redirects there. It is the Vercel project `critter-crumbs` in the Greenpill Dev Guild team (Pro), with functions in `iad1`, next to the Neon database in AWS `us-east-1`. The rehearsal run sheet is [rehearsal.md](rehearsal.md).

| Variable (Production) | Value |
|---|---|
| `APP_ORIGIN` | `https://www.crittercrumbs.app`. Writes from any other origin, `critter-crumbs.vercel.app` included, fail the origin check. |
| `SESSION_SECRET` | Random, stored as a Vercel secret and never printed |
| `DATABASE_URL` | Neon, through the Vercel integration. It is shared by Production and Preview for the testnet period. |
| `DEV_ENDPOINTS_ENABLED` | `0` |
| `SHUTTER_MODE`, `SHUTTER_API_BASE`, `SHUTTER_RPC_URL`, `SHUTTER_REGISTRY_ADDRESS`, `SHUTTER_KEY_BROADCAST_ADDRESS`, `SHUTTER_REGISTRANT_ADDRESS` | The Chiado values in §3. No API key. |
| `EAS_CHAIN_ID`, `EAS_ADDRESS` | `84532`, `0x4200000000000000000000000000000000000021` |
| `EAS_BALLOT_SCHEMA_UID` | `0xb8e0cf5878dabf520b1e519ec026c9cc609c6feb255829ada0b6525f9b6ca236` |
| `EAS_RESULT_SCHEMA_UID` | `0xdff4a02942abf463bbde39bbbab88a243027411763cd63d34ccfc59864614c8f` |
| `BASE_RPC_URL`, `VITE_BASE_RPC_URL` | `https://sepolia.base.org` |
| `MAINNET_RPC_URL` | `https://ethereum-rpc.publicnode.com`, a free public RPC for ENS names. It sees the addresses it is asked about. |

Register the two schemas on Base Sepolia from a funded Foundry keystore with `register-schemas --chain 84532 --execute` (§4). The deploy script's check refuses to deploy until both exist. Run migrations with the project's own variables, so no local environment file holds the database password:

```sh
VERCEL_ORG_ID=team_iQZzdJziDgYWjwBhWcuCWjqD VERCEL_PROJECT_ID=prj_D1SyCEWvO9SpCWY90WjPxDRKILpY vercel env run -e production -- bun run migrate
```

To deploy, use a clean checkout of `main` on a local branch, for example `live`. The deploy script reads the project's production variables the same way, so its checks see exactly what Vercel will run with:

```sh
VERCEL_ORG_ID=team_iQZzdJziDgYWjwBhWcuCWjqD VERCEL_PROJECT_ID=prj_D1SyCEWvO9SpCWY90WjPxDRKILpY VERCEL_PLAN=pro VERCEL_REGION=iad1 VERCEL_DEPLOY_BRANCH=live vercel env run -e production -- bun run deploy --production --testnet --execute
```

Without `--testnet`, the script refuses testnet settings for production.

The first deployment showed two things about the command. The upload can stop part-way with `fetch failed`. Nothing is published when it does, and running the same command again sends only the files that are missing. And the build log shows `vercel-build` running again for each of the 22 function entrypoints, after the one run for the page, so a deployment takes about four minutes to build.

That deployment was then checked from outside, signed out:

- the page starts under its policy in Chromium and WebKit, with no breach and no request to another origin, and the policy names the real Shutter and Base origins;
- all 22 route files answer as functions, `POST /api/burrows/:id/removals` among them;
- a sign-in nonce is issued, so the functions reach the database, where all eight migrations are applied;
- the development routes answer 404, and a write from another origin is refused.

Nothing that needs an account was checked. The solo smoke feast in the run sheet is the first signed-in use, and the first time Shutter's keypers are asked to release a key for a feast.

The Vercel project's Git connection still points at the old `Oba-One/critter-crumbs` repository, so pushes to `wefa-labs/critter-crumbs` do not deploy. Leave it that way until the CSP origins are generated in CI (§5).

### What the Shutter team told us, and what the adapter does

These are Yousra's notes from 8 October.

- **A 200 from `register_identity` means submitted, not included.** The adapter opens a feast only once it reads the registration from the registry at a finalized Chiado block. For the first few minutes, "Open the feast" answers with `err.storeUnreachable`, with a 60-second guard between tries. The creator presses it again (E13).
- **A 500, or no inclusion after 30 seconds.** Shutter's advice is to treat the registration as lost and retry with a fresh identity prefix. The adapter never registers twice on its own, so a lost registration means cancelling the draft and setting the feast up again. Retrying with a fresh prefix is a possible follow-up.
- **A 404 between the decryption timestamp and the key release** is treated as "not yet". The waiting screen keeps polling.
- **Key timing.** The key comes with the first block at or after the scattering deadline. Chiado runs on one node and has had outages of a few hours. A late key delays the feast but loses nothing.

## Moving production to mainnet

1. Get the mainnet API key from the Shutter team. Confirm the active Gnosis registry, key broadcast and registrant ([#18](https://github.com/wefa-labs/critter-crumbs/issues/18); see the eon-key mismatch in [shutter-setup.md](../research/shutter-setup.md)).
2. Make the app's EAS chain one setting. `packages/app/src/app/app.tsx`, `packages/app/src/crypto/scatter.ts`, `packages/app/src/crypto/feast.ts` and `packages/app/src/app/result-recorder.ts` hard-code Base Sepolia. On mainnet, ballots would be signed for the wrong chain and every scatter rejected. `packages/app/src/crypto/timelock.ts` names Shutter's Chiado network in the same way; it decides only where the page asks for the key when the store is down.
3. Register both schemas on Base (`--chain 8453`), and fund whoever records results.
4. Start production on a fresh Neon database, migrated. Feasts registered on Chiado cannot be released by the mainnet service.
5. Set the production variables:
   - `SHUTTER_MODE=mainnet`, with the confirmed mainnet addresses and `SHUTTER_API_KEY`;
   - `EAS_CHAIN_ID=8453`;
   - Base RPCs and the ENS RPC from a keyed provider;
   - a new `SESSION_SECRET`.
6. Deploy with `bun run deploy --production --execute`, without `--testnet`.

# Set up a rehearsal deployment

The sections below are the original setup guide for a stable Preview deployment on Chiado and Base Sepolia. They are kept as written, apart from the deployment state above.

Tracked follow-ups: [creator removal #16](https://github.com/wefa-labs/critter-crumbs/issues/16), [Shutter access #17](https://github.com/wefa-labs/critter-crumbs/issues/17), [mainnet deployment #18](https://github.com/wefa-labs/critter-crumbs/issues/18), [live rehearsal #19](https://github.com/wefa-labs/critter-crumbs/issues/19), and [hosting setup #20](https://github.com/wefa-labs/critter-crumbs/issues/20). Q8's authority/visibility decision is recorded; removal itself is not implemented by this tooling change.

## 1. Review the core

Paste this into another Codex session:

```text
Read docs/build/review-phase-2.md and carry out that independent review of PRs #3–#14. Use a separate worktree. Report concrete findings and merge readiness. Do not merge, deploy, send transactions, or post comments.
```

The [full prompt](review-phase-2.md) pins the original core head and requires the reviewer to check current PR heads. This deployment-support follow-up is a separate review.

## 2. Create Neon databases

For the first rehearsal, one empty Neon project/database and its initial branch are enough. Use the default branch name or call it `staging`; the application reads its connection string and does not depend on the name. This does not require a Vercel custom Staging environment: use a stable Preview deployment. Keep future real production data separate from this rehearsal database.

Choose Neon's region before creation; all its branches share that region. AWS N. Virginia (`aws-us-east-1`) pairs with Vercel `iad1` if that geography suits the group. Keep the normal local tests on PGlite. [Neon regions](https://neon.com/docs/introduction/regions), [Vercel regions](https://vercel.com/docs/functions/configuring-functions/region)

The following is an optional expanded layout when PR previews and live database tests are needed:

| Branch/database | Use |
|---|---|
| `fixtures` in the nonproduction project | Clean, migrated, synthetic parent for new PR/test branches |
| `staging` from `fixtures` | Persistent rehearsal state; disable expiry |
| `preview/<git-branch>` from `fixtures` | Optional isolated PR deployment; remove after review |
| `test/<run-id>` from `fixtures` | Disposable branch for `bun run test:api:neon` |
| `production` in a separate production project | Persistent real data; initialize empty when production is ready |

These are suggested Neon branch names, not automatic Git mappings. A separate `fixtures` parent can wait until isolated preview/test branches are useful. Do not create a fresh database for every redeploy of staging. Ordinary Neon branches include parent rows; deriving previews from production would expose real group data. Schema-only cloning also drops the migration ledger rows, which the current migration runner cannot safely bootstrap over existing tables. Use an empty database plus migrations. [Neon branching](https://neon.com/blog/practical-guide-to-database-branching)

In Neon, select the intended branch → **Connect** → database and role → pooled connection string. Store it as server-only `DATABASE_URL`. The existing server uses the Neon driver. Run these commands with the environment scoped to the intended nonproduction branch:

```sh
bun run migrate
bun run seed --database --phase draft
```

The seed creates public deterministic test accounts and draft feasts. Run it only against fixtures/rehearsal data. Never fund those test accounts. Migrations are separate from the Vercel build and must run serially; this runner does not coordinate simultaneous migration jobs.

Automatic Neon/Vercel preview branching can come later. Verify which Neon project/default parent it clones and which variable it injects. One Git branch can share a Neon branch across multiple deployments; cleanup is not necessarily immediate when a PR closes. Do not connect the real production project as the preview parent. [Integration details](../research/deployment-hosting.md)

## 3. Create the Vercel project

Import `wefa-labs/critter-crumbs`; keep the repository root. Most of the values below are already declared in `vercel.json`: let Vercel read that file instead of entering duplicate dashboard overrides. Check the root and Node major, then choose the project-specific region and environment variables.

The root is the deployment boundary for both the Vercel route exports in `api/` and the workspaces under `packages/`. All server implementation now lives in `packages/api/src`, exposed through `@critter-crumbs/api`; root routes only re-export its default handler. The app, core and shared code remain sibling workspaces. Choosing `packages/app` would change that boundary and leave the current top-level function routes outside it. A workspace layout does not require each package to be a separate Vercel project.

The custom install command pins and verifies Bun 1.4.2 and disables dependency install scripts. The custom build compiles the shared/core workspaces before building Vite; `dist` is the resulting static output. These are repository build requirements that a generic framework default does not capture. The Other preset avoids selecting an independent framework build at the root. Node 22 follows the current toolchain contract; region alignment reduces API/database latency.

| Setting | Value |
|---|---|
| Framework Preset | **Other** |
| Root Directory | Repository root (`.`), not `packages/app` |
| Node.js Version | **22.x** |
| Install Command | `node scripts/install-bun.mjs && .vercel/bun/bin/bun install --frozen-lockfile --ignore-scripts` |
| Build Command | `bun run vercel-build` |
| Output Directory | `dist` |
| Function Region | Match Neon, e.g. `iad1` for AWS N. Virginia |

The committed install/build/output settings are authoritative. Vercel manages Node patch versions; local verification uses 22.22.1 and Bun 1.4.2. [Build configuration](https://vercel.com/docs/builds/configure-a-build), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

**Plan decision:** the current plain API layout has 22 function entrypoints; Hobby permits 12. Current deployment tooling therefore requires Pro. If using Hobby, consolidate API packaging in a separate reviewed change before deployment. No paid plan has been selected or purchased here. [Function limits](https://vercel.com/docs/functions/runtimes)

Choose a stable staging branch URL or domain, and set `APP_ORIGIN` to that exact HTTPS origin, without a trailing slash. Use that URL for browser access. Arbitrary generated deployment URLs will fail mutation-origin checks when they differ. Automatic per-PR origins need their own reviewed configuration; do not add a wildcard. [Branch-specific variables](https://vercel.com/docs/environment-variables)

Set the following variables in **Preview**, scoped to the rehearsal Git branch. Production gets separate values later. Local command variables do not provision Vercel project variables.

| Variable | Rehearsal value |
|---|---|
| `DATABASE_URL` | Pooled connection for Neon `staging` |
| `SESSION_SECRET` | Independent random secret, at least 32 characters; generate/store privately |
| `APP_ORIGIN` | Exact stable rehearsal HTTPS origin |
| `DEV_ENDPOINTS_ENABLED` | `0` |
| `SHUTTER_MODE` | `chiado` |
| `SHUTTER_API_BASE` | `https://shutter-api.chiado.staging.shutter.network` |
| `SHUTTER_API_KEY` | Omit for Chiado |
| `SHUTTER_RPC_URL` | `https://rpc.chiadochain.net` or a Chiado RPC provider |
| `SHUTTER_REGISTRY_ADDRESS` | `0x2693a4Fb363AdD4356e6b80Ac5A27fF05FeA6D9F` |
| `SHUTTER_KEY_BROADCAST_ADDRESS` | `0x46D286f0F3D42b726B1bdc241FA4b8b5BC881A0f` |
| `SHUTTER_REGISTRANT_ADDRESS` | `0xd150bbf86C686de1a25820A94c2C2397e0bC54ab` |
| `EAS_CHAIN_ID` | `84532` (Base Sepolia) |
| `EAS_ADDRESS` | `0x4200000000000000000000000000000000000021` |
| `EAS_BALLOT_SCHEMA_UID`, `EAS_RESULT_SCHEMA_UID` | Exact UIDs printed by `bun run register-schemas --chain 84532` |
| `BASE_RPC_URL` | Server-side Base Sepolia RPC |
| `VITE_BASE_RPC_URL` | Browser-safe Base Sepolia RPC; any embedded token is public |
| `MAINNET_RPC_URL` | Ethereum mainnet RPC for ENS, optional if ENS is not being exercised |

Do not set `MOCK_SECRET`, Foundry account/password settings, or local dev overrides on Vercel. Hosted previews run with production-style runtime checks and cannot use mock mode. Use `bun run dev:local` for mock work.

Production changes the database, session secret, origin, Base RPCs and EAS chain to `8453`, and uses operator-confirmed mainnet Shutter settings. Schema UIDs are deterministic but registration must exist on each selected chain. Production Shutter metadata is currently unresolved.

## 4. EAS and Shutter setup commands

Use the pinned local toolchain and an ignored local environment. Contract writes use Foundry `cast` and an encrypted keystore account; the script never requests or reads a raw private key. Foundry 1.7.1 is the locally verified CLI version, with no added JavaScript dependency. Use an existing account under `~/.foundry/keystores`, or create a fresh one with Foundry's hidden password prompt. Do not paste secrets into chat, shell history or tracked files.

```sh
# Creates the default keystore directory and a new encrypted account:
cast wallet new --password
```

Creation is a separate local operation performed by you. This command prints the encrypted keystore path and public address; use its generated filename as the account name. Replace `ACCOUNT_FILENAME` below with that filename. The explicit `--password` flag selects encrypted output in the default directory; plain `cast wallet new` prints a raw private key. During transaction execution, Foundry prompts for the keystore password through the controlling terminal. Use your interactive terminal. `FOUNDRY_ACCOUNT` is an optional local default instead of `--account`. No password environment variable or password file is needed.

```sh
# Offline: prints the two exact schemas, deterministic UIDs and prepared requests.
bun run register-schemas --chain 84532

# Read-only RPC check. Missing schemas produce a nonzero exit status.
bun run register-schemas --chain 84532 --check

# Explicit chain write, to run only after review and funding a dedicated signer.
# Requires BASE_RPC_URL and your named Foundry keystore account.
bun run register-schemas --chain 84532 --account ACCOUNT_FILENAME --execute

# Read-only Shutter API/RPC consistency check; needs no signing key.
bun run check:shutter
```

EAS already has contracts on Base/Base Sepolia, so this uses Foundry `cast send`; no new Solidity contracts need deploying. The schema command registers only missing schemas on the existing registry, waits for two confirmations, then reads them back. It prints each submitted transaction hash before waiting. If submission or confirmation fails, inspect that transaction and signer nonce before retrying; a lost response is not proof that nothing was sent. The wrapper never automatically reruns a failed Cast invocation; Foundry's own RPC transport can retry requests. A schema is skipped when already registered with the exact expected fields. The existing viem client performs read-only schema/receipt verification; all signing and broadcasting is delegated to Foundry. [Foundry keystore and send behavior](../research/foundry-keystore.md)

Shutter also already has its service/contracts. `check:shutter` validates the configured origin, chain, finalized contract code, optional mainnet authentication, identity derivation, eon key and registry getter. It never registers a feast. Its success does not prove the API's current signer or a new key-release lifecycle. Opening a real feast belongs to the existing authenticated creator workflow, which persists and recovers one registration attempt.

The [Get Started guide](https://docs.shutter.network/docs/protocol/api/get_started) warns that its examples may be outdated. Follow the [current API reference](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/README.md). Chiado allows anonymous access; the mainnet higher-limit key is requested from the operator. The fresh mainnet API/on-chain eon-key mismatch remains a blocker. [Verified inputs and limitations](../research/shutter-setup.md)

Send this yourself when requesting mainnet access:

> We are preparing Critter Crumbs, a small-group application using time-based encrypted submissions. Please confirm Standard API-key access and current commercial/rate-limit terms, whether registration gas remains API-funded, and the active Gnosis chain, registry, key-broadcast contract and API registrant. The current API eon-1 key does not match the published instance-1000 key-broadcast getter; which deployment should we verify? Please provide the API key through a secure channel.

The current reference lists `loring@brainbot.com` for higher-limit keys. No account was registered and no message was sent by Codex.

## 5. Deploy after setup and review

The wrapper uses the installed Vercel CLI and generates a local deployment config with the selected function region and real browser RPC/Shutter origins in the document CSP. The committed scaffold still contains placeholder CSP origins, so do not use automatic Git deployments as proof that the real-service setup is complete. Before adopting automatic deploys, commit reviewed environment-appropriate packaging/CSP/origin configuration or add equivalent CI generation.

Configure `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VERCEL_PLAN=pro`, `VERCEL_REGION`, and `VERCEL_DEPLOY_BRANCH` locally; authenticate the Vercel CLI yourself with telemetry disabled (`VERCEL_TELEMETRY_DISABLED=1`). Check out the exact Git branch named by `VERCEL_DEPLOY_BRANCH`, and scope the Preview variables above to that same branch. For example, once the reviewed commits are on your chosen `staging` branch, use `git switch staging` and `VERCEL_DEPLOY_BRANCH=staging`. The wrapper rejects a different checkout or incorrect EAS address/schema IDs, and disables CLI telemetry. Make local preflight settings match the target's configured Vercel variables. The wrapper does not upload secrets, synchronize project variables, migrate or seed databases, register schemas, or attest results. It cannot prove that remote variables match local values.

```sh
bun run check
bun run build
bun run deploy                 # prints the plan; no network or deployment

# After the intended Neon migration, EAS registration and project variables:
bun run deploy --execute       # checks EAS/Shutter, then deploys Preview

# Later, only with verified production configuration and explicit approval:
bun run deploy --production --execute
```

The final command assigns production domains through Vercel's normal `--prod` behavior. It is an actual publication. None of the `--execute` commands in this guide was run while preparing this change.

After the first rehearsal deployment, run the opt-in API suite on a disposable Neon test branch, then exercise one authorized live Chiado/Base Sepolia feast through the reviewed core interfaces: sign in, gather, scatter/resubmit, wait for close and release, independently tally, and compare result hashes. Record the schema IDs and transaction evidence without credentials. Phase 3 can add the browser path; the current core has no UI for this flow.
