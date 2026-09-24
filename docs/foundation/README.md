# Foundation

This Bun workspace prepares the tooling for the core and app workstreams. It contains no feast logic, route handlers, or UI. All three packages expose only `.` through built ESM JavaScript and declarations; their public entries are empty. Add exports deliberately in later phases.

```text
packages/shared/   shared types, copy, constants, validators in phase 2
packages/core/     core implementation in phase 2
packages/app/      Vite root, public assets, app implementation in phase 3
packages/api/     server implementation and public server package entry
api/              one-line Vercel route exports at repository root
packages/api/src/ server handlers and adapters
db/migrations/    SQL in phase 2
scripts/          tooling now; migration and seed implementations in phase 2
tests/e2e/        lifecycle proof in phase 3
```

Each package has `src/index.ts`, `test/smoke.test.ts`, a tsconfig extending the root base, and the following interface:

```json
{".": {"types": "./dist/index.d.ts", "default": "./dist/index.js"}}
```

Import by package name. Cross-package relative paths and private subpaths fail lint. Dynamic imports and `require` calls must use static strings so their direction can be checked. Shared cannot import core or app; core cannot import app; API may import core and shared; browser packages cannot import API; root routes import the API public entry. Tests import through the same public entries. Shared compiles before core and app.

Select Bun 1.4.2 and Node 22.22.1, then run from the repository root:

```sh
node scripts/install-bun.mjs
export PATH="$PWD/.vercel/bun/bin:$PATH"
bun --version
node --version
bun install --frozen-lockfile --ignore-scripts
bun run check
bun run build
```

`check` runs lint, typecheck, the package smoke tests, tooling regressions, isolated Vercel workspace proof, verified direct-runtime licences, dependency audit, and reviewed archive integrity. `build` emits `dist/`, copies Shutter's prebuilt BLST assets explicitly, and enforces gzip limits. Install scripts remain disabled. `bun run e2e:install` explicitly installs Chromium; `bun run e2e` now includes the Phase 3 people/options lifecycle and renderer regressions; it requires the local mock stack and an installed Chromium. `bun run migrate` and `bun run seed` use the Phase 2 implementations. See [current validation](../build/phase-3-validation.md).

`bun run dev:app` compiles the workspaces, then starts Vite and a TypeScript build watcher. After a person completes [the setup request](needs-human-setup.md), `bun run dev` runs the same watcher, Vite on port 5173, and `vercel dev` on port 3000; Vite proxies `/api` and serves the prebuilt BLST assets in development. Mock mode is the local default. Preview and production remain separate configurations, as Technical Spec §13 requires.

Clock access in all linted source and tooling is restricted to `packages/api/src/clock.ts`, `packages/app/src/sim/ticker-host.ts`, and `packages/core/src/api-client/clock-offset.ts`. These adapters are implemented. Logic accepts time as an input. Component files (`.tsx` and `.jsx`, plus `.ts`/`.js` under screens and components) keep visible wording in `packages/shared/src/copy.ts`: use `copy['id']` or `copy('id')`. Structural attributes and type literals are allowed; indirect visible string literals also fail lint.

The app imports the `three` and `crypto` entries lazily at the specified interaction points. Arrival, gathering and reading use portraits without starting the 3D renderer. The app shell's static graph, including CSS, is capped at 120,000 gzip bytes; additional `three` code at 250,000. Static shell imports of either lazy chunk fail. §17 gives no numeric crypto cap, so crypto size is reported without inventing one. BLST JavaScript/WASM are separate lazy assets and their sizes are recorded in the V1 research.

Read [dependency evidence](../research/dependencies.md), [V1](../research/shutter-sdk-v1.md), [workspace research](../research/vercel-workspaces.md), and [Bun policy](../research/bun-policy.md) before changing the toolchain. A dependency update requires a decisions entry and refreshed licence/archive evidence; the check intentionally rejects unreviewed pins.

The full development audit currently retains low and moderate upstream findings; high and critical findings fail the check. Targeted development-only overrides and their validation limits are documented in [the audit note](../research/development-audit.md).

Bun is pinned to 1.4.2, the latest stable release verified for this migration. `scripts/install-bun.mjs` checks official release archive hashes and installs into ignored `.vercel/bun/bin`; CI and Vercel reuse it. `bunfig.toml` keeps exact saves, a seven-day release age for new dependency resolutions, and disabled install scripts. Node remains the functions runtime. Bun has no registry signature or attestation audit command; the check verifies reviewed archive integrity separately from the vulnerability audit.
