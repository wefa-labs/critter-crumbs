# Run the core locally

Use Bun 1.4.2 and Node 22.22.1 from the repository root. No Vercel link, database account, RPC endpoint or browser is needed for the mock API.

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev:local
```

This starts Vite at `http://127.0.0.1:5173` and the same API handlers at `http://127.0.0.1:3000`. It applies the SQL migrations, enables the dev controls and uses mock encryption. Ctrl-C stops the stack. The original `bun run dev` still runs Vite with `vercel dev` and requires the human-owned Vercel/Neon setup.

If port 3000 is occupied, use `LOCAL_API_PORT=4300 bun run dev:local`; the Vite proxy follows that port. Set the same variable when running `bun run seed`. `APP_ORIGIN` defaults to `http://127.0.0.1:5173`; use that URL when connecting through Vite.

Local Postgres data, generated session/mock secrets and the clock offset persist outside the repository in `~/.local/share/critter-crumbs`. `LOCAL_DATA_DIR` selects another directory. Only one process should open a local data directory. To apply migrations separately, stop the stack and run `bun run migrate --local`. `bun run migrate` without `--local` requires `DATABASE_URL` and applies migrations to that configured database.

## Seed a phase

In a second terminal:

```sh
bun run seed --phase gathering > /tmp/critter-seed.json
```

Each call creates a fresh burrow with eight known local accounts, a people feast and an options feast. It preserves previous burrows. Profiles and statements come from `fixtures/statements.json`. The JSON response contains account indices/addresses, the burrow ID, feast IDs, deadlines and mock registration metadata. These are rehearsal fixtures: private-key integers 1 through 8 are public test keys. Never fund them.

Use `--kind people` or `--kind options` to create one feast type. Supported phases:

| `--phase` | Seeded state |
|---|---|
| `draft` | Both drafts; option statements exist; people statements await gathering |
| `gathering` | Both open; eight people statements and three option statements |
| `scattering` | Statements visible; all eight participants frozen |
| `feast` | Both closed; empty immutable close records, ready for the results empty state |
| `cancelled` | Both cancelled during gathering |
| `void` | People feast only, with two remaining members at the freeze; options cannot become void |

Scattering/feast/void seeding advances the shared development clock and therefore also advances existing feasts. It does not synthesize scatters. The lifecycle test below supplies encrypted scatters through the real submission handler.

The HTTP equivalent is:

```sh
curl --fail-with-body http://127.0.0.1:3000/api/dev/seed \
  -H 'Content-Type: application/json' \
  --data '{"phase":"gathering","kind":"people"}' > /tmp/critter-seed.json
```

## Advance time and release the mock key

From a gathering seed, derive the request bodies from the returned deadlines:

```sh
node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const feast = JSON.parse(readFileSync('/tmp/critter-seed.json', 'utf8')).feasts[0];
writeFileSync('/tmp/critter-scattering.json', JSON.stringify({ now: feast.gatheringEndsAt }));
writeFileSync('/tmp/critter-close.json', JSON.stringify({ now: feast.scatteringEndsAt }));
writeFileSync('/tmp/critter-release.json', JSON.stringify({ identity: feast.registration.identity }));
JS
curl --fail-with-body http://127.0.0.1:3000/api/dev/time \
  -H 'Content-Type: application/json' --data-binary @/tmp/critter-scattering.json
# Submit encrypted scatters through the account and API-client interfaces here.
curl --fail-with-body http://127.0.0.1:3000/api/dev/time \
  -H 'Content-Type: application/json' --data-binary @/tmp/critter-close.json
curl --fail-with-body http://127.0.0.1:3000/api/dev/release-key \
  -H 'Content-Type: application/json' --data-binary @/tmp/critter-release.json
```

The control bodies are `{ now: integerMilliseconds }` and `{ identity: bytes32Hex }`. Releasing a key does not bypass the member/phase gate on `GET /api/feasts/:id/key`. The mock also releases automatically at its deadline. Every response carries `serverNow`; invalidate a client's GET cache after external time changes. The client returns `null` from `now()` until it receives a valid server stamp.

Dev routes return 404 when `DEV_ENDPOINTS_ENABLED` is not `true`, in production, or outside mock mode. The local runner defaults the flag to `true`; set it to `false` to test the disabled case. Local mode refuses production and real Shutter modes. The adjustable clock is shared by the one local API process; the local runner persists its offset across restarts. Do not use dev-time controls across independently running serverless instances.

For the rehearsal deployment, migrate the configured database and run `bun run seed --database --phase draft` once with `DATABASE_URL`, `SESSION_SECRET` and `APP_ORIGIN`. This uses ordinary handlers directly with dev endpoints disabled and performs no Shutter registration. Opening those drafts requires the separately configured real adapter and human-owned setup. No real database seed was run during Phase 2 validation.

## Run the headless proof

```sh
bun run test -- --reporter=verbose
bun run check
bun run build
```

The API lifecycle test seeds eight accounts, signs in each account, writes statements, advances time, encrypts/signs/submits eight scatters plus a replacement, closes, releases the key, and compares two independently decrypted/tallied result hashes. Default tests use PGlite with network access denied, including loopback. HTTP smoke checks are separate from that hermetic suite.
