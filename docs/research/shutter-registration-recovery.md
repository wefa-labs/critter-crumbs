# Shutter registration confirmation and recovery

Checked 2026-09-05. A concrete recovery path exists through read-only chain calls: recover the original eon and deadline from `ShutterRegistry.registrations(identity)`, recover the original eon key from `KeyBroadcastContract.getEonKey(eon)`, and recover publication metadata from the registry event. The time API has no registration-record endpoint. **Chiado's published deployment was cross-checked successfully; the active mainnet deployment addresses remain unresolved.**

This note extends [V2/V3](shutter-api-v2-v3.md). It uses the API revision `a1755713419611ae2743e8c7cb7f6e69c86681f2`, contracts revision `7e53b1579b04de3030e30065699540964d95e603`, and first-party deployment assets revision `300713e8f8a54807df639523cb56ff81d67ef556`. Only public source downloads, public parameter GETs, and read-only JSON-RPC calls were made. No identity was registered, no account was created, and no transaction was signed or submitted. No credential or key material appears here.

## What the time API can establish

The router exposes only registration, current encryption parameters, and decryption-key lookup for time-based identities. `GET /api/time/get_data_for_encryption?address=…&identityPrefix=…` computes an identity for the supplied address and looks up the current eon. It does not inspect an existing registration. `GET /api/time/get_decryption_key?identity=…` reads the registry, but before release returns only an error description; it does not return the registered eon or deadline. Neither GET recovers the original registration body. [Pinned router](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/router/router.go), [API use case](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/usecase/crypto.go)

A successful registration POST returns after submission, before receipt confirmation. Its submission context intentionally survives cancellation of the HTTP request, bounded by an internal timeout. Therefore a lost HTTP response or timeout does not establish that nothing was sent. A duplicate registration already visible on chain returns HTTP 400 instead of the original metadata. [Registration and submission implementation](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/internal/usecase/crypto.go#L153-L181)

## Exact chain interface

The minimal ABI is:

```solidity
// ShutterRegistry
function registrations(bytes32 identity)
    external view returns (uint64 eon, uint64 timestamp);
event IdentityRegistered(
    uint64 eon,
    bytes32 identityPrefix,
    address sender,
    uint64 timestamp
);

// KeyBroadcastContract
function getEonKey(uint64 eon) external view returns (bytes);
```

**No event parameter is indexed.** Filter `eth_getLogs` by the registry address and event topic, then decode and match `identityPrefix`, `sender`, `eon`, and `timestamp` locally. The event signature is `IdentityRegistered(uint64,bytes32,address,uint64)`, with topic:

```text
0xa254e5a8078a79959db8c7203cbd84a28d6e1b9750d0c4fd743a1a069c21b05b
```

`registrations(bytes32)` has selector `0xda7c6a42` and returns two ABI words. An unregistered identity returns `(0, 0)`; use `timestamp == 0` as the absence marker, since eon zero alone is not sufficient. The identity is `keccak256(identityPrefixBytes32 || senderBytes20)`. The contract permits one successful registration for that identity and exposes no mutation or deletion method. [Pinned registry source](https://github.com/shutter-network/contracts/blob/7e53b1579b04de3030e30065699540964d95e603/src/shutter-service/ShutterRegistry.sol)

`getEonKey(uint64)` has selector `0x8a0b8b28` and returns ABI-encoded dynamic bytes. An unpublished eon returns empty bytes; an already published nonempty key cannot be overwritten. Decode the dynamic bytes, require the observed 96-byte format, and compare it with the API key. Registration trusts the configured finalized key broadcast for the public key; it does not independently validate the BLS point. The SDK validates the point when encrypting. Recorded keys also pass the SDK encryption fixtures. Recover using the registry's eon, even if the current eon has advanced. The current `KeyperSetManager` is unnecessary for recovery. [Key broadcast source](https://github.com/shutter-network/contracts/blob/7e53b1579b04de3030e30065699540964d95e603/src/common/KeyBroadcastContract.sol), [published interface](https://github.com/shutter-network/contracts/blob/7e53b1579b04de3030e30065699540964d95e603/src/common/intf/IKeyBroadcastContract.sol)

## Verified Chiado deployment

| Input | Value |
|---|---|
| Chain ID | `10200` (`0x27d8`) |
| Public read RPC | `https://rpc.chiadochain.net` |
| Time registry | `0x2693a4Fb363AdD4356e6b80Ac5A27fF05FeA6D9F` |
| Key broadcast | `0x46D286f0F3D42b726B1bdc241FA4b8b5BC881A0f` |
| API registrant | `0xd150bbf86C686de1a25820A94c2C2397e0bC54ab` |
| Published keyper sync-start block | `14157019` |

The registry/key-broadcast pair and sync start come from the [Chiado time-service deployment assets](https://github.com/shutter-network/shutter-keyper-assets/blob/300713e8f8a54807df639523cb56ff81d67ef556/shutter-api-chiado-102000/variables.env). The registrant comes from the [API's pinned prerequisites](https://github.com/shutter-network/shutter-api/blob/a1755713419611ae2743e8c7cb7f6e69c86681f2/README.md#prerequisites). Chain ID and RPC are listed in the [Gnosis network documentation](https://docs.gnosischain.com/about/networks/chiado). The sync-start value is a published scanning hint, not a verified contract-creation block.

Read-only probes confirmed the chain ID, successful `finalized` block queries, `(0, 0)` for the zero identity, and a 96-byte `getEonKey(16)` value identical to the previously recorded Chiado API encryption-parameter response. One bounded 10,001-block log query returned 443 historical registration events with exactly one topic each, confirming the non-indexed ABI. The latest returned event used the documented API registrant and eon 16. No complete historical receipt/recovery sequence was run; these observations establish the getters, matching key source and event shape, not a newly created feast.

## Safe recovery procedure

The following is the implementation implication of the verified interfaces, not an additional upstream endpoint.

1. **Persist before attempting the POST.** Store the identity prefix, intended `ceil(scatteringEndsAt / 1000)` timestamp, mode, chain ID, RPC/deployment identity, registry, key-broadcast address and expected API registrant. Also record a block number obtained before submission as the log-search lower bound. Derive and retain the expected identity. Configuration changes must not rewrite an interrupted attempt's chain context.
2. **Retain any response.** Persist the returned identity, eon, eon key and submitted transaction hash when available. Check identity/prefix against the attempt. A response is a candidate registration, not proof that gathering may open.
3. **Read a consistent chain view.** Query the registered identity at an explicit block. A nonzero timestamp must equal the original intended timestamp. Read the key for that stored eon at the same block, or a later confirmed block if necessary. When POST metadata exists, compare its identity, eon and key with the confirmed metadata; disagreement must keep the feast a draft and produce a recoverable configuration/registration error. Do not substitute current encryption parameters.
4. **Recover a lost response.** When the registry contains the expected identity and timestamp, its stored eon plus `getEonKey(eon)` reconstructs the necessary encryption material. Scan logs from the persisted lower bound through the checked block, in bounded pages, and match the original prefix and registrant. A matching event supplies the original transaction hash, block number/hash and log index. Validate its eon/timestamp against the getter. Missing or contradictory evidence is not success.
5. **Apply a declared finality policy.** Chiado and Gnosis public RPC probes accepted `finalized`. Use a finalized anchor when opening after confirmation; a latest-block event alone remains susceptible to reorganization. Retain the confirmed block hash. When a submitted hash is known, a successful receipt must contain the expected registry event; a reverted receipt does not establish registration success. No arbitrary elapsed timeout proves finality. [JSON-RPC block, receipt and log semantics](https://ethereum.org/en/developers/docs/apis/json-rpc/)
6. **Keep uncertainty explicit.** A zero registry record means “not registered at this block.” It does not distinguish a request never sent, pending submission, dropped submission, or unknown replacement. Even a null receipt is not proof of absence. With no hash, portable JSON-RPC has no lookup by request/prefix in every node's pending pool. Continue bounded polling and retain the draft. Any subsequent retry must reuse the original prefix and deadline, recover first, and regard the eventual confirmed registration as authoritative; it must never silently create a new identity or claim the lost request failed. Late or mismatched registration needs an explicit failure path, not adjusted deadlines.

The API may continue processing a cancelled HTTP request, and its signing account is shared by unrelated clients. Its account nonce therefore cannot reliably identify which request is ours. Receipt/event recovery should use the persisted identity context, not guesses about the API account's transaction count.

## Configuration additions and unresolved mainnet metadata

Add named server-side configuration for `SHUTTER_RPC_URL`, `SHUTTER_CHAIN_ID` (or derive the expected value from mode), `SHUTTER_REGISTRY_ADDRESS`, `SHUTTER_KEY_BROADCAST_ADDRESS`, and `SHUTTER_REGISTRANT_ADDRESS`. Mode may provide reviewed defaults, but real-mode startup must verify the RPC chain. Persist the chosen deployment context per attempt; it is non-secret metadata. A configurable historical scan lower bound is useful only for attempts lacking a stored pre-submit block. The RPC needs `eth_chainId`, `eth_call`, `eth_getBlockByNumber`, `eth_getLogs`, and receipt lookup. These reads need no funded signing account or new runtime dependency.

**Do not infer the active mainnet pair from the API README.** The published assets have three Gnosis time-service instances:

| Instance | Registry | Key broadcast | Published sync start |
|---|---|---|---:|
| `1000` | `0x694e5de9345d39C148DA90e6939A3fd2142267D9` | `0x474079EFa5D93bb48a1cA27Ebbf46d32E273A28b` | 36069239 |
| `1001` | `0x18Ed30B56362C857FbC2A83c5cFe2F31b6f7DE32` | `0x8Eb81d90089dE2F2d9CA3582c780beA978dd44C7` | 42876800 |
| `1002` | `0x6dB13B149C29A6488AeC991673F04193603640aa` | `0x70bD6A075e8664c9c7Cd15d29Ac6C35dA7D0e41b` | 44487428 |

Sources: [instance 1000](https://github.com/shutter-network/shutter-keyper-assets/blob/300713e8f8a54807df639523cb56ff81d67ef556/shutter-api-gnosis-1000/variables.env), [instance 1001](https://github.com/shutter-network/shutter-keyper-assets/blob/300713e8f8a54807df639523cb56ff81d67ef556/shutter-api-gnosis-1001/variables.env), [instance 1002](https://github.com/shutter-network/shutter-keyper-assets/blob/300713e8f8a54807df639523cb56ff81d67ef556/shutter-api-gnosis-1002/variables.env). The assets commit was confirmed as the repository's latest commit during this research.

At chain ID 100 on `https://rpc.gnosischain.com`, eon 1 returned a nonempty key from instances 1000 and 1002 and an empty key from 1001. **Neither nonempty key matched the mainnet API's current eon-1 encryption key**, which matched the earlier V2 fixture. The API README names the instance-1000 registry, but that does not resolve the mismatch. No active mainnet address is established by these observations. The project's human follow-up must confirm the API's actual chain, registry, key-broadcast contract and registrant before live mainnet use. Real adapters can be fixture-tested against explicit deployment inputs and must fail closed on this mismatch.

The generic recovery design is implementable. Remaining limits are deployment identification for mainnet, provider log/history access, the chosen confirmation policy, and the unavoidable ambiguity of a lost pending request. These limits do not justify pretending an unconfirmed feast has opened.
