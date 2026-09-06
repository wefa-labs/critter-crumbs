# Published Shutter SDK crypto execution

Verified 2026-09-05 with the installed `@shutter-network/shutter-sdk@0.0.2` and Node 22.22.1. The unchanged CommonJS distribution passes all nine upstream encryption vectors, all nine decryption vectors, and nine round-trips offline. Native Node ESM crypto initialization fails. Two concurrent first operations can also leave one promise unresolved, so the adapter needs shared initialization coordination. These are local execution results; no registration, chain write, or live crypto-time network request occurred.

## Source and independent vectors

The package's recorded npm `gitHead` is `9a01a6e2b25dd310f736673ed7e4407199386dcc`. This investigation downloaded the [test data at that exact commit](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/tests/test-data.json) and its [first-party test runner](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/tests/crypto.test.ts). Package provenance remains in [the earlier archive inspection](shutter-sdk-v1.md).

The fixture has paired cases for plaintext lengths 0, 1, 31, 32, 33, 319, 320, 321 and 9 bytes. Each encryption case supplies its expected ciphertext; its paired decryption case supplies the released key and expected plaintext. The experimental runner compares against those literals before checking the round-trip. All 27 comparisons passed with fetch, HTTP and socket entry points blocked; the network-attempt counter remained zero. Evidence: `/tmp/cc9-sdk-vectors-result.json`.

The upstream field named `epoch_id` is a **52-byte identity preimage** in all nine vectors. It is suitable for SDK verification and does not represent the current time API's 32-byte identity. Preserve the production identity validator and the distinction between generic SDK fixtures and time-registration records. The selected `encryption 2 / decryption 2` pair has plaintext `0x1c`; its complete inputs are in `/tmp/cc9-sdk-valid-vector.json`. The separate `/tmp/cc9-sdk-encrypt.json` records encryption with the previously captured Chiado eon key and a 32-byte API identity; no corresponding released key was obtained in this investigation. [Pinned generic fixtures](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/tests/test-data.json), [time-API identity evidence](shutter-api-v2-v3.md#identity-and-sdk-preimage).

## Runtime findings

| Runtime | Observed result | Integration implication |
|---|---|---|
| Node CommonJS | All recorded crypto cases pass; WASM loads from the installed distribution through filesystem reads | Hermetic tests can use `createRequire(import.meta.url)('@shutter-network/shutter-sdk')` and inject that actual published SDK at the crypto adapter seam |
| Native Node ESM | First `encryptData` fails with `Dynamic require of "fs" is not supported` | Do not depend on the ESM Node branch for offline crypto tests; importing the module alone does not prove initialization |
| Browser branch in a Node VM | Unchanged ESM, loader and WASM reproduce the selected ciphertext and plaintext through fixture-backed asset delivery | Confirms this initialization path under simulation; actual browser execution remains unverified here |

The package exports distinct `require` and `import` entries. Its generated ESM BLST chunk retains both a dynamic `fs` require and `__dirname`; the failure above occurs at the require before reaching the directory expression. The CommonJS entry resolves those names correctly. No installed or vendored bytes were modified. [Published distribution](https://registry.npmjs.org/@shutter-network/shutter-sdk/-/shutter-sdk-0.0.2.tgz).

The browser selector checks for a window/document environment, appends `/blst.js`, and uses `window.blst`; the loader locates `blst.wasm` beside the script. The repository already serves/emits these exact assets through its Vite configuration. No package install script is needed. A worker-only environment is not selected by the SDK's browser/Node branching. [Pinned initialization source](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/src/crypto/get-blst.ts), [published browser instructions](https://github.com/shutter-network/shutter-sdk#%EF%B8%8F-asset-placement-required-for-browser-usage), [existing asset integration evidence](shutter-sdk-v1.md#foundation-integration-proof).

The VM experiment supplied browser globals and returned the installed WASM bytes for the loader's asset fetch. It used no HTTP server or live network. `/tmp/cc9-sdk-browser-result.json` records the requested paths and successful comparisons. This is a **VM fixture simulation, not browser proof**; it does not establish Vite dependency optimization, actual browser CSP enforcement, or deployment behavior.

## Cold initialization concurrency

`ensureBlstInitialized` replaces `blst.onRuntimeInitialized` while `calledRun` is false. Two first encryptions reach that assignment before WASM starts; the later callback resolves only its own promise. A fresh-process `Promise.all` experiment timed out after 1,500 ms, while the sequential fixture run initialized and completed normally. [Pinned crypto implementation](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/src/crypto/crypto.ts), `/tmp/cc9-sdk-concurrent-result.json`.

Adapter implication: coordinate the first SDK operation across adapter instances, or queue SDK operations through a shared module. Sharing the import promise alone is insufficient because the SDK starts BLST initialization during the crypto call. This coordination can surround the published interface without changing its files or relaxing identity validation.

## Reproduction artifacts

Run from the repository root with Node 22.22.1:

```sh
node /tmp/cc9-sdk-probe.cjs vectors
node /tmp/cc9-sdk-probe.cjs esm
node /tmp/cc9-sdk-probe.cjs concurrent
node /tmp/cc9-sdk-browser-probe.cjs
```

The `esm` and `concurrent` probes intentionally exit unsuccessfully and record the observed failures. Their results are `/tmp/cc9-sdk-esm-result.json` and `/tmp/cc9-sdk-concurrent-result.json`. The pinned source downloads are `/tmp/cc9-upstream-test-data.json`, `/tmp/cc9-upstream-crypto.test.ts`, `/tmp/cc9-upstream-get-blst.ts`, and `/tmp/cc9-upstream-crypto.ts`.

SHA-256 of the raw test-data file: `ce0fa674033bc0895ebb4225d8ecea6824e6de9f37c698e43586a314d6544ad4`. The installed loader and WASM hashes still match Phase 1: `89720e240ed9c1d398c3c872fc0b15972d36a86c0b8d18877374a478a7d0707b` and `6484fc663fd8346b275bea11636423aa02ec28021c45612be93993a0073534ef` respectively. Temporary artifacts support this investigation; copy any adopted fixtures into the repository with their pinned provenance before relying on them in lasting tests.
