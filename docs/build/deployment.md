# Set up a rehearsal deployment

Start with a stable Preview deployment on Chiado and Base Sepolia. Production stays pending the mainnet Shutter deployment confirmation. Nothing in this guide has been deployed or funded yet; the scripts have offline fixture coverage, and the service research used public reads only. The core has no usable app UI yet.

Tracked follow-ups: [creator removal #16](https://github.com/wefa-labs/critter-crumbs/issues/16), [Shutter access #17](https://github.com/wefa-labs/critter-crumbs/issues/17), [mainnet deployment #18](https://github.com/wefa-labs/critter-crumbs/issues/18), [live rehearsal #19](https://github.com/wefa-labs/critter-crumbs/issues/19), and [hosting setup #20](https://github.com/wefa-labs/critter-crumbs/issues/20). Q8's authority/visibility decision is recorded; removal itself is not implemented by this tooling change.

## 1. Review the core

Paste this into another Codex session:

```text
Read docs/build/review-phase-2.md and carry out that independent review of PRs #3–#14. Use a separate worktree. Report concrete findings and merge readiness. Do not merge, deploy, send transactions, or post comments.
```

The [full prompt](review-phase-2.md) pins the original core head and requires the reviewer to check current PR heads. This deployment-support follow-up is a separate review.

## 2. Create Neon databases

Create an empty Neon project/database for nonproduction first. Choose its region before creation; all its branches share that region. AWS N. Virginia (`aws-us-east-1`) pairs with Vercel `iad1` if that geography suits the group. Keep the normal local tests on PGlite. [Neon regions](https://neon.com/docs/introduction/regions), [Vercel regions](https://vercel.com/docs/functions/configuring-functions/region)

Use this layout:

| Branch/database | Use |
|---|---|
| `fixtures` in the nonproduction project | Clean, migrated, synthetic parent for new PR/test branches |
| `staging` from `fixtures` | Persistent rehearsal state; disable expiry |
| `preview/<git-branch>` from `fixtures` | Optional isolated PR deployment; remove after review |
| `test/<run-id>` from `fixtures` | Disposable branch for `bun run test:api:neon` |
| `production` in a separate production project | Persistent real data; initialize empty when production is ready |

These are Neon branch names, not automatic Git mappings. For the first rehearsal, only `fixtures` and `staging` are necessary. Do not create a fresh database for every redeploy of staging. Ordinary Neon branches include parent rows; deriving previews from production would expose real group data. Schema-only cloning also drops the migration ledger rows, which the current migration runner cannot safely bootstrap over existing tables. Use an empty database plus migrations. [Neon branching](https://neon.com/blog/practical-guide-to-database-branching)

In Neon, select the intended branch → **Connect** → database and role → pooled connection string. Store it as server-only `DATABASE_URL`. The existing server uses the Neon driver. Run these commands with the environment scoped to the intended nonproduction branch:

```sh
bun run migrate
bun run seed --database --phase draft
```

The seed creates public deterministic test accounts and draft feasts. Run it only against fixtures/rehearsal data. Never fund those test accounts. Migrations are separate from the Vercel build and must run serially; this runner does not coordinate simultaneous migration jobs.

Automatic Neon/Vercel preview branching can come later. Verify which Neon project/default parent it clones and which variable it injects. One Git branch can share a Neon branch across multiple deployments; cleanup is not necessarily immediate when a PR closes. Do not connect the real production project as the preview parent. [Integration details](../research/deployment-hosting.md)

## 3. Create the Vercel project

Import `wefa-labs/critter-crumbs`; keep the repository root. Configure:

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

**Plan decision:** the current plain API layout has 20 function entrypoints; Hobby permits 12. Current deployment tooling therefore requires Pro. If using Hobby, consolidate API packaging in a separate reviewed change before deployment. No paid plan has been selected or purchased here. [Function limits](https://vercel.com/docs/functions/runtimes)

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

Do not set `MOCK_SECRET`, `DEPLOYER_PRIVATE_KEY`, or local dev overrides on Vercel. Hosted previews run with production-style runtime checks and cannot use mock mode. Use `bun run dev:local` for mock work.

Production changes the database, session secret, origin, Base RPCs and EAS chain to `8453`, and uses operator-confirmed mainnet Shutter settings. Schema UIDs are deterministic but registration must exist on each selected chain. Production Shutter metadata is currently unresolved.

## 4. EAS and Shutter setup commands

Use the pinned local toolchain and an ignored local environment. Do not paste secrets into chat, shell history or tracked files.

```sh
# Offline: prints the two exact schemas, deterministic UIDs and prepared requests.
bun run register-schemas --chain 84532

# Read-only RPC check. Missing schemas produce a nonzero exit status.
bun run register-schemas --chain 84532 --check

# Explicit chain write, to run only after review and funding a dedicated signer.
# Requires BASE_RPC_URL and local-only DEPLOYER_PRIVATE_KEY.
bun run register-schemas --chain 84532 --execute

# Read-only Shutter API/RPC consistency check; needs no signing key.
bun run check:shutter
```

EAS already has contracts on Base/Base Sepolia. The schema command registers only missing schemas on the existing registry, waits for two confirmations, then reads them back. It prints each submitted transaction hash before waiting. If submission or confirmation fails, inspect that transaction and signer nonce before retrying; a lost response is not proof that nothing was sent. No automatic send retry is performed. A schema is skipped when already registered with the exact expected fields.

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
