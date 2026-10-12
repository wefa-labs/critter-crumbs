# Runtime dependency evidence

Checked 2026-09-04 with Node 22.22.1. Initial archives used npm 10.9.4; the eligible viem replacement used npm 11.19.1. Each exact published archive was downloaded with `npm pack --ignore-scripts`; its manifest and own licence were read before installation. Sizes below are gzip-compressed npm archives, including declarations and other package files, not browser chunks.

Technical Spec §11 says ten runtime dependencies, but names nine active packages and explicitly excludes `@vercel/functions`. The foundation uses those nine.

| Package | Exact version | Manifest licence | Own licence | Gzipped archive (bytes) |
|---|---|---|---|---:|
| [`react`](https://registry.npmjs.org/react/19.2.8) | `19.2.8` | MIT | MIT | 24,799 |
| [`react-dom`](https://registry.npmjs.org/react-dom/19.2.8) | `19.2.8` | MIT | MIT | 1,276,383 |
| [`three`](https://registry.npmjs.org/three/0.185.1) | `0.185.1` | MIT | MIT | 5,320,348 |
| [`@react-three/fiber`](https://registry.npmjs.org/@react-three/fiber/9.7.0) | `9.7.0` | MIT | MIT | 508,147 |
| [`@react-three/drei`](https://registry.npmjs.org/@react-three/drei/10.7.8) | `10.7.8` | MIT | MIT | 472,446 |
| [`koota`](https://registry.npmjs.org/koota/0.6.6) | `0.6.6` | ISC | ISC | 93,249 |
| [`viem`](https://registry.npmjs.org/viem/2.56.0) | `2.56.0` | MIT | MIT | 3,854,371 |
| [`@shutter-network/shutter-sdk`](https://registry.npmjs.org/@shutter-network/shutter-sdk/0.0.2) | `0.0.2` | ISC | MIT | 286,989 |
| [`@neondatabase/serverless`](https://registry.npmjs.org/@neondatabase/serverless/1.1.0) | `1.1.0` | MIT | MIT | 131,636 |

Fiber omits its own licence from the archive; [its exact published source revision supplies the MIT grant](fiber-license.md), preserved in `licenses/react-three-fiber-LICENSE`. [Shutter's MIT licence differs from its ISC metadata](shutter-sdk-v1.md); both are permitted. Koota is ISC and Neon is MIT, correcting the §11 licence labels.

`scripts/runtime-dependencies.json` records archive integrity and licence SHA-256 values for the automated check. A patch changes what an archive installs, so a patched package also lists its patch file and that file's SHA-256, and the check fails when a patch is added or changed without them. Two packages carry one: Koota (`patches/koota@0.6.6.patch`) and the Shutter SDK (`patches/@shutter-network%2Fshutter-sdk@0.0.2.patch`); `docs/decisions.md` has both, on 9 and 10 October 2026. Installation and validation results are recorded in the foundation evidence.

## Runtime update review — 12 October 2026

The six runtime updates in PR #40 were downloaded from the exact npm archive URLs. Each archive’s SHA-512 matched its published integrity; each package manifest and own licence was inspected. All six retain MIT licences. Fiber still omits its own licence from the archive; the unchanged retained notice was verified at published source commit `53ec672ac4a7189711766b87ece18889abbb32d4`. React’s declaration packages move together to `19.3.0`.

| Package | Version | Gzip archive bytes |
|---|---|---:|
| [`react`](https://registry.npmjs.org/react/19.3.0) | `19.3.0` | 26,394 |
| [`react-dom`](https://registry.npmjs.org/react-dom/19.3.0) | `19.3.0` | 1,409,226 |
| [`three`](https://registry.npmjs.org/three/0.186.1) | `0.186.1` | 4,648,523 |
| [`@react-three/fiber`](https://registry.npmjs.org/@react-three/fiber/9.8.1) | `9.8.1` | 555,765 |
| [`@react-three/drei`](https://registry.npmjs.org/@react-three/drei/10.7.9) | `10.7.9` | 473,422 |
| [`@neondatabase/serverless`](https://registry.npmjs.org/@neondatabase/serverless/1.2.0) | `1.2.0` | 135,513 |

Archive integrity and licence hashes are recorded in `scripts/runtime-dependencies.json`. [Fiber’s exact upstream licence](https://github.com/pmndrs/react-three-fiber/blob/53ec672ac4a7189711766b87ece18889abbb32d4/LICENSE).

The matching declaration archives were also inspected: both use MIT, with own licence SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`.

| Declaration package | Version | Gzip archive bytes | SHA-512 archive integrity |
|---|---|---:|---|
| [`@types/react`](https://registry.npmjs.org/@types/react/19.3.0) | `19.3.0` | 77,822 | `sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==` |
| [`@types/react-dom`](https://registry.npmjs.org/@types/react-dom/19.3.0) | `19.3.0` | 8,185 | `sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==` |
