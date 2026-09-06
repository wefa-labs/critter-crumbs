# Independent tally vector

Prepared 2026-09-05 for Technical Spec §8. This is a worked mathematical fixture, not a call to the runtime tally. The exact result-hash preimage is preserved in `packages/core/test/fixtures/tally-result-preimage.json`.

Four participants receive 100 crumbs each. Their lowercase addresses end in `1abc`, `2abc`, `3abc`, and `4abc`, zero-padded to 20 bytes. Their targets have positions 0–3 and IDs made from bytes `11`, `22`, `33`, and `44` repeated 32 times. The fourth person does not scatter but still receives crumbs.

| Scatterer | Position 0 | Position 1 | Position 2 | Position 3 |
|---|---:|---:|---:|---:|
| 1 | 0 | 30 | 30 | 40 |
| 2 | 50 | 0 | 25 | 25 |
| 3 | 20 | 40 | 0 | 40 |
| Total | 70 | 70 | 55 | 105 |

There are 300 scattered crumbs. Reducing each total over 300 gives `[7,30]`, `[7,30]`, `[11,60]`, `[7,20]`. The first two targets tie. Counted sequences are `1`, `2`, `3`; their UIDs are bytes `01`, `02`, `03` repeated 32 times. The supplied publication hash is byte `99` repeated 32 times, and the feast UUID is `00000000-0000-4000-8000-000000000001`.

Python's `json.dumps(value, sort_keys=True, separators=(',', ':'))` serialized the hand-written result preimage. The dev-only EAS dependency's ethers `keccak256(toUtf8Bytes(preimage))` produced:

```text
0xae57bad0d2e6c788dc19d3569d141209700afbd529e33d4e99b5f9719fb45e7b
```

Separately hashing the literal sorted lowercase address array with ethers produced participant hash `0x24cc7572e55798da348c9f57fb9e956316454d202033d117bb9b9a98adf64a89`. Permanent tests pin both literals against the runtime's viem implementation. Ethers is used only as an independent development reference; no dependency or network call was added.
