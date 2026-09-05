# Shutter SDK V1 verification

Verified 2026-09-04 with Node 22.22.1 and npm 10.9.4. This was archive and source inspection; the SDK was neither installed nor executed.

`@shutter-network/shutter-sdk@0.0.2` passes Phase 1's permissive-licence gate: its published `LICENSE` is MIT, although its `package.json` declares ISC. Both are on the project's permitted list. Preserve the actual MIT notice and record the discrepancy. The package requires WASM and its encryption argument order differs from Technical Spec §6. [Published npm archive](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz), [upstream licence](https://github.com/shutter-network/shutter-sdk/blob/main/LICENSE).

## Published package

The npm registry's `latest` version was `0.0.2`, with `gitHead` `9a01a6e2b25dd310f736673ed7e4407199386dcc`. `npm pack --ignore-scripts` downloaded that version for inspection. Its archive integrity is `sha512-xqfIa+hiYUE2VpeFeTvRmCZBPxkmmc1Qyl508Qg3hEkqLjL3qxuaciinYuFM3I5KJXjYBnySzY8DA5yNvHZwFw==`; SHA-1 is `703f19484b36d9c7faf7bba45a433b643bea9610`. [Version metadata](https://registry.npmjs.org/@shutter-network%2fshutter-sdk/0.0.2).

| Package | Exact version | `package.json` licence | Own `LICENSE` | Gzipped npm archive | Unpacked bytes |
|---|---|---|---|---:|---:|
| `@shutter-network/shutter-sdk` | `0.0.2` | ISC | MIT; Copyright 2025 Shutter Network | 286,989 bytes | 1,107,859 |

The licence file's SHA-256 is `a9906885a9ec1c991ee23d5978d9d7b4329f94c98217575f215d359d7e05ab4c`. The archive contains 15 files, including the licence, declarations, CommonJS and ESM output, source maps, and BLST assets. The archive size includes all of those files; it is not a browser chunk measurement. [Published archive](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz).

## Public interface

The package exports map is exactly:

```json
{
  "import": "./dist/index.mjs",
  "require": "./dist/index.js"
}
```

It also declares `main: dist/index.js`, `module: dist/index.mjs`, and `types: dist/index.d.ts`. There are no exported subpaths. Runtime exports are `BLST_ERROR`, `computeIdentityP1`, `decodeEncryptedMessage`, `decrypt`, `encodeEncryptedMessage`, and `encryptData`. [Published `package.json` and distribution files](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz).

The declarations additionally export the types `Blst`, `P1`, `P1Constructor`, `P1_Affine`, `P1_AffineConstructor`, `P2`, `P2Constructor`, `P2_Affine`, `P2_AffineConstructor`, `PT`, `PTConstructor`, `Pairing`, `PairingConstructor`, `Scalar`, `ScalarConstructor`, `SecretKey`, and `SecretKeyConstructor`. [Published `dist/index.d.ts`](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz).

For the future `Timelock` adapter, the verified call order is:

```ts
encryptData(msgHex, identityPreimageHex, eonKeyHex, sigmaHex)
decrypt(encryptedMessageHex, epochSecretKeyHex)
```

`encryptData` requires four `0x`-prefixed hex strings and returns `Promise<0x-prefixed hex string>`. `decrypt` returns the same hex promise, but its two parameters are declared `any`. Technical Spec §6 places the eon key before the identity; the published declaration and implementation put the identity first. Record this correction in decisions without editing the domain spec during Phase 1. [Published declarations and implementation](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz), [official encryption example](https://github.com/shutter-network/shutter-sdk#encryption).

## WASM and install scripts

Browser initialization appends a script element with `src="/blst.js"`; that loader locates `blst.wasm` beside itself and calls `WebAssembly.instantiateStreaming` or `WebAssembly.instantiate`. Thus the §2 CSP needs its existing `'wasm-unsafe-eval'`, and the app build must copy `dist/blst.js` and `dist/blst.wasm` to the public output root before the future crypto adapter uses them. The published loader contains no `eval(` or `new Function`. [Published loader and entry module](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz), [official browser asset instructions](https://github.com/shutter-network/shutter-sdk#%EF%B8%8F-asset-placement-required-for-browser-usage).

The package has only `test` and `build` scripts, with no install lifecycle script. Its required browser assets are already built in the archive. An explicit project build step can copy them while `ignore-scripts=true` remains enabled; the README's suggested project `postinstall` is unnecessary. This observation covers the SDK, not the rest of the toolchain. [Published manifest and files](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz).

| Published file | Bytes | Gzip level 9 bytes |
|---|---:|---:|
| `dist/index.mjs` | 8,717 | 2,674 |
| `dist/blst.js` | 124,686 | 27,906 |
| `dist/blst.wasm` | 327,178 | 124,782 |

These file measurements exclude dependencies and do not establish compliance with the final `crypto` chunk budget. The manifest declares `browser-or-node`, `buffer`, `lodash`, and `viem` dependencies. [Published archive](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz).

## Bundled BLST evidence and limit

The published `blst.js` is byte-for-byte identical to `src/crypto/blst/blst.js` at the npm `gitHead`; its SHA-256 is `89720e240ed9c1d398c3c872fc0b15972d36a86c0b8d18877374a478a7d0707b`. The WASM asset's SHA-256 is `6484fc663fd8346b275bea11636423aa02ec28021c45612be93993a0073534ef`. The SDK source tree and archive contain one top-level MIT licence and no separate BLST notice or upstream version pin. Its asset history identifies only an initial addition. [Pinned SDK tree](https://github.com/shutter-network/shutter-sdk/tree/9a01a6e2b25dd310f736673ed7e4407199386dcc/src/crypto/blst), [asset addition](https://github.com/shutter-network/shutter-sdk/commit/231f6d5136bdd706c6ff5678f238aca41560e70f).

The upstream `supranational/blst` project publishes Apache-2.0. No incompatible terms were found in the inspected SDK, but the SDK evidence does not establish the exact BLST source revision or the completeness of its bundled third-party notices. Treat that as a provenance limitation for release review, not as evidence of a copyleft licence. [BLST licence](https://github.com/supranational/blst/blob/master/LICENSE).

## Reproduction

Run these in a temporary inspection directory with Node 22.22.1 selected:

```sh
npm view @shutter-network/shutter-sdk version license dist gitHead repository --json
npm pack @shutter-network/shutter-sdk@0.0.2 --json --ignore-scripts
tar -xzf shutter-network-shutter-sdk-0.0.2.tgz
cat package/package.json package/LICENSE package/dist/index.d.ts
```

The per-file gzip measurements used Python's `gzip.compress(bytes, compresslevel=9, mtime=0)`. No runtime import, crypto behavior, or complete browser build was tested in this research.
