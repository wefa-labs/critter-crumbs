# Shutter API V2 and V3 verification

Verified 2026-09-05 against the public API implementation at commit `a1755713419611ae2743e8c7cb7f6e69c86681f2`, the published SDK source used in Phase 1, both deployed Swagger documents, and read-only HTTP probes. No identity was registered, no transaction was sent, no account was created, and no API key was supplied.

**V2 supports the existing server-registration design with corrections to the HTTP shapes.** Requests use `/api/time/…`; successful responses have a `message` envelope; encryption-parameter lookup requires the registrant's address. The returned identity is the SDK's identity preimage. Chiado access is documented as free and unlimited; mainnet has an anonymous tier and two key tiers. The API's own signer pays registration gas. The project account's key, commercial terms, and choice of plan remain a `needs-human` follow-up under T14. [Pinned API implementation](https://github.com/shutter-network/shutter-api/tree/a1755713419611ae2743e8c7cb7f6e69c86681f2), [rate policy](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/apikeys/limits.yaml).

**V3 permits the browser fallback as an anonymous, credential-free GET.** Both deployments returned `Access-Control-Allow-Origin: *` for the requested application origin. This verifies the transport prerequisite; it does not prove a complete live feast or key release.

## HTTP interface

Use these origins with the paths below:

| Mode | Origin | Documented API registrant |
|---|---|---|
| `chiado` | `https://shutter-api.chiado.staging.shutter.network` | `0xd150bbf86C686de1a25820A94c2C2397e0bC54ab` |
| `mainnet` | `https://shutter-api.shutter.network` | `0x228DefCF37Da29475F0EE2B9E4dfAeDc3b0746bc` |

These addresses agree between the pinned README and both deployed Swagger documents observed today. Older indexed documentation shows a different Chiado registrant (`0xb9C303443c9af84777e60D5C987AbF0c43844918`). Do not derive a registered feast's identity from an old address; retain the identity returned at registration. The parameter GET computes an identity for the supplied address and does not attest that it is the deployment's active signer. [Pinned prerequisites](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/README.md#prerequisites), [Chiado deployed Swagger](https://shutter-api.chiado.staging.shutter.network/docs/doc.json), [mainnet deployed Swagger](https://shutter-api.shutter.network/docs/doc.json).

| Request | Inputs | Successful JSON body |
|---|---|---|
| `POST /api/time/register_identity` | JSON `{ decryptionTimestamp: number, identityPrefix: Hex }` | `{ message: { eon, identity, identity_prefix, eon_key, tx_hash } }` |
| `GET /api/time/get_data_for_encryption` | Required query `address`; optional query `identityPrefix` | `{ message: { eon, identity, identity_prefix, eon_key, epoch_id } }` |
| `GET /api/time/get_decryption_key` | Required query `identity` | `{ message: { decryption_key, identity, decryption_timestamp } }` |

The path definitions and `message` envelopes come from the router and handlers. Swagger's success schemas and README examples omit that envelope; the live encryption reads below confirm the handler shape. The API accepts omitted prefixes by generating one, but Critter Crumbs must always supply its persisted prefix so retries refer to the same feast identity. `decryptionTimestamp` is an integer Unix timestamp in **seconds**, represented as `uint64` in the server; Critter Crumbs' `serverNow` remains milliseconds. The API validates a supplied prefix as 32 bytes. [Router](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/router/router.go), [request and response handlers](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/service/crypto.go), [registration and parameter validation](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/usecase/crypto.go).

Upstream errors use `{ description, statusCode, metadata? }`, not Critter Crumbs copy IDs. The adapter must translate them. Before the release timestamp, `get_decryption_key` returns HTTP 400 with description `timestamp not reached yet, decryption key requested too early`; an unregistered identity is also HTTP 400, with a different description. An absent released key can return 404; an external keyper failure can return 500. Therefore, treating every 400 as “waiting for release” would hide configuration errors. Rate limiting can occur before the Go handler. [Key lookup implementation](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/usecase/crypto.go#L181-L285), [rate enforcement](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/apikeys/README.md).

## Identity and SDK preimage

For a time-based registration:

```text
identity = keccak256(identityPrefixBytes32 || registrantAddressBytes20)
```

The concatenation uses raw bytes, not ASCII hex or padded ABI words. The API uses its signing account as `registrant`; the registry contract uses `msg.sender`. The two implementations agree. [API identity helper](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/common/utils.go), [registry contract at inspected revision](https://github.com/shutter-network/contracts/blob/7e53b1579b04de3030e30065699540964d95e603/src/shutter-service/ShutterRegistry.sol#L63-L84).

Pass the returned **32-byte `identity`** as `identityPreimageHex` to the SDK. Do not pass the prefix, the concatenation above, or the 48-byte `epoch_id`. The SDK derives its curve point from that preimage internally. Phase 1 already established the actual argument order:

```ts
encryptData(messageHex, identityHex, eonKeyHex, sigmaHex)
decrypt(ciphertextHex, decryptionKeyHex)
```

Keep the `0x` prefix for the SDK, despite the Swagger prose suggesting removal for some clients. The published SDK consumes hex with viem's `hexToBytes`. The live encryption reads contain 96-byte eon keys and 48-byte epoch IDs; README's shortened examples must not become byte-length assumptions in validators. [Pinned SDK cryptography source](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/src/crypto/crypto.ts), [Phase 1 SDK evidence](./shutter-sdk-v1.md).

## Access, rate limits, and gas

The pinned README documents no Chiado limits, free API access, and anonymous mainnet access. Bearer keys grant higher limits. The policy distinguishes counters by remote IP for anonymous requests and by the `Authorization` header for recognized keys. Its window is one day; the README describes it as rolling 24 hours. [Current access documentation](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/README.md#rate-limits--authorization), [exact counter policy](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/apikeys/limits.yaml).

| Mainnet endpoint | Anonymous, per IP/day | Standard, per key/day | Premium, per key/day |
|---|---:|---:|---:|
| `/time/register_identity` | 5 | 500 | 2,500 |
| `/time/get_data_for_encryption` | 10 | 1,000 | 5,000 |
| `/time/get_decryption_key` | 20 | 2,000 | 10,000 |

The source policy explicitly identifies registration as spending the API signer's gas, and the registration implementation signs and submits the registry call using its configured key. There is no request field for a user's signature, funded account, payment, or gas selection. These facts support T3 without adding a server-held xDAI account. The source does not establish the future price, support agreement, or contractual gas guarantee for either key tier. Those questions belong to Afolabi under T14; no contact was made. [Gas and tier policy](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/apikeys/limits.yaml), [registration submission](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/usecase/crypto.go#L553-L588).

The live reads below confirm anonymous read access. Registration access, account funding, successful mining, and actual throttling were **not live-tested**. No quota was deliberately exhausted. The table is source evidence, not a measurement of deployment enforcement. Preserve the server's shared key cache; browser fallback requests use the anonymous quota and must never expose `SHUTTER_API_KEY`.

## Registration retry and confirmation

A registration response contains a submitted transaction hash. The API returns without waiting for a receipt. A second registration after the first is recorded returns HTTP 400 (`identity already registered`), rather than returning the original record. A repeated request while the original is pending is not documented as idempotent. [Registration implementation](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/usecase/crypto.go#L529-L588).

**Implementation implication:** record the prefix before the external call and persist returned identity, eon, eon key and transaction hash. A timeout or duplicate response cannot be converted blindly into successful feast opening. Recovery must establish the actual registration and its timestamp/eon; a fresh encryption-parameter read uses the current eon and is not proof of the original registration. These corrections fit a decisions line and a recoverable registration implementation; they do not invalidate the `Timelock` seam. Confirmation and recovery should have recorded-fixture tests before enabling a live rehearsal.

## Read-only observations and fixtures

At `2026-09-05 18:28:13 UTC`, both origins returned:

| Probe | Result |
|---|---|
| `GET /docs/doc.json`, no key | HTTP 200; `/api` base path and `/time/…` routes |
| `OPTIONS /api/time/get_decryption_key`, `Origin: https://crittercrumbs.app`, requested method `GET` | HTTP 204; `Access-Control-Allow-Origin: *`; methods `GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS`; allowed headers `Origin,Content-Length,Content-Type`; max age `43200` |
| `GET /api/time/get_decryption_key?identity=0x` followed by 64 zeroes, same origin | HTTP 400; `Access-Control-Allow-Origin: *`; body `{"description":"identity has not been registerd yet","statusCode":400}` |

At `2026-09-05 18:28:48 UTC`, the following GET succeeded on each origin, with the corresponding address from the first table, no key, and `Origin: https://crittercrumbs.app`:

```text
/api/time/get_data_for_encryption?address=<documented API address>&identityPrefix=0x1111111111111111111111111111111111111111111111111111111111111111
```

Both responses were HTTP 200 and carried `Access-Control-Allow-Origin: *`. These are actual bodies, suitable for encryption-parameter fixtures; they do not represent registered identities.

Chiado:

```json
{"message":{"eon":16,"identity":"0x21ce629a6d93c0a596ca7673449d8b1657141a5ae78979b880a953d871c84e25","identity_prefix":"0x1111111111111111111111111111111111111111111111111111111111111111","eon_key":"0x8675347b53e2b1f0941b7ea6f0f89f6d3118deaf7452fd90a9d17fa6b4469d80895ba035420c2e19b7c5a95788ed23670dda180842f56c49690e8114a3bfd56d2b0d5e9e89568442902464fb2e44176629c0abea9d18d3142913ba607b0c6b7c","epoch_id":"0xab25439ea0b7221bd7e3da9855c35e8a22e2ba80c293be3dd633f6b36f2fd0796a0fbf66e8c51838500dfc17a6d7228f"}}
```

Mainnet:

```json
{"message":{"eon":1,"identity":"0xad39b2987fd19875ceb20a43198cc41a1dcc3c9f36e693746dd44e60c5980ea1","identity_prefix":"0x1111111111111111111111111111111111111111111111111111111111111111","eon_key":"0xa4ce51d427803fa4744c3ca8bfa9576083537ba7a22311ea58c8762b362a022a5ff0b0e3b5daf61584bfede16cedc7c80a4c422da7e5ac3179e280a3277ac5c20138d94ef3cbfbdb713c8ee235242e802f6363b93c0932a8127598f03279fc4b","epoch_id":"0xb684d0f3308e22aa52ae048b9850d97a165dc3273c9d1c269901a44ad495b8ae9adfec03c7777436c6c8af3d13f24dc8"}}
```

The router applies `cors.Default()` before handlers, consistent with these observations. `Authorization` was absent from the allowed headers, and credentials were not enabled. The application fallback should issue a plain GET with `credentials: 'omit'`, use a previously retained identity, send no bearer key, and keep the configured Shutter origin in CSP `connect-src`. No browser automation was run, and the probes did not establish CORS headers on proxy-generated HTTP 429 responses. [CORS setup](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/router/router.go#L29-L36).

## Decisions and remaining human work

Record decisions before dependent code for the `/api/time/…` routes and `message` envelope; explicit seconds conversion; required registrant address for parameter lookup; returned identity as the SDK preimage; anonymous credential-free fallback; and submitted-versus-confirmed registration recovery. Keep registration response data as the feast's encryption source instead of refreshing its eon later.

V2's technical questions are answered by source and read-only evidence within the limits above. Its plan/account question remains open: the project account obtains or confirms its Standard key and commercial/gas terms, and the reviewer supplies the Chiado environment before any live feast. V3's CORS prerequisite passes for the anonymous fallback. Phase 2 can implement and test both real adapters hermetically; successful registration and release remain a live follow-up. No spec-invalidating blocker was found.
