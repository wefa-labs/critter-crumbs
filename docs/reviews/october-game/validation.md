# Validation

Toolchain: Bun 1.4.2 and Node 22.22.1, with commands prefixed `mise exec node@22.22.1 --`. Installed with `bun install --frozen-lockfile --ignore-scripts`.

- `bun run check`: 62 unit files and 452 tests pass. Lint, types, generated tokens, workspace exports, development archive integrity and dependency licences pass. The command exits 1 only on the authorized temporary `GHSA-68fv-2mgg-jv7q` finding in source-map-js 1.2.1. PR #34’s final patch has not yet landed; its current audit commit is 8c29baba.
- `bun run build`: pass. Gzip shell 109753/120000 bytes; Three 249817/250000 bytes. Production defaults to v1. No new dependency.
- `bun run e2e`: 14/14 pass, including people/options flows, reconnect, plain-text/privacy boundaries, renderer context loss and cleanup.
- `bunx playwright test --config playwright.screens.config.ts`: 29/29 pass. Twenty viewport/count combinations exercise every focus. The five real API tests include tap/hold/return, reading, turn, own stir, zero crumbs and offline/online visibility without pushing the dock outside the viewport.
- `bun run screens:capture`: 40/40 pass, 20 core states on phone and desktop. Checks include visible button/link/input/summary target sizes, no runtime errors and result actions.

Overlap proof follows October section 21: phone 10 has at most 123 px² tag/ear overlap; desktop 1280 has at most 161 px². Heap/critter, heap/dock, tag/heap, tag/dock and tag/tag overlaps are zero. Matching review seed vectors and the frozen v1 generator are covered by golden tests.

Both review axes are clear after repairs: Standards 0, Spec 0. The reveal focus regression and graphics-independent workshop counts are covered by browser checks. Flights, turns, stir and huddle play advance through Koota’s Clock; still/reduced motion remains supported.

Detailed run logs and milestone handoffs are in `.scratch/phase-4-game/` in the worktree. Final demo dimensions, encoding and durations appear in [demo/README.md](demo/README.md).
