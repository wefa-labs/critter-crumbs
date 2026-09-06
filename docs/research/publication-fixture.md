# Close publication hash fixture

Prepared 2026-09-05. The two entries have sequences `1` and `2`, the same UID (byte `01` repeated 32 times), and attester `0x0000000000000000000000000000000000001abc`. Only sequence `2` is the latest candidate. Feast ID: `00000000-0000-4000-8000-000000000001`.

A standalone Node script constructed the keys in canonical order (`counted`, `feastId`, `published`; each entry `attester`, `seq`, `uid`) and used the dev-only SDK's ethers `keccak256(toUtf8Bytes(JSON.stringify(value)))`. It did not import the runtime's publication builder, canonical JSON, or viem hash. It produced:

```text
0x720124d4051f15d48173da943d51458b78c00853a7ee31fbf1958bb06ced5980
```

`packages/core/test/publication.test.ts` pins this independent literal, retains both equal-UID submissions, and verifies that removing the earlier entry changes the hash. A different request timestamp leaves the hash unchanged; the timestamp is separate close metadata. No network request was made.
