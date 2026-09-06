# Public result records

Core can encode and prepare an EAS result transaction. The API verifies a member's finalized Base attestation before saving the first record. Recording is optional: members decrypt and tally locally whether or not anyone posts on chain.

`encodeResult` uses Technical Spec §7's exact arrays in target position order. Use the UUID as `feastId`; the encoder hashes its canonical text to bytes32. Options use the zero address in `owners`. `prepareResultTransaction(config, data)` returns an unsigned `TxRequest` for `Account.sendTransaction`; the injected account adapter switches to its configured Base chain only when sending. It sets zero recipient, expiration, reference and value, and explicitly disables revocation. This phase does not send the request.

After a human posts, call `POST /api/feasts/:id/result-attestation` with the member session and `{ "txHash": "0x…", "attester": "0x…" }`. The attester must be that member. Configure `BASE_RPC_URL`, `EAS_CHAIN_ID`, `EAS_ADDRESS` and `EAS_RESULT_SCHEMA_UID` for the Vercel runtime. Without a result reader, the local mock API returns `err.storeUnreachable` for an otherwise eligible recording request; its lifecycle remains usable offline.

Verification binds a successful finalized receipt, canonical block, event and stored EAS attestation to the configured chain/contract/schema and authenticated attester. It checks the feast, close hash, issued crumbs, target order, owners, fixed fields, time and aggregate bounds. It does not prove that the member tallied correctly: clients compare the recorded numbers with their own tally. The server never receives allocations or decrypts.

A member's feast response includes `resultAttestation` and `aggregate`, initially null. After close, an anonymous reader of a public feast gets those same fields. Until the optional record exists, the public aggregate remains null. Private feasts expose neither field to outsiders. Ciphertexts and statements are never added to this public result response. Simultaneous posts return the first committed record; retries do not repeat RPC verification once it exists.

## Prepare schema registration

From the repository root, with Bun 1.4.2 and Node 22.22.1:

```sh
bun run register-schemas --chain 84532 > /tmp/critter-schemas-sepolia.json
bun run register-schemas --chain 8453 > /tmp/critter-schemas-base.json
```

These commands only print schema strings, deterministic UIDs, destination and calldata. They do not read a private key, call RPC, sign or send. A human checks whether each schema already exists, executes any missing registration with their chosen account on the stated chain, and supplies the returned UIDs through configuration. No live schema registration or result transaction was performed in phase 2.

The offline SDK and recorded receipt evidence is described in [EAS result research](../research/eas-result-records.md). The public Base fixture is an existing unrelated attestation; the result-specific API fixtures are clearly labelled synthetic variations.
