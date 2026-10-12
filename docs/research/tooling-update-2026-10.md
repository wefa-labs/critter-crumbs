# Tooling update review — 12 October 2026

PR #47 retains TypeScript 5.9.3 because the installed TypeScript ESLint parser rejects TypeScript 7. Node declarations stay on 22.20.1 to match the Node 22 function toolchain. The local Shutter helper retains Noble curves 1.9.1 and its reviewed API. ESLint moves to 10.12.0, within the parser/plugin’s declared peer range, and Vitest to 5.0.3.

The exact npm archives below were downloaded and their SHA-512 integrity, package manifests and own MIT licences verified. Install scripts remained disabled. React declarations belong to the separately reviewed runtime update in PR #40.

| Package | Version | Gzip bytes | Own licence SHA-256 | Archive integrity |
|---|---|---:|---|---|
| [`eslint`](https://registry.npmjs.org/eslint/10.12.0) | `10.12.0` | 628,464 | `3b6be04f862a077a4b97929dbf247299360824d9365f8603c263769303ace18c` | `sha512-npHjrHb2o4ehH3mE+YuxABR+0gyb0aVWCIolgJDArwCiHEIsonBm3ZKjel5b0U5+a+MbEvIyRCGCzD3eKKK2NA==` |
| [`vitest`](https://registry.npmjs.org/vitest/5.0.3) | `5.0.3` | 694,028 | `c8f14eea9df88b94c4710b4c476d8642e080832d7de0d861eba1337746494b4d` | `sha512-xMw97S3rjdtj5dkVat7jCsqWBpvchs3RlpQctUqwJD0KkERk40vz2fJ77lDwW/Vzh/pk18eItYAzkodhSes3jQ==` |
