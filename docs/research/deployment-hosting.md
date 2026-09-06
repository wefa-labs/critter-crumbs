# Critter Crumbs: Vercel and Neon setup

Checked 2026-09-05 against current official documentation and the repository at `e9d67f94129583360b013d5b74c34276028135c7`. Read only: no deployment, integration installation, credential access, database change, or actual environment file inspection. This is configuration guidance, not evidence that a hosted deployment works.

## Recommended environment map

Use a persistent production database, a persistent staging database with synthetic fixtures, and isolated short-lived databases for PRs or live database tests. Keep the ordinary local test suite on PGlite. A Git branch and a Neon branch are separate objects; connecting both products does not establish the intended mapping by itself.

| Purpose | Vercel target | Neon target | Lifetime/data |
|---|---|---|---|
| Real use | Production, tracking the chosen release branch | Explicit production branch connection | Persistent; real group data |
| Stable rehearsal | Custom `staging` environment, tracking the chosen staging branch and a stable domain | Explicit staging branch connection | Persistent; synthetic fixtures and rehearsal state |
| Review a PR | Preview | A dedicated `preview/<git-branch>` branch | Isolated from other Git branches; synthetic parent |
| Exercise real Neon transactions | CI/local opt-in command | Dedicated `test/<run-id>` branch | Delete after the run; ordinary tests stay offline |

This map is a recommendation. Vercel Pro/Enterprise custom environments support branch tracking, domains and separate variables; Pro currently includes one custom environment. Hobby can instead use branch-specific Preview variables and a branch domain, but the current repository has a separate Hobby function-count blocker below. [Vercel environments](https://vercel.com/docs/deployments/environments), [staging setup](https://vercel.com/kb/guide/set-up-a-staging-environment-on-vercel)

For a new empty Neon project, create the staging branch before production contains real records; then migrate and seed staging deliberately. If production already contains real data, a separate empty nonproduction Neon project initialized from the repository is the least ambiguous way to avoid copying it. Keep a clean fixture branch as the parent for PR/test branches; stable staging itself can accumulate rehearsal changes. Explicit CI branch creation can choose that parent. A native integration is convenient once its actual parent and variable mapping have been checked; the current setup guides do not document a general per-environment parent picker. Neon's older integration changelog says previews derive from the project default branch—do not assume they derive from the Git PR's base branch or from a branch named `staging`. [Neon workflow guidance](https://neon.com/docs/get-started-with-neon/workflow-primer), [integration default-parent change](https://neon.com/docs/changelog/2024-02-02), [official CI example with chosen parent](https://neon.com/blog/branching-with-preview-environments)

## Do Neon branches copy production data?

Ordinary branches expose the parent's schema and rows at the selected point in time. Copy-on-write avoids duplicating the entire physical dataset immediately; it does **not** remove sensitive records. Writes subsequently diverge, and neither parent nor child automatically follows the other's new changes. A branch of production therefore includes this app's profiles, memberships, statements and stored encrypted submissions. Neon branches do not automatically anonymize that data. [Neon branching explanation](https://neon.com/blog/practical-guide-to-database-branching)

Schema-only branching is available as a Beta feature. It copies definitions without rows and creates an independent root branch, with no reset-from-parent operation. The console also offers expiration; turn it off for persistent staging. [Neon schema-only documentation source](https://raw.githubusercontent.com/neondatabase/website/main/content/docs/guides/branching-schema-only.md)

**Repository-specific caveat:** schema-only is not directly compatible with the current migration bootstrap. It copies the `schema_migrations` table but drops its rows. `db/migrate.ts:5–11` would then try to rerun `0001_init.sql` against existing tables. Prefer an empty database plus the real migrations, or implement and review an explicit schema-baseline procedure before using schema-only clones. Do not blindly reset a synthetic staging branch from production after real data arrives.

## What automatic preview branching actually does

There are two mutually exclusive integration paths for a Vercel project:

| Integration | Setup/ownership | Preview behavior and cleanup |
|---|---|---|
| **Vercel-managed / Native** | Marketplace → Neon → create account/database; billing through Vercel. Storage → database → Connect Project. Select intended environment scopes. Under Advanced Options / Deployments Configuration enable **Required → Preview** and **Resource must be active before deployment**. | Injects the preview branch connection at deployment time, overriding the Preview connection for that deployment. Cleanup follows deletion of the associated Vercel deployments; the documented default retention is six months. |
| **Neon-managed / Connected Account** | Link Existing Neon Account; choose Neon project, database and role. Billing stays in Neon. Each Neon project connects to one Vercel project. | Optional **Automatically delete obsolete Neon branches** removes branches whose Git branches were deleted, when the next preview deployment triggers cleanup. Optional persistent `vercel-dev` starts from the default branch. |

Both provide `DATABASE_URL` and `DATABASE_URL_UNPOOLED`; this repository reads `DATABASE_URL`, so leave its name unprefixed or deliberately map it. Native preview values are injected per deployment and are not shown as persistent project variables. [Native integration documentation source](https://raw.githubusercontent.com/neondatabase/website/main/content/docs/guides/vercel-managed-integration.md), [Neon-managed integration documentation source](https://raw.githubusercontent.com/neondatabase/website/main/content/docs/guides/neon-managed-vercel-integration.md)

“Per preview deployment” does **not** mean a fresh database per commit. Neon's native integration uses one database branch for multiple deployments of the same Git branch; it deletes that database branch once the last associated deployment is gone. Older deployment URLs may therefore run against a schema changed by a newer deployment. Immediate PR-close cleanup and one branch per test run require explicit lifecycle automation. Do not place persistent staging under ephemeral cleanup rules. [Neon integration behavior](https://neon.com/blog/big-dx-improvements-for-neon-users-on-vercel), [official create/delete/reset actions](https://neon.com/docs/guides/branching-github-actions)

## Exact Vercel project settings for this repository

| Setting | Value |
|---|---|
| Framework Preset | **Other** (`framework: null` is already committed) |
| Root Directory | Repository root (`.` / leave the root selector at repository root) |
| Node.js Version | **22.x** |
| Install Command | `node scripts/install-bun.mjs && .vercel/bun/bin/bun install --frozen-lockfile --ignore-scripts` |
| Build Command | `bun run vercel-build` |
| Output Directory | `dist` |
| Development Command | Leave the committed `null`; it is local-tooling configuration, not a hosted start command |
| Function region | Explicitly match the Neon project's region as closely as possible |

The install/build/output values already live in `vercel.json`; preserve them as the source of truth. The installer verifies and installs Bun 1.4.2, and `vercel-build` runs the actual build with that binary. Keep the root at the repository root because root `api/` imports built shared/core workspace exports. `packages/app` is Vite's internal root, and its output resolves to repository `dist`. Vercel serves the output directory statically and separately packages root API files. [Vercel build settings](https://vercel.com/docs/builds/configure-a-build), [Node runtime](https://vercel.com/docs/functions/runtimes/node-js)

Vercel exposes only Node major versions and rolls minor/patch updates automatically; it cannot promise the local exact Node 22.22.1 pin. The repository's `>=22.22.1 <23` range selects the intended major. Confirm `process.version` in the eventual build/runtime evidence. [Supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

Neon fixes region at project creation; all its branches share that region. For example, Neon AWS N. Virginia (`aws-us-east-1`) pairs with Vercel `iad1`. Vercel defaults new functions to `iad1`, but set it deliberately once the actual Neon region is known. Static assets remain globally cached regardless. Current `vercel.json` has no `regions` value. [Neon regions source](https://raw.githubusercontent.com/neondatabase/website/main/content/docs/introduction/regions.md), [Vercel function regions](https://vercel.com/docs/functions/configuring-functions/region)

## Repository blockers and required follow-through

1. **Plan/function count:** there are 20 root API route entrypoints, including three disabled-by-configuration dev routes. With this plain-function layout, each file produces a function. Hobby allows 12; use Pro or implement a reviewed catch-all packaging change. Disabling dev endpoints at runtime does not remove their function bundles. [Vercel runtime limits](https://vercel.com/docs/functions/runtimes)
2. **Mock mode and environment detection:** `api/_lib/runtime.ts:21` passes `NODE_ENV === 'production'` to `serverTimelock`; `api/_lib/timelock.ts:17–19` rejects production mock mode. Default mode is `mock`, so hosted runtime configuration cannot be omitted. A preview running with production `NODE_ENV` is also rejected. The current code does not distinguish Vercel Preview from Production. Vercel documents `VERCEL_ENV` and `VERCEL_TARGET_ENV` for that distinction. Keep cloud dev controls disabled; supporting hosted mock rehearsal would need an explicit reviewed environment-policy change, not an assumed Preview exception. No hosted runtime value was measured here. [Vercel system variables](https://vercel.com/docs/environment-variables/system-environment-variables)
3. **Origin mapping:** runtime requires `APP_ORIGIN`, and `api/_lib/api.ts:35` rejects browser mutations from any other Origin. Set an exact HTTPS origin without a trailing slash for stable production/staging. One shared staging origin will break writes from arbitrary PR deployment URLs. The repository has no `VERCEL_BRANCH_URL` fallback; automatic PR origins require a reviewed configuration change or an exact branch-specific value and use of that URL. Vercel exposes branch/deployment hostnames without `https://`. [Vercel variables](https://vercel.com/docs/environment-variables/system-environment-variables), [branch-specific Preview overrides](https://vercel.com/docs/environment-variables)
4. **Document CSP:** `vercel.json:40` still permits `https://shutter-api.invalid` and `https://base-rpc.invalid`. Replace those document-policy placeholders with the reviewed browser request origins before the app makes live Shutter/RPC requests. Supplying environment variables alone does not interpolate this static JSON policy. API-generated headers do not fix the HTML document's CSP.
5. **Real cryptography configuration:** runtime requires database/session/origin values and real Shutter RPC, registry, key-broadcast and registrant configuration for Chiado/mainnet; complete scatter/result support additionally requires the EAS domain/schema IDs and Base RPC. `MAINNET_RPC_URL` supplies ENS. The exact variable names are in `.env.example`. Keep secrets server-side; `VITE_BASE_RPC_URL` is browser-visible configuration. Mainnet Shutter deployment metadata remains unresolved in `docs/research/shutter-registration-recovery.md`; live account/plan and chain/schema setup remain human follow-ups. A Vercel project setup cannot resolve them.
6. **Migrations and seed:** the build does not migrate. Run `bun run migrate` with `DATABASE_URL` scoped to the intended branch. `bun run seed --database --phase draft` creates the deterministic fixture burrow using the configured database/session/origin; use it only on the intended rehearsal database. Nonlocal real-mode seeding creates drafts; opening a real feast uses the configured Shutter adapter. Stage and test migrations first, then run a serialized production migration step. Concurrent builds sharing one database must not race this migration runner. `bun run test:api:neon` exercises the same API suite against an explicitly supplied test branch; ordinary `bun run test` remains offline.

The foundation README contains historical phase-1 statements about empty modules and unimplemented scripts; those passages no longer describe the current implementation. Use `docs/build/local-core.md` and the phase-2 handoff for current local operations. Hosted routing, environment scoping, real Neon execution and live cryptographic services still need deployment-specific evidence; this research performed none of those actions.
