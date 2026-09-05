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

`scripts/runtime-dependencies.json` records archive integrity and licence SHA-256 values for the automated check. Installation and validation results are recorded in the foundation evidence.
