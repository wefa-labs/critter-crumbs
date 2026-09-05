# Foundation

This checkout prepares the tooling for the core and app workstreams. It contains no feast logic, route handlers, or UI. All three packages expose only `.` through built ESM JavaScript and declarations; their public entries are empty. Add exports deliberately in later phases.

```text
packages/shared/   shared types, copy, constants, validators in phase 2
packages/core/     core implementation in phase 2
packages/app/      Vite root, public assets, app implementation in phase 3
api/              Vercel functions at repository root
api/_lib/         server adapters in phase 2
db/migrations/    SQL in phase 2
scripts/          tooling now; migration and seed implementations in phase 2
tests/e2e/        lifecycle proof in phase 3
```

Each package has `src/index.ts`, `test/smoke.test.ts`, a tsconfig extending the root base, and the following interface:

```json
{".": {"types": "./dist/index.d.ts", "default": "./dist/index.js"}}
```

Import by package name. Cross-package relative paths and private subpaths fail lint. Shared cannot import core or app; core cannot import app; root functions may import core and shared. Tests import through the same public entries. Shared compiles before core and app.

Select Node 22.22.1 (npm 11.19.1), then run from the repository root:

```sh
npm install --global npm@11.19.1 --ignore-scripts
npm ci
npm run check
npm run build
```

`check` runs lint, typecheck, the package smoke tests, tooling regressions, isolated Vercel workspace proof, verified direct-runtime licences, dependency audit, and registry signature verification. `build` emits `dist/`, copies Shutter's prebuilt BLST assets explicitly, and enforces gzip limits. Install scripts remain disabled. `npm run e2e:install` explicitly installs Chromium; `npm run e2e` has no lifecycle test until phase 3 and must not be reported as passing now. `npm run migrate` and `npm run seed` deliberately fail with a phase 2 requirement until their implementations exist.

`npm run dev:app` starts Vite alone. After a person completes [the setup request](needs-human-setup.md), `npm run dev` runs Vite on port 5173 and `vercel dev` on port 3000; Vite proxies `/api`. Mock mode is the local default. Preview and production remain separate configurations, as Technical Spec §13 requires.

Clock access in all linted source and tooling is restricted to `api/_lib/clock.ts`, `packages/app/src/sim/ticker-host.ts`, and `packages/core/src/api-client/clock-offset.ts`. Those adapters do not exist yet. Logic accepts time as an input. Component files (`.tsx` and `.jsx`, plus `.ts`/`.js` under screens and components) keep visible wording in `packages/shared/src/copy.ts`: use `copy['id']` or `copy('id')`. Structural attributes and type literals are allowed; indirect visible string literals also fail lint.

The build emits unreferenced empty `three` and `crypto` entries so their names and budget checks exist before phase 3. Future code imports those modules lazily at the spec's interaction points. The app shell's static graph, including CSS, is capped at 120,000 gzip bytes; additional `three` code at 250,000. Static shell imports of either lazy chunk fail. §17 gives no numeric crypto cap, so crypto size is reported without inventing one. BLST JavaScript/WASM are separate lazy assets and their sizes are recorded in the V1 research.

Read [dependency evidence](../research/dependencies.md), [V1](../research/shutter-sdk-v1.md), [workspace research](../research/vercel-workspaces.md), and [npm policy](../research/npm-policy.md) before changing the toolchain. A dependency update requires a decisions entry and refreshed licence/archive evidence; the check intentionally rejects unreviewed pins.

The full development audit currently retains low and moderate upstream findings; high and critical findings fail the check. Targeted development-only overrides and their validation limits are documented in [the audit note](../research/development-audit.md).
