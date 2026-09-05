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
