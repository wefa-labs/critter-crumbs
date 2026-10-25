# Tooling update review — 12 October 2026

PR #47 retains TypeScript 5.9.3 because the installed TypeScript ESLint parser rejects TypeScript 7. Node declarations stay on 22.20.1 to match the Node 22 function toolchain. The local Shutter helper retains Noble curves 1.9.1 and its reviewed API. ESLint moves to 10.12.0, within the parser/plugin’s declared peer range, and Vitest to 5.0.3.

The exact npm archives below were downloaded and their SHA-512 integrity, package manifests and own MIT licences verified. Install scripts remained disabled. React declarations belong to the separately reviewed runtime update in PR #40.

| Package | Version | Gzip bytes | Own licence SHA-256 | Archive integrity |
|---|---|---:|---|---|
| [`eslint`](https://registry.npmjs.org/eslint/10.12.0) | `10.12.0` | 628,464 | `3b6be04f862a077a4b97929dbf247299360824d9365f8603c263769303ace18c` | `sha512-npHjrHb2o4ehH3mE+YuxABR+0gyb0aVWCIolgJDArwCiHEIsonBm3ZKjel5b0U5+a+MbEvIyRCGCzD3eKKK2NA==` |
| [`vitest`](https://registry.npmjs.org/vitest/5.0.3) | `5.0.3` | 694,028 | `c8f14eea9df88b94c4710b4c476d8642e080832d7de0d861eba1337746494b4d` | `sha512-xMw97S3rjdtj5dkVat7jCsqWBpvchs3RlpQctUqwJD0KkERk40vz2fJ77lDwW/Vzh/pk18eItYAzkodhSes3jQ==` |

## Tooling update review — 25 October 2026

PR #63 proposed ten development updates. The five that stay within the limits above and need no review of their own are taken: PGlite 0.5.10, Three declarations 0.186.0, ESLint 10.13.0, Playwright 1.64.1 and Vitest 5.0.5. Vite moves to 7.3.7, the patch release of the installed line, because 7.3.6 bundles a `launch-editor` affected by [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) (high), [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) and [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv); 7.3.7 bundles `launch-editor-middleware` ^2.14.2, the fixed release.

Five are held back, and `.github/dependabot.yml` ignores their major updates:

- **TypeScript 7.0.2.** The installed TypeScript ESLint parser, 8.68.0, declares `typescript >=4.8.4 <6.1.0` and refuses TypeScript 7 at start-up; PR #63's CI stopped there. 8.72.0, the latest, declares the same range. The major-version rule also keeps out TypeScript 6.0.3, which that range accepts but nobody has reviewed.
- **Node declarations 26.6.5.** The functions and tools run on Node 22, so the declarations stay on 22.x.
- **Noble curves 2.4.0.** The local Shutter helper keeps 1.9.1 and its reviewed API.
- **Vite 8.3.4.** Vite 8 builds with Rolldown: its manifest depends on `rolldown` where 7.3.7 depends on `rollup` and `esbuild`. The app's chunk split (`manualChunks` in `packages/app/vite.config.ts`) and the bundle budgets are measured on Rollup's output, so the move needs its own review and fresh budget figures.
- **React plugin 6.1.2.** It declares `vite ^8.0.0`, so it waits for Vite 8; 5.2.0 accepts Vite 4 to 8.

Each exact npm archive below was downloaded from its registry tarball URL into its own directory. Its SHA-512 matched the registry record and the lockfile, its SHA-1 matched the registry record, and its package manifest and own licence were read. Install scripts remained disabled. ESLint's licence is unchanged since 10.12.0. Vitest's `LICENSE.md` differs from 5.0.3's in one bundled notice's copyright years; Vite's is byte-identical to 7.3.6's. Playwright and its exact dependency `playwright-core` also carry `NOTICE` and `ThirdPartyNotices.txt`.

| Package | Version | Licence | Gzip bytes | Own licence SHA-256 | Archive integrity |
|---|---|---|---:|---|---|
| [`@electric-sql/pglite`](https://registry.npmjs.org/@electric-sql/pglite/0.5.10) | `0.5.10` | Apache-2.0 | 10,206,211 | `a6cba85bc92e0cff7a450b1d873c0eaa2e9fc96bf472df0247a26bec77bf3ff9` | `sha512-tXc/25U3ulOkiRQuTFdwIv+JhBqtMdAF7Gvo6CfZZWtSB4+hgC4Wr2vwK5ngvvN5PJfAAEGIsfyCVy1JhCOBYw==` |
| [`@types/three`](https://registry.npmjs.org/@types/three/0.186.0) | `0.186.0` | MIT | 371,133 | `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383` | `sha512-mxYSBpDC+D0pLfSP6sW4WZTcT+nrtmZcimMqnVmy36Hte3XpeYSrvgg4TRdaM1GemGog1AWzI5qL2VoIfMXbJQ==` |
| [`eslint`](https://registry.npmjs.org/eslint/10.13.0) | `10.13.0` | MIT | 629,155 | `3b6be04f862a077a4b97929dbf247299360824d9365f8603c263769303ace18c` | `sha512-UohDjD4zSzEwhf58M3O7vc/ycc8O1I7dNlhtD0WxE8Px8EHNJKtUwzBqrzeGhisRuv2ag4sAYswszCJRgKXYUg==` |
| [`playwright`](https://registry.npmjs.org/playwright/1.64.1) | `1.64.1` | Apache-2.0 | 905,535 | `45873d00a0dd243596deb4aa23b2493b3d1f0671921bf2538ea431d7380220eb` | `sha512-HCrVhHr5QQuwYoswEUGTb7gGp522yflbv/ST8nF4sFWGuLjQCt17Q/EubpGGSNKYn1tsTCPZxqHhHCfVURu7UA==` |
| [`playwright-core`](https://registry.npmjs.org/playwright-core/1.64.1) | `1.64.1` | Apache-2.0 | 3,172,161 | `45873d00a0dd243596deb4aa23b2493b3d1f0671921bf2538ea431d7380220eb` | `sha512-BC4s8y6SEVA6Q1rSxZTto8hI1KUI3xXlHGZgvGqP4IqPdI/a6FX9H29IDNz7vKo9l21b6LfYosScPL6M3xxyDQ==` |
| [`vitest`](https://registry.npmjs.org/vitest/5.0.5) | `5.0.5` | MIT | 710,235 | `78fbac9e571c2ee260deb2a1941a8a18f0a85e3f39c23d08e2dcee6da4841998` | `sha512-cPODOMF8YnkiiYtDdHo6n4wWmBrOBBbOIYH2d33M4l3CdNn72h+qMmO6uXffUN6A5AZFXNND/d+krS9mgkXRfg==` |
| [`vite`](https://registry.npmjs.org/vite/7.3.7) | `7.3.7` | MIT | 544,713 | `a77a1c089806b39ad339535bdf3677f636c91d96693e8ad7b11fe733f650ea64` | `sha512-AHEzTORMbi7/7aXp7w7KZ5+DCUdSeLsJz0grY8xHpc9DHdYb0vQu6DqJfm2tOw3gDExNgPgnJTXxM6syYFHaCA==` |

The lockfile's other changes come with these packages and are MIT, each published more than seven days before resolution: `@vitest/mocker` and `@vitest/spy` 5.0.5, chai 6.3.0, magic-string 1.4.3, obug 3.0.0, std-env 4.3.0, tinybench 6.2.2 and tinyexec 1.3.1 with Vitest; fsevents settles on one 2.3.3, since Playwright 1.64 no longer pins its own 2.3.2. Playwright's browsers are versioned with it, so run `bun run e2e:install` once before the next end-to-end run.
