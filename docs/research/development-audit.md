# Development dependency audit

The first full installation with npm 11.19.1 reported 18 high and one critical finding, including inherited findings, in the Vercel and EAS development dependency trees. Runtime-only installation had no reported vulnerabilities. The full audit remains enabled for development dependencies too.

Targeted overrides select patched published packages. Most retain the same major version. Undici 5 → 6, serialize-javascript 6 → 7, and the pre-1.0 adm-zip/tmp changes cross the requesting package ranges; they require explicit tool verification. The EAS library, Vercel CLI, and actual Node bundler must be exercised after installation. This does not prove every unused Hardhat or Vercel framework path.

| Requested transitive package | Patched version | Advisory evidence |
|---|---|---|
| `path-to-regexp@6.1.0` | `6.3.0` | [Backtracking expressions](https://github.com/advisories/GHSA-9wv6-86v2-598j) |
| `path-to-regexp@8.2.0/8.3.0` | `8.4.2` | [Optional groups](https://github.com/advisories/GHSA-j3q9-mxjg-w52f) |
| `undici@5` | `6.28.0` | [WebSocket resource exhaustion](https://github.com/advisories/GHSA-vxpw-j846-p89q) |
| `tar@7.5.7` | `7.5.22` | [Decompression limits](https://github.com/advisories/GHSA-23hp-3jrh-7fpw), [recursive paths](https://github.com/advisories/GHSA-r292-9mhp-454m) |
| `adm-zip@0.4.16` | `0.6.0` | [Crafted ZIP allocation](https://github.com/advisories/GHSA-xcpc-8h2w-3j85) |
| `serialize-javascript@6.0.2` | `7.1.0` | [Code injection](https://github.com/advisories/GHSA-5c6j-r48x-rmvq) |
| `tmp@0.0.33` | `0.2.7` | [Directory escape](https://github.com/advisories/GHSA-ph9p-34f9-6g65) |
| `minimatch@10.1.1` | `10.2.6` | [Nested extglobs](https://github.com/advisories/GHSA-23c5-xmqv-rm74) |
| `js-yaml@4.1.1` | `4.3.2` | [Quadratic processing](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) |

Versions, engine ranges, and licence metadata were checked through the packages' own npm registry records before changing the overrides. These are transitive development packages, not additions to the nine direct runtime dependencies. Tar and minimatch use BlueOak-1.0.0; the runtime licence allow-list remains unchanged. All overrides are exact in `package.json` and mirrored in `scripts/dev-overrides.json` for review enforcement. The fresh full audit and tool proof passed as recorded below; no advisory is suppressed.

The EAS 2.10.0 native ESM entry fails in Node 22 because it requests `isEqual` as a named export from CommonJS lodash. Its public `require` entry loads `EAS`, `Offchain`, and `SchemaEncoder` successfully. Use `createRequire(import.meta.url)` for the dev-only EAS cross-check tests; `scripts/development-tools.test.mjs` verifies that entry without implementing feast logic. This packaging issue is separate from the audit patches.

## Verified scope

After a fresh resolution from the reviewed manifests and eligible pins, installation reports 18 low and 28 moderate findings, with zero high or critical findings. Vercel's emitted dist function works with the patched tree, and the EAS public CommonJS entry loads. Final audit output is preserved in `docs/foundation/evidence.md`. Broader unused Hardhat and Vercel framework behavior remains outside this foundation's proof.

## Bun migration

Bun 1.4.2 imports the reviewed versions and override selectors. Its full audit reports six advisory records: three low and three moderate, with zero high or critical. Bun and npm count findings differently; the change from npm’s 46 affected development findings is not evidence of 40 fixes. Current command output is in `docs/foundation/evidence.md`.

## Late-October advisories — 25 October 2026

`bun audit --audit-level=high` reported six high findings on 25 October against the lockfile that passed on 18 October. The advisories were published or reviewed between 20 and 23 October. Vite's is cleared by Vite 7.3.7, a direct development dependency recorded in [the tooling review](tooling-update-2026-10.md). The others are transitive development packages, raised by overrides:

| Requested transitive package | Patched version | Advisory evidence |
|---|---|---|
| `undici@5` and `undici@>=6.7.0 <6.29.1`: the Vercel CLI, its Node builder and Blob client, and the EAS SDK's Hardhat | `6.29.1` | [Excessive content-encodings](https://github.com/advisories/GHSA-xjj6-f33q-929c) |
| `undici@>=7.0.0 <7.30.1`: the Vercel Sandbox client | `7.30.1` | [Excessive content-encodings](https://github.com/advisories/GHSA-xjj6-f33q-929c) |
| `follow-redirects@<1.16.1`: solc, through the EAS SDK's Hardhat | `1.16.1` | [Array-form headers](https://github.com/advisories/GHSA-q3jh-wrc6-jgq8), [sensitive-header escaping](https://github.com/advisories/GHSA-8r9p-f939-6h3c) |
| `zod@>=4.0.0 <4.6.6`: the Vercel CLI, its auth and config packages and its Sandbox client | `4.6.6` | [Oversized constrained collections](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) |

The undici selectors keep their earlier shapes with raised bounds; they selected 6.28.1 and 7.29.1 before. `undici@5` already crossed to 6 in September, as described above; the other selectors stay within the major their dependents request. Each patched archive was downloaded into its own directory and matched its registry SHA-512 and SHA-1; each is MIT and was published more than seven days before resolution.

| Package | Version | Gzip bytes | Own licence SHA-256 | Archive integrity |
|---|---|---:|---|---|
| [`undici`](https://registry.npmjs.org/undici/6.29.1) | `6.29.1` | 297,796 | `a6db8096b2707bc0102d256917d4d33f298ba36d8c3f25de067a2b5bb379db27` | `sha512-EvRlUt/QqAEvXdQeRMYUfwOQsfzpDztykrG2owGEE/rBOBoYv9uF39ZzsNDh4lTFHhTr2XOZjKkYgueD12ZmGA==` |
| [`undici`](https://registry.npmjs.org/undici/7.30.1) | `7.30.1` | 405,247 | `a6db8096b2707bc0102d256917d4d33f298ba36d8c3f25de067a2b5bb379db27` | `sha512-03KrMbjIFDWQR5RNPrSw3bd1r12JpyFQl9/yxjUbJtqkjmllqC5lFjZh6ujeuJCKr8EOQvRW872Oy/az+nLYxg==` |
| [`follow-redirects`](https://registry.npmjs.org/follow-redirects/1.16.1) | `1.16.1` | 10,076 | `bfa8a54bb952ccda79f0f1889721d108f5b605babbb2b8a3705ffb52f4132eb7` | `sha512-FNvFGzoMLWmE6Yj9spb/zjd7yiNCHiAW9/Tg9CXrQ8wuu32HtlJOwWO11OJafl5FfY3DxTdQ0vj42zU1kvv5jg==` |
| [`zod`](https://registry.npmjs.org/zod/4.6.6) | `4.6.6` | 1,141,937 | `3f1189b28e3866e0d979968d466b78f813f76827cfdca1fbb124cc0a5c8841f8` | `sha512-4UmzQUF5fxvfcYHlbjBmejU+w+hbDnWFx4aS8kBx7nPBHcO2SqPbpAG8snbdg+Xse4pRefR98hgjFgIMCI/UhA==` |

zod 3.22.4 has no fixed release: the advisory covers every version below 4.6.6. Four of the Vercel CLI's builders pin it exactly (`@vercel/backends`, `@vercel/express`, `@vercel/hono` and `@vercel/python-analysis`), and the newest release of each still does (22.0.2 for the first three, 0.15.2 for the last). An override across the major would change those builders' validation code in ways this repository cannot exercise, so `check:audit` ignores GHSA-mrhx-c7xc-m3w5, as it has ignored braces since 6 October. The builders validate this repository's own configuration, never a member's input. Nothing in the app or the functions imports zod: abitype, under viem, declares it as an optional peer for its separate `abitype/zod` entry, which viem does not load.

With the overrides and that ignore, `bun audit --audit-level=high` finds nothing at or above high: 786 packages checked, 11 findings below high, 1 ignored. Without the new ignore it reports exactly one: zod 3.22.4. The braces advisory, GHSA-vfj7-8cjw-p6xm, was withdrawn on 23 October, so its ignore no longer matches anything; it is left in place for Afolabi to remove.
