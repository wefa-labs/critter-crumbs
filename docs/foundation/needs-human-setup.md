# Enable the tracker and configure the development and production projects

Intended label: `needs-human`. This is one issue draft covering Phase 1's human setup work. GitHub rejected issue listing with `the 'wefa-labs/critter-crumbs' repository has disabled issues` on 2026-09-04, so it could not be filed. The three tracker labels exist.

A person must:

- Enable GitHub Issues and file this draft once, using the command below.
- Create and link the Vercel project to `wefa-labs/critter-crumbs`, with repository root as project root, Node 22, build `npm run build`, and output `dist`. Do not set the project root to `packages/app`.
- Provision Neon through the Vercel Marketplace, create the development branch, and select a Vercel function region next to Neon. Add that region to `vercel.json` after it is known.
- Set the variables listed below in the appropriate local and Vercel environments. Acquire Shutter and RPC credentials and the EAS schema identifiers where needed; no values belong in git or the issue.
- Replace `https://shutter-api.invalid` and `https://base-rpc.invalid` in the CSP with the selected browser connection hosts before a real deployment.
- Enable branch protection requiring the Foundation checks job and configure secret scanning and secret push protection where the repository plan permits them.

Every Technical Spec §13 variable is required for review:

```text
SHUTTER_MODE
SHUTTER_API_BASE
SHUTTER_API_KEY
EAS_CHAIN_ID
EAS_ADDRESS
EAS_BALLOT_SCHEMA_UID
EAS_RESULT_SCHEMA_UID
BASE_RPC_URL
VITE_BASE_RPC_URL
MAINNET_RPC_URL
DATABASE_URL
SESSION_SECRET
MOCK_SECRET
DEV_ENDPOINTS_ENABLED
APP_ORIGIN
```

Use mock mode locally by default, Chiado when exercising Shutter, and mainnet Shutter for rehearsal and October. Production uses Base and Neon main; development uses Base Sepolia and the Neon development branch. Production must leave `DEV_ENDPOINTS_ENABLED` unset and must never enable mock mode. `VITE_BASE_RPC_URL` is browser-visible and must contain only a provider-approved public endpoint or browser-restricted credential. All other secrets stay server-side. `MOCK_SECRET` is unused in production. See Technical Spec §13 for environment-specific settings.

After enabling Issues:

```sh
gh issue create --repo wefa-labs/critter-crumbs --title 'Configure tracker, Vercel, Neon, and deployment safeguards' --label needs-human --body-file docs/foundation/needs-human-setup.md
```

Done when the issue URL is recorded, the development environment can run root functions against Neon, the production configuration has the real connection hosts, and repository protections are enabled. Agents have not created or linked a Vercel project, provisioned Neon, or changed repository settings.
