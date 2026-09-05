# Shutter adapters and recovery

`serverTimelock` selects `mock`, `chiado` or `mainnet` from `SHUTTER_MODE`. Real adapters use the verified `/api/time/…` routes and the published SDK. They do not open a feast merely because the registration API returned a transaction hash.

Real server configuration requires:

```dotenv
SHUTTER_MODE=chiado
SHUTTER_API_BASE=https://shutter-api.chiado.staging.shutter.network
SHUTTER_RPC_URL=https://rpc.chiadochain.net
SHUTTER_REGISTRY_ADDRESS=0x2693a4Fb363AdD4356e6b80Ac5A27fF05FeA6D9F
SHUTTER_KEY_BROADCAST_ADDRESS=0x46D286f0F3D42b726B1bdc241FA4b8b5BC881A0f
SHUTTER_REGISTRANT_ADDRESS=0xd150bbf86C686de1a25820A94c2C2397e0bC54ab
```

These Chiado values were checked through public reads; they are configuration reference, not authorization to run a live feast. `SHUTTER_API_KEY` is optional for the documented anonymous tier and remains server-only when set. The project account owns the key/plan decision. No registration or transaction was sent during this work.

Mainnet expects chain ID 100; Chiado expects 10200. The RPC chain is checked before registration. An API origin override must be an HTTPS origin without embedded credentials, query, fragment or extra path. The RPC URL may contain provider credentials; it remains in server configuration and is excluded from the persisted registration journal.

The [recovery research](../research/shutter-registration-recovery.md) records a mainnet discrepancy: none of the checked published key-broadcast deployments matched the API's eon-1 key. The adapter rejects a mismatch before POST. Do not infer mainnet deployment addresses from the Chiado example. The `needs-human` draft `.scratch/phase-2/needs-human/04-shutter-mainnet-deployment.md` asks the project account to confirm the active pair and registrant; GitHub Issues remains disabled.

The journal records the original prefix, identity, release seconds, deployment context and pre-submit block before the registration POST. It stores any response as a candidate. Opening requires a finalized registry record with the intended timestamp, the original eon's key, and a matching registry event. The event supplies the original transaction hash. Candidate metadata must agree with that evidence. Confirmed metadata remains immutable across retries and configuration changes.

A lost POST response remains uncertain even when the registry currently returns no entry. Retrying Open checks for confirmation without sending another registration. If no transaction was actually submitted, polling cannot prove that fact; the creator can cancel the draft and start another feast. A current encryption-parameter GET cannot replace an earlier registration's eon. Log recovery reads at most three pages of 10,000 blocks per attempt and saves its cursor for the next retry. No elapsed timeout is treated as confirmation.

`readFeastKey` uses the member-protected API first. Store/network failures can fall back to `Timelock.getKey` through a browser-configured adapter; explicit 400/401/403 responses remain errors. Browser reads always omit credentials and authorization. The server may use its configured bearer key. Waiting, unregistered identity, rate limiting, malformed data and upstream failure remain distinguishable at the adapter. The API caches the first valid key under its existing lease and preserves numeric rate-limit retry guidance.

## Fixture evidence

- `shutter-api.json` retains actual anonymous parameter and unregistered-identity responses from V2/V3. Waiting/HTTP failure variants follow the pinned handler source. The key-success parser test wraps an upstream SDK key in the documented response envelope; it is not a live time-identity release observation.
- `shutter-registration.json` retains raw, read-only Chiado RPC requests/responses for an existing unrelated registration, finalized header, registry/key getters, event and receipt. Tests simulate absent/pending/finalized transitions around this recorded success; API tests derive request-specific identity/deadline variants. No fixture was created by posting a transaction.
- `shutter-mainnet-keys.json` retains the actual mismatching public key reads from the recovery investigation. The mainnet adapter's rejection is tested against that evidence.
- `shutter-sdk.json` comes from the pinned upstream SDK test vectors. Its 52-byte SDK preimage is distinct from the time API's required 32-byte identity. The adapter keeps the 32-byte time identity contract and tests decryption with the upstream ciphertext/key pair.
- `shutter-encryption.json` pins the untouched SDK's output for an observed 32-byte Chiado API identity and fixed sigma. Both adapters reproduce it. The [SDK research](../research/shutter-sdk-crypto.md) separately cross-checks all nine upstream vectors offline.

The SDK's native Node ESM path fails on dynamic `require`; hermetic tests inject its untouched CommonJS entry. Browser code uses the ESM path and the BLST assets already served by Phase 1. Crypto calls are serialized across adapter instances because concurrent cold initialization overwrites the SDK readiness callback. A fixture-driven Node VM simulation checked the browser loader; no browser automation or live browser proof was performed in this phase.
