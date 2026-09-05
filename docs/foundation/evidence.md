# Foundation validation evidence

Validated on 2026-09-04 with Node 22.22.1 and npm 11.19.1. All commands below exited 0. npm install scripts remained disabled and the seven-day release delay remained enabled. The full audit reports 18 low and 28 moderate development findings; zero high or critical findings.

## node --version

```text
v22.22.1
```

## npm --version

```text
11.19.1
```

## npm ci

```text
npm warn deprecated stream-to-promise@2.2.0: Deprecated. Use node:stream/promises and node:stream/consumers instead.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@8.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated ethereumjs-abi@0.6.8: This library has been deprecated and usage is discouraged.
npm warn deprecated uuid@8.3.2: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm warn deprecated uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm warn deprecated eslint@9.39.5: This version is no longer supported. Please see https://eslint.org/version-support for other options.

added 855 packages, and audited 859 packages in 7s

46 vulnerabilities (18 low, 28 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

## npm run check

```text

> critter-crumbs@0.0.0 check
> npm run lint && npm run typecheck && npm test && npm run check:workspaces && npm run check:licenses && npm run check:audit


> critter-crumbs@0.0.0 lint
> eslint . --max-warnings 0


> critter-crumbs@0.0.0 typecheck
> tsc -b && tsc -p tsconfig.tools.json


> critter-crumbs@0.0.0 test
> npm run compile && vitest run && node --test scripts/*.test.mjs


> critter-crumbs@0.0.0 compile
> tsc -b


 RUN  v4.1.11 /private/tmp/critter-crumbs-foundation-59aed86


 Test Files  3 passed (3)
      Tests  3 passed (3)
   Start at  22:57:29
   Duration  98ms (transform 47ms, setup 0ms, import 68ms, tests 4ms, environment 0ms)

TAP version 13
# Subtest: budgets count static imports and reject an oversized app shell
ok 1 - budgets count static imports and reject an oversized app shell
  ---
  duration_ms: 5.646416
  type: 'test'
  ...
# Subtest: the three budget rejects an oversized lazy chunk
ok 2 - the three budget rejects an oversized lazy chunk
  ---
  duration_ms: 9.867416
  type: 'test'
  ...
# Subtest: named lazy chunks cannot become static app imports
ok 3 - named lazy chunks cannot become static app imports
  ---
  duration_ms: 0.173458
  type: 'test'
  ...
# Subtest: empty chunks pass and crypto is measured without inventing a spec cap
ok 4 - empty chunks pass and crypto is measured without inventing a spec cap
  ---
  duration_ms: 0.485791
  type: 'test'
  ...
# Subtest: the EAS development cross-check entry loads with Node
ok 5 - the EAS development cross-check entry loads with Node
  ---
  duration_ms: 75.932334
  type: 'test'
  ...
# Subtest: HTML injection forms fail lint, while textContent is allowed
ok 6 - HTML injection forms fail lint, while textContent is allowed
  ---
  duration_ms: 253.523708
  type: 'test'
  ...
# Subtest: clock reads and aliases fail outside the exact adapter allow-list
ok 7 - clock reads and aliases fail outside the exact adapter allow-list
  ---
  duration_ms: 14.502583
  type: 'test'
  ...
# Subtest: workspace imports reject reverse and private paths across each syntax
ok 8 - workspace imports reject reverse and private paths across each syntax
  ---
  duration_ms: 3.923834
  type: 'test'
  ...
# Subtest: visible JSX wording and indirect literals require copy IDs
ok 9 - visible JSX wording and indirect literals require copy IDs
  ---
  duration_ms: 6.012708
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 384.278583

> critter-crumbs@0.0.0 check:workspaces
> node scripts/probe-workspaces.mjs

Node v22.22.1; npm 11.19.1; @vercel/node 9.0.1; build-utils 14.6.1; nft 1.10.0
Skipping "install" command...
Using built-in TypeScript 5.9.3 since "typescript" is missing from "devDependencies"
source: emitted function exit=1, output=Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/private/var/folders/f6/qmrlnln151nbsqrc8v3d_4cc0000gn/T/critter-crumbs-vercel-workspaces-1MaItM/source/output/node_modules/@critter-crumbs/core/src/index.ts' imported from /private/var/folders/f6/qmrlnln151nbsqrc8v3d_4cc0000gn/T/critter-crumbs-vercel-workspaces-1MaItM/source/output/api/probe.js
Skipping "install" command...
Using built-in TypeScript 5.9.3 since "typescript" is missing from "devDependencies"
dist: emitted function exit=0, output=core:shared
Built dist exports pass through preserved workspace links.

> critter-crumbs@0.0.0 check:licenses
> node scripts/check-dependencies.mjs

9 exact runtime dependencies: own permissive licences, archive integrity, and gzip evidence verified.

> critter-crumbs@0.0.0 check:audit
> npm audit --audit-level=high && npm audit signatures

# npm audit report

@tootallnate/once  <2.0.1
@tootallnate/once vulnerable to Incorrect Control Flow Scoping - https://github.com/advisories/GHSA-vpq2-c234-7xj6
fix available via `npm audit fix --force`
Will install vercel@50.41.0, which is a breaking change
node_modules/@tootallnate/once
  @vercel/fun  *
  Depends on vulnerable versions of @tootallnate/once
  node_modules/@vercel/fun
    vercel  >=25.1.1-canary.0
    Depends on vulnerable versions of @vercel/backends
    Depends on vulnerable versions of @vercel/elysia
    Depends on vulnerable versions of @vercel/express
    Depends on vulnerable versions of @vercel/fastify
    Depends on vulnerable versions of @vercel/fun
    Depends on vulnerable versions of @vercel/h3
    Depends on vulnerable versions of @vercel/hono
    Depends on vulnerable versions of @vercel/hydrogen
    Depends on vulnerable versions of @vercel/koa
    Depends on vulnerable versions of @vercel/nestjs
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/python
    Depends on vulnerable versions of @vercel/python-analysis
    Depends on vulnerable versions of @vercel/redwood
    Depends on vulnerable versions of @vercel/remix-builder
    Depends on vulnerable versions of @vercel/rust
    Depends on vulnerable versions of @vercel/static-build
    Depends on vulnerable versions of smol-toml
    node_modules/vercel

ajv  7.0.0-alpha.0 - 8.17.1
Severity: moderate
ajv has ReDoS when using `$data` option - https://github.com/advisories/GHSA-2g4f-4pwh-qvx6
fix available via `npm audit fix --force`
Will install vercel@50.41.0, which is a breaking change
node_modules/@vercel/static-config/node_modules/ajv
  @vercel/static-config  *
  Depends on vulnerable versions of ajv
  node_modules/@vercel/static-config
    @vercel/backends  <=0.0.23 || >=0.8.21
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/backends
      @vercel/cervel  >=0.1.29
      Depends on vulnerable versions of @vercel/backends
      node_modules/@vercel/cervel
        @vercel/express  *
        Depends on vulnerable versions of @vercel/cervel
        Depends on vulnerable versions of @vercel/node
        Depends on vulnerable versions of @vercel/static-config
        node_modules/@vercel/express
    @vercel/elysia  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/elysia
    @vercel/fastify  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/fastify
    @vercel/h3  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/h3
    @vercel/hono  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/hono
    @vercel/hydrogen  >=1.0.1
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/hydrogen
    @vercel/koa  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/koa
    @vercel/nestjs  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/nestjs
    @vercel/node  >=2.1.1-canary.0
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/node
    @vercel/redwood  >=2.1.0
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/redwood
    @vercel/remix-builder  *
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/remix-builder
    @vercel/static-build  >=2.0.7
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/static-build

cookie  <0.7.0
cookie accepts cookie name, path, and domain with out of bounds characters - https://github.com/advisories/GHSA-pxg6-pf52-xh8x
No fix available
node_modules/cookie
  @sentry/node  4.0.0-beta.0 - 7.74.2-alpha.1
  Depends on vulnerable versions of cookie
  node_modules/@sentry/node
    hardhat  0.1.0-rc.0 - 3.0.0-next.32
    Depends on vulnerable versions of @ethersproject/abi
    Depends on vulnerable versions of @metamask/eth-sig-util
    Depends on vulnerable versions of @nomicfoundation/ethereumjs-common
    Depends on vulnerable versions of @nomicfoundation/ethereumjs-tx
    Depends on vulnerable versions of @nomicfoundation/ethereumjs-util
    Depends on vulnerable versions of @sentry/node
    Depends on vulnerable versions of uuid
    node_modules/hardhat
      @ethereum-attestation-service/eas-contracts  *
      Depends on vulnerable versions of hardhat
      node_modules/@ethereum-attestation-service/eas-contracts
        @ethereum-attestation-service/eas-sdk  *
        Depends on vulnerable versions of @ethereum-attestation-service/eas-contracts
        node_modules/@ethereum-attestation-service/eas-sdk

elliptic  *
Elliptic Uses a Cryptographic Primitive with a Risky Implementation - https://github.com/advisories/GHSA-848j-6mx2-7j84
No fix available
node_modules/elliptic
  @ethersproject/signing-key  <=5.8.0
  Depends on vulnerable versions of elliptic
  node_modules/@ethersproject/signing-key
    @ethersproject/transactions  <=5.8.0
    Depends on vulnerable versions of @ethersproject/signing-key
    node_modules/@ethersproject/transactions
      @ethersproject/abstract-provider  *
      Depends on vulnerable versions of @ethersproject/transactions
      node_modules/@ethersproject/abstract-provider
        @ethersproject/abstract-signer  *
        Depends on vulnerable versions of @ethersproject/abstract-provider
        node_modules/@ethersproject/abstract-signer
          @ethersproject/hash  5.0.6 - 5.8.0
          Depends on vulnerable versions of @ethersproject/abstract-signer
          node_modules/@ethersproject/hash
            @ethersproject/abi  5.0.10 - 5.8.0
            Depends on vulnerable versions of @ethersproject/hash
            node_modules/@ethersproject/abi
  ethereumjs-util  1.0.2 - 2.4.0 || 4.5.1 || 5.2.1 || 6.2.1 || >=7.0.3
  Depends on vulnerable versions of elliptic
  Depends on vulnerable versions of ethereum-cryptography
  node_modules/ethereumjs-util
    @metamask/eth-sig-util  <=4.0.1
    Depends on vulnerable versions of ethereumjs-util
    node_modules/@metamask/eth-sig-util
  secp256k1  >=2.0.0
  Depends on vulnerable versions of elliptic
  node_modules/secp256k1
    ethereum-cryptography  0.1.0 - 0.1.3
    Depends on vulnerable versions of secp256k1
    node_modules/@nomicfoundation/ethereumjs-tx/node_modules/ethereum-cryptography
    node_modules/@nomicfoundation/ethereumjs-util/node_modules/ethereum-cryptography
    node_modules/ethereumjs-util/node_modules/ethereum-cryptography
      @nomicfoundation/ethereumjs-tx  *
      Depends on vulnerable versions of @nomicfoundation/ethereumjs-common
      Depends on vulnerable versions of @nomicfoundation/ethereumjs-util
      Depends on vulnerable versions of ethereum-cryptography
      node_modules/@nomicfoundation/ethereumjs-tx
      @nomicfoundation/ethereumjs-util  *
      Depends on vulnerable versions of ethereum-cryptography
      node_modules/@nomicfoundation/ethereumjs-util
        @nomicfoundation/ethereumjs-common  *
        Depends on vulnerable versions of @nomicfoundation/ethereumjs-util
        node_modules/@nomicfoundation/ethereumjs-common

smol-toml  <1.6.1
Severity: moderate
smol-toml: Denial of Service via TOML documents containing thousands of consecutive commented lines - https://github.com/advisories/GHSA-v3rj-xjv7-4jmq
fix available via `npm audit fix --force`
Will install vercel@50.41.0, which is a breaking change
node_modules/smol-toml
  @vercel/python-analysis  *
  Depends on vulnerable versions of smol-toml
  node_modules/@vercel/python-analysis
    @vercel/python  6.11.0 - 6.12.0 || >=6.14.1
    Depends on vulnerable versions of @vercel/python-analysis
    node_modules/@vercel/python
  @vercel/rust  >=1.0.6
  Depends on vulnerable versions of smol-toml
  node_modules/@vercel/rust

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
No fix available
node_modules/hardhat/node_modules/uuid
node_modules/uuid
  @metamask/utils  >=8.4.0
  Depends on vulnerable versions of uuid
  node_modules/@metamask/utils
    @metamask/abi-utils  >=2.0.3
    Depends on vulnerable versions of @metamask/utils
    node_modules/@metamask/abi-utils
      @openzeppelin/merkle-tree  >=1.0.8
      Depends on vulnerable versions of @metamask/abi-utils
      node_modules/@openzeppelin/merkle-tree

46 vulnerabilities (18 low, 28 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.
audited 852 packages in 5s

852 packages have verified registry signatures

167 packages have verified attestations
(use --json --include-attestations to view attestation details)
```

## npm run build

```text

> critter-crumbs@0.0.0 build
> npm run compile && vite build --config packages/app/vite.config.ts


> critter-crumbs@0.0.0 compile
> tsc -b

vite v7.3.6 building client environment for production...
transforming...
✓ 5 modules transformed.
Generated an empty chunk: "crypto".
Generated an empty chunk: "three".
rendering chunks...
Gzip bytes: shell=399/120000; three=21/250000; crypto=21 (no numeric cap in §17).
computing gzip size...
../../dist/index.html                            0.29 kB │ gzip:   0.22 kB
../../dist/licenses/shutter-sdk-LICENSE          1.07 kB
../../dist/licenses/react-three-fiber-LICENSE    1.07 kB
../../dist/blst.js                             124.69 kB
../../dist/blst.wasm                           327.18 kB │ gzip: 125.56 kB
../../dist/assets/crypto-l0sNRNKZ.js             0.00 kB │ gzip:   0.02 kB
../../dist/assets/three-l0sNRNKZ.js              0.00 kB │ gzip:   0.02 kB
../../dist/assets/index-B5Qt9EMX.js              0.71 kB │ gzip:   0.40 kB
✓ built in 42ms
```

## npm audit --audit-level=high

```text
# npm audit report

@tootallnate/once  <2.0.1
@tootallnate/once vulnerable to Incorrect Control Flow Scoping - https://github.com/advisories/GHSA-vpq2-c234-7xj6
fix available via `npm audit fix --force`
Will install vercel@50.41.0, which is a breaking change
node_modules/@tootallnate/once
  @vercel/fun  *
  Depends on vulnerable versions of @tootallnate/once
  node_modules/@vercel/fun
    vercel  >=25.1.1-canary.0
    Depends on vulnerable versions of @vercel/backends
    Depends on vulnerable versions of @vercel/elysia
    Depends on vulnerable versions of @vercel/express
    Depends on vulnerable versions of @vercel/fastify
    Depends on vulnerable versions of @vercel/fun
    Depends on vulnerable versions of @vercel/h3
    Depends on vulnerable versions of @vercel/hono
    Depends on vulnerable versions of @vercel/hydrogen
    Depends on vulnerable versions of @vercel/koa
    Depends on vulnerable versions of @vercel/nestjs
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/python
    Depends on vulnerable versions of @vercel/python-analysis
    Depends on vulnerable versions of @vercel/redwood
    Depends on vulnerable versions of @vercel/remix-builder
    Depends on vulnerable versions of @vercel/rust
    Depends on vulnerable versions of @vercel/static-build
    Depends on vulnerable versions of smol-toml
    node_modules/vercel

ajv  7.0.0-alpha.0 - 8.17.1
Severity: moderate
ajv has ReDoS when using `$data` option - https://github.com/advisories/GHSA-2g4f-4pwh-qvx6
fix available via `npm audit fix --force`
Will install vercel@50.41.0, which is a breaking change
node_modules/@vercel/static-config/node_modules/ajv
  @vercel/static-config  *
  Depends on vulnerable versions of ajv
  node_modules/@vercel/static-config
    @vercel/backends  <=0.0.23 || >=0.8.21
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/backends
      @vercel/cervel  >=0.1.29
      Depends on vulnerable versions of @vercel/backends
      node_modules/@vercel/cervel
        @vercel/express  *
        Depends on vulnerable versions of @vercel/cervel
        Depends on vulnerable versions of @vercel/node
        Depends on vulnerable versions of @vercel/static-config
        node_modules/@vercel/express
    @vercel/elysia  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/elysia
    @vercel/fastify  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/fastify
    @vercel/h3  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/h3
    @vercel/hono  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/hono
    @vercel/hydrogen  >=1.0.1
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/hydrogen
    @vercel/koa  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/koa
    @vercel/nestjs  *
    Depends on vulnerable versions of @vercel/node
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/nestjs
    @vercel/node  >=2.1.1-canary.0
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/node
    @vercel/redwood  >=2.1.0
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/redwood
    @vercel/remix-builder  *
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/remix-builder
    @vercel/static-build  >=2.0.7
    Depends on vulnerable versions of @vercel/static-config
    node_modules/@vercel/static-build

cookie  <0.7.0
cookie accepts cookie name, path, and domain with out of bounds characters - https://github.com/advisories/GHSA-pxg6-pf52-xh8x
No fix available
node_modules/cookie
  @sentry/node  4.0.0-beta.0 - 7.74.2-alpha.1
  Depends on vulnerable versions of cookie
  node_modules/@sentry/node
    hardhat  0.1.0-rc.0 - 3.0.0-next.32
    Depends on vulnerable versions of @ethersproject/abi
    Depends on vulnerable versions of @metamask/eth-sig-util
    Depends on vulnerable versions of @nomicfoundation/ethereumjs-common
    Depends on vulnerable versions of @nomicfoundation/ethereumjs-tx
    Depends on vulnerable versions of @nomicfoundation/ethereumjs-util
    Depends on vulnerable versions of @sentry/node
    Depends on vulnerable versions of uuid
    node_modules/hardhat
      @ethereum-attestation-service/eas-contracts  *
      Depends on vulnerable versions of hardhat
      node_modules/@ethereum-attestation-service/eas-contracts
        @ethereum-attestation-service/eas-sdk  *
        Depends on vulnerable versions of @ethereum-attestation-service/eas-contracts
        node_modules/@ethereum-attestation-service/eas-sdk

elliptic  *
Elliptic Uses a Cryptographic Primitive with a Risky Implementation - https://github.com/advisories/GHSA-848j-6mx2-7j84
No fix available
node_modules/elliptic
  @ethersproject/signing-key  <=5.8.0
  Depends on vulnerable versions of elliptic
  node_modules/@ethersproject/signing-key
    @ethersproject/transactions  <=5.8.0
    Depends on vulnerable versions of @ethersproject/signing-key
    node_modules/@ethersproject/transactions
      @ethersproject/abstract-provider  *
      Depends on vulnerable versions of @ethersproject/transactions
      node_modules/@ethersproject/abstract-provider
        @ethersproject/abstract-signer  *
        Depends on vulnerable versions of @ethersproject/abstract-provider
        node_modules/@ethersproject/abstract-signer
          @ethersproject/hash  5.0.6 - 5.8.0
          Depends on vulnerable versions of @ethersproject/abstract-signer
          node_modules/@ethersproject/hash
            @ethersproject/abi  5.0.10 - 5.8.0
            Depends on vulnerable versions of @ethersproject/hash
            node_modules/@ethersproject/abi
  ethereumjs-util  1.0.2 - 2.4.0 || 4.5.1 || 5.2.1 || 6.2.1 || >=7.0.3
  Depends on vulnerable versions of elliptic
  Depends on vulnerable versions of ethereum-cryptography
  node_modules/ethereumjs-util
    @metamask/eth-sig-util  <=4.0.1
    Depends on vulnerable versions of ethereumjs-util
    node_modules/@metamask/eth-sig-util
  secp256k1  >=2.0.0
  Depends on vulnerable versions of elliptic
  node_modules/secp256k1
    ethereum-cryptography  0.1.0 - 0.1.3
    Depends on vulnerable versions of secp256k1
    node_modules/@nomicfoundation/ethereumjs-tx/node_modules/ethereum-cryptography
    node_modules/@nomicfoundation/ethereumjs-util/node_modules/ethereum-cryptography
    node_modules/ethereumjs-util/node_modules/ethereum-cryptography
      @nomicfoundation/ethereumjs-tx  *
      Depends on vulnerable versions of @nomicfoundation/ethereumjs-common
      Depends on vulnerable versions of @nomicfoundation/ethereumjs-util
      Depends on vulnerable versions of ethereum-cryptography
      node_modules/@nomicfoundation/ethereumjs-tx
      @nomicfoundation/ethereumjs-util  *
      Depends on vulnerable versions of ethereum-cryptography
      node_modules/@nomicfoundation/ethereumjs-util
        @nomicfoundation/ethereumjs-common  *
        Depends on vulnerable versions of @nomicfoundation/ethereumjs-util
        node_modules/@nomicfoundation/ethereumjs-common

smol-toml  <1.6.1
Severity: moderate
smol-toml: Denial of Service via TOML documents containing thousands of consecutive commented lines - https://github.com/advisories/GHSA-v3rj-xjv7-4jmq
fix available via `npm audit fix --force`
Will install vercel@50.41.0, which is a breaking change
node_modules/smol-toml
  @vercel/python-analysis  *
  Depends on vulnerable versions of smol-toml
  node_modules/@vercel/python-analysis
    @vercel/python  6.11.0 - 6.12.0 || >=6.14.1
    Depends on vulnerable versions of @vercel/python-analysis
    node_modules/@vercel/python
  @vercel/rust  >=1.0.6
  Depends on vulnerable versions of smol-toml
  node_modules/@vercel/rust

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
No fix available
node_modules/hardhat/node_modules/uuid
node_modules/uuid
  @metamask/utils  >=8.4.0
  Depends on vulnerable versions of uuid
  node_modules/@metamask/utils
    @metamask/abi-utils  >=2.0.3
    Depends on vulnerable versions of @metamask/utils
    node_modules/@metamask/abi-utils
      @openzeppelin/merkle-tree  >=1.0.8
      Depends on vulnerable versions of @metamask/abi-utils
      node_modules/@openzeppelin/merkle-tree

46 vulnerabilities (18 low, 28 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.
```

## gh label list --repo wefa-labs/critter-crumbs

```text
accessibility	Barrier affecting people with disabilities	#f143ab
bug	Something isn't working	#d73a4a
documentation	Improvements or additions to documentation	#0075ca
duplicate	This issue or pull request already exists	#cfd3d7
enhancement	New feature or request	#a2eeef
good first issue	Good for newcomers	#7057ff
help wanted	Extra attention is needed	#008672
invalid	This doesn't seem right	#e4e669
question	Further information is requested	#d876e3
wontfix	This will not be worked on	#ffffff
needs-human	Requires a person to resolve before work can proceed	#B60205
ready-for-agent	Defined work ready for an agent	#0E8A16
automated/codex	Work prepared by Codex	#6F42C1
blocked	Waiting on a recorded dependency	#D93F0B
```

## Dependency table

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

## Decisions added

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-09-04 | Use npm workspaces at `packages/{shared,core,app}`, with one public entry each; keep `api/`, `db/`, `scripts/`, `tests/e2e/` at the root | Package interfaces enforce the workstream seams; Vercel requires root functions | Codex |
| 2026-09-04 | Interpret §11 as nine active runtime packages; do not add `@vercel/functions` | The table counts ten but names nine packages and explicitly rejects the functions helper | Codex |
| 2026-09-04 | Pin runtime `react@19.2.8` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `react-dom@19.2.8` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `three@0.185.1` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@react-three/fiber@9.7.0` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@react-three/drei@10.7.8` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `koota@0.6.6` (ISC) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `viem@2.56.3` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@shutter-network/shutter-sdk@0.0.2` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Pin runtime `@neondatabase/serverless@1.1.0` (MIT) | §11 purpose; own licence and gzip evidence in `docs/research/dependencies.md` | Codex |
| 2026-09-04 | Shutter 0.0.2 uses MIT in its licence file and ISC metadata; retain WASM CSP and copy BLST assets during the explicit build; use `encryptData(message, identity, eonKey, sigma)` in phase 2 | Verified archive corrects the §6 argument order and resolves V1; see `docs/research/shutter-sdk-v1.md` | Codex |
| 2026-09-04 | Retain Fiber 9.7.0's MIT licence from its published source revision; record Koota as ISC and Neon as MIT | Fiber omits the grant from npm; the other two §11 licence labels differ from their own files | Codex |
| 2026-09-04 | Pin dev `vite@7.3.6` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@vitejs/plugin-react@5.2.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `typescript@5.9.3` | §11 build/test tooling; 5.9.3 stays within the TypeScript ESLint peer range, unlike current TypeScript 7 | Codex |
| 2026-09-04 | Pin dev `vitest@4.1.11` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/node@22.20.1` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/react@19.2.18` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/react-dom@19.2.7` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@types/three@0.185.4` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `eslint@9.39.5` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@typescript-eslint/parser@8.69.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@typescript-eslint/eslint-plugin@8.69.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `@ethereum-attestation-service/eas-sdk@2.10.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `playwright@1.63.0` | §11 build/test tooling | Codex |
| 2026-09-04 | Pin dev `vercel@59.11.7` | Required by §14 local functions and the actual Node function bundler proof; development only | Codex |
| 2026-09-04 | Keep npm 10.9.4 bundled with Node 22.22.1 and enable `npm audit signatures`; no unsupported cooldown key | Verified npm 10 has signature verification but no release-age setting; `docs/research/npm-policy.md` | Codex |
| 2026-09-04 | Supersede the bundled npm choice with npm 11.19.1; keep Node 22.22.1 for local/CI and permit later Node 22 patches in engines | npm 10.9.4 twice crashes in Arborist while resolving the specified tools; npm 11 supports Node 22 and release-age policy. Vercel selects its managed Node 22 patch | Codex |
| 2026-09-04 | Override dev transitive `path-to-regexp@6.1.0` to `6.3.0` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `path-to-regexp@>=8.0.0 <8.4.2` to `8.4.2` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `undici@5` to `6.28.1` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `tar@7.5.7` to `7.5.22` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `adm-zip@0.4.16` to `0.6.0` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `serialize-javascript@6.0.2` to `7.1.1` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `tmp@0.0.33` to `0.2.7` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `minimatch@10.1.1` to `10.2.6` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Override dev transitive `js-yaml@4.1.1` to `4.3.2` | Remove a high/critical advisory in the Vercel or EAS development tree; full audit remains enforced; see `docs/research/development-audit.md` | Codex |
| 2026-09-04 | Enable `min-release-age=7` with npm 11.19.1 and keep `ignore-scripts=true` with no exceptions | npm 11 supports a moving seven-day release delay; builds and smoke/guardrail tests work without lifecycle scripts; signatures verify locked versions independently of the delay | Codex |
| 2026-09-04 | Measure `crypto` without a numeric cap; enforce 120,000-byte shell and 250,000-byte three gzip limits plus lazy import separation | §17 specifies only two numeric caps; do not invent a crypto limit | Codex |
| 2026-09-04 | Save one human setup issue draft under `docs/foundation/` and `.scratch/phase-1/issues/` until Issues is enabled | GitHub authenticated and labels were created, but the repository has Issues disabled; repository setting changes are out of scope | Codex |
| 2026-09-04 | Load the dev-only EAS SDK through its public CommonJS entry using `createRequire` in cross-check tests | Its native ESM entry requests an unsupported lodash named export in Node 22; the public require entry passes a tooling smoke test | Codex |
| 2026-09-04 | Export built ESM `dist/index.js` and declarations from each package; compile before Vercel traces root functions | @vercel/node 12.0.1 preserves workspace links; emitted dist invocation succeeds, while source exports fail after TypeScript files are renamed. `npm run check:workspaces` repeats the proof | Codex |
| 2026-09-04 | Supersede `@types/react-dom@19.2.7` with `19.2.5` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `@typescript-eslint/parser@8.69.0` with `8.68.0` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `@typescript-eslint/eslint-plugin@8.69.0` with `8.68.0` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `playwright@1.63.0` with `1.62.1` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `vercel@59.11.7` with `59.9.1` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Supersede `viem@2.56.3` with `2.56.0` | The newer release is younger than the enabled seven-day delay; retain the policy. viem's replacement archive and licence were reverified | Codex |
| 2026-09-04 | Use patched dev transitive `undici@6.28.0` instead of `6.28.1` | Retain the seven-day release delay while selecting a patched version | Codex |
| 2026-09-04 | Use patched dev transitive `serialize-javascript@7.1.0` instead of `7.1.1` | Retain the seven-day release delay while selecting a patched version | Codex |
