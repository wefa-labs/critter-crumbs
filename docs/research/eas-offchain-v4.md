# EAS off-chain v2: V4 verification

Checked 2026-09-05 with Node 22.22.1, `@ethereum-attestation-service/eas-sdk@2.10.0` and `viem@2.56.0`. **V4 passes:** the §7 typed fields and explicitly configured domain version `0.26` produce the same UID and deterministic signature in viem and the SDK on both configured chains. Ballot and result schema encodings also agree. No chain call or registration was made.

## Exact release and sources

The [npm version manifest](https://registry.npmjs.org/@ethereum-attestation-service/eas-sdk/2.10.0) was fetched directly. Version `2.10.0` is available, with published source revision `9ebc43fc0345679c8a521a1f497592015b9deb17` and [archive](https://registry.npmjs.org/@ethereum-attestation-service/eas-sdk/-/eas-sdk-2.10.0.tgz) integrity:

```text
sha512-tR59kzhJakmAEc7idBYvpJPjjSGKHU4h9G7Mx6OrC1/sffOnOdtOjdnLg5/N4BMAqnDI/g4wXLR/ZZWbhCVyUQ==
```

The installed phase-1 copy under `/private/tmp/critter-crumbs-foundation-59aed86/node_modules` supplied the executable SDK and viem. Its manifests report those exact versions. The SDK's public CommonJS entry works with `createRequire`; this preserves the existing phase-1 decision and keeps ethers confined to development. The following published files were inspected: `offchain/offchain.js`, `offchain/typed-data-handler.js`, `schema-encoder.js`, `schema-registry.js`, and `eas.js`, all under `dist/lib.commonjs` in that archive. The [official off-chain source](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/offchain/offchain.ts) and [typed-data verifier source](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/offchain/typed-data-handler.ts) expose the same relevant logic; use the pinned archive, not the moving branch, for the cross-check contract.

## UID and signing contract

The exact v2 UID is the Keccak-256 hash of Solidity **packed** encoding with these types and values, in this order. This is the published SDK's `Offchain.getOffchainUID` algorithm:

```text
types:
  uint16, bytes, address, address, uint64, uint64,
  bool, bytes32, bytes, bytes32, uint32
values:
  2, UTF8(schemaUid), recipient, ZERO_ADDRESS, time, expirationTime,
  revocable, refUID, data, salt, 0
```

`UTF8(schemaUid)` means the 66 ASCII bytes of the hex string including `0x`; it is not the decoded 32 bytes. The zero address is an attester placeholder; the actual signer and EIP-712 domain are absent from the UID. The final zero occupies four bytes. Normalize configured schema UIDs to lowercase before use so equivalent hex spelling cannot change a UID. Signatures still bind the signer and domain. [Published SDK archive](https://registry.npmjs.org/@ethereum-attestation-service/eas-sdk/-/eas-sdk-2.10.0.tgz)

The primary type is `Attest`. The §7 ordered fields are correct: `version:uint16`, `schema:bytes32`, `recipient:address`, `time:uint64`, `expirationTime:uint64`, `revocable:bool`, `refUID:bytes32`, `data:bytes`, `salt:bytes32`. Fix the message version at `2`. The SDK creates a random 32-byte salt only when none is supplied; a cross-check must supply the same fixed salt to both implementations. [Official off-chain source](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/offchain/offchain.ts)

Keep the spec's domain explicit: `name = 'EAS Attestation'`, `version = '0.26'`, the configured chain ID (`8453` or `84532`), and configured EAS address. Off-chain protocol version `2` does not select a domain version. Construct `Offchain(config, OffchainAttestationVersion.Version2, new EAS(address))` directly for the offline reference. Calling `EAS.getOffchain()` instead obtains the deployed contract version and chain ID through its provider; that is a different operation. This research does not assert the current Base deployment reports `0.26`. [SDK EAS implementation](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/eas.ts)

The application verifier must enforce the complete expected domain itself. The SDK's `verifyOffchainAttestationSignature` deliberately calls its underlying verifier with `strict = false`, which accepts the signed object's domain version instead of requiring the configured version. The probe confirmed that an attestation signed with domain version `1.0.0` is accepted by an SDK verifier configured for `0.26`. This compatibility behavior must not relax the application's pinned contract. [SDK typed-data verifier](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/offchain/typed-data-handler.ts)

## Schema and experiment evidence

For these flat schemas, viem `encodeAbiParameters(parseAbiParameters(schema), values)` exactly matches `SchemaEncoder.encodeData`. Schema UID derivation is `keccak256(encodePacked(['string', 'address', 'bool'], [schema, resolver, revocable]))`. The exact schema string, including whitespace, affects the schema UID. Registration therefore needs one literal reused by encoding, UID calculation and the registration script. This probe used zero resolver and `revocable = false`; it did not register either schema. [SDK schema encoder](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/schema-encoder.ts), [SDK schema registry](https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/schema-registry.ts)

The isolated verification probe is `/private/tmp/critter-eas-v4-probe.cjs`, run with `/Users/afo/.local/share/mise/installs/node/22.22.1/bin/node`. It uses the publicly known local test key whose integer value is `1`, an ethers signer through the dev SDK tree, and a separately created viem local account. Neither has a provider. It checks both ABI encodings, both schema UIDs, exact signatures, exact off-chain UIDs, viem verification, and SDK verification of the viem-produced signature. This was a research experiment; the permanent seam tests still need implementation.

Fixed vector inputs:

```text
feast UUID: 00000000-0000-4000-8000-000000000001
encoded feast ID: keccak256(UTF8(feast UUID))
shutterIdentity: 0x followed by 22 repeated 32 times
ciphertext: 0x1234abcd
payloadVersion: 1
time: 1788566400 seconds
expirationTime: 0
recipient: zero address
refUID: zero bytes32
revocable: false
salt: 0x followed by 66 repeated 32 times
```

Schema literals and measured outputs:

```text
bytes32 feastId, bytes32 shutterIdentity, bytes ciphertext, uint32 payloadVersion
ballot schema UID:
0xb8e0cf5878dabf520b1e519ec026c9cc609c6feb255829ada0b6525f9b6ca236

bytes32 feastId, bytes32 publishedSetHash, uint32 crumbsIssued, uint16 scatterers, bytes32[] targetIds, address[] owners, uint32[] crumbs
result schema UID:
0xdff4a02942abf463bbde39bbbab88a243027411763cd63d34ccfc59864614c8f

feast ID:
0x27df9e4f396b049a38fecd6237c650c5df3f372785585cd7ced3fae81d61e5cd
ballot ABI: 192 bytes
UID packed preimage: 385 bytes
UID on both chains:
0x0743b0d2869abe3212b0594be14fcf17988ca712b411989e4c6f149e24e8df24

Base signature:
0xe98e892f8acd99ec2b19febfbdea73544c6bdfa98ae79470e2f957b66ee5662540dccc8d142e56e9f294dbe1dfd2792cae62ba80e9405bec1bfa88e7d292ae4a1b
Base Sepolia signature:
0x6d4eb9916b27ce6110adfc28607671ce3d03cf2f2f720ce251eeb2e7b81a965406f009d7b057f7f4e99398234cee7b4532e66f62b73074f074f414e8708bd0e31c
```

The result-encoding probe used this ordered vector: the same feast ID, published set hash `0x` plus `33` repeated 32 times, `crumbsIssued = 100`, `scatterers = 1`, target IDs `0x` plus `44`/`55` repeated 32 times, owners `[testAccount.address, zeroAddress]`, and crumbs `[0, 100]`. Both encoders produced the same 512-byte value.

## Decisions needed before dependent code

These are proposed local contract clarifications, derived from the spec rather than rules supplied by EAS:

- **Time units:** §4 uses milliseconds while EAS timestamps represent seconds. Build the attestation with `BigInt(Math.floor(now / 1000))`; compare its time with the injected server time in the same unit, within ±300 seconds. JSON transport must serialize big integers deliberately; no raw `bigint` reaches `JSON.stringify`.
- **Feast identity:** the database uses UUIDs while both schemas use `bytes32`. Specify `keccak256(UTF8(canonical lowercase UUID))` as the single encoding. The vector above uses this proposal; the UUID remains unchanged inside the encrypted payload.
- **Tally input:** add `publishedSetHash` and each ballot's `uid` to `TallyInput`; §8's result hash cannot be constructed from the listed fields. Make the counted UID order explicit, preferably increasing accepted `seq`, while normalizing participant addresses and target position order. Return the UID alongside each counted ballot so callers need not recover it through a second lookup.
- **Set hashes:** specify `participantSetHash = keccak256(UTF8(canonicalJSON(sorted lowercase participant addresses)))`. Specify the close record's `publishedSetHash` over the exact immutable ordered publication, including every `{seq, uid, attester}` and each latest counted candidate; this binds the accepted order used to decide the result. The payload checks this independently calculated participant hash. The spec names both hashes without defining their preimages.
- **Exact retry — resolved:** §3 makes `uid` unique, but §15 E3 says resubmitting the same signed object receives a new `seq`. The [2026-09-05 decision](../decisions.md) preserves E3: every accepted retry gets a new server sequence, UID lookup is non-unique, and the immutable publication binds sequence, attester and UID. The research's initial suggestion to return an existing sequence was rejected. Verify every signed object independently; UID alone cannot establish ownership because its preimage excludes the signer and domain.
- **Schema registration:** freeze the exact strings shown above, zero resolver, and non-revocable schemas before generating local config or writing the registration script. Public chain registration remains a separate human action.

None of these findings requires violating AGENTS.md. V4 has no unresolved compatibility blocker; the remaining work is to record accepted clarifications and preserve the successful comparisons as permanent, offline seam tests.
