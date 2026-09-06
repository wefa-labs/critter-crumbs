# Complete scatter capacity at payload v1

Verified 2026-09-05 with Node 22.22.1 and the installed `@shutter-network/shutter-sdk@0.0.2`. **49 targets is the largest uniform feast limit that admits every valid complete scatter for all allowed handfuls of 10–1,000 crumbs under the 4,096-byte ciphertext limit.** The maximum at 49 targets is 3,868 plaintext bytes and 4,001 Shutter ciphertext bytes. A valid 50-target scatter needs 4,097 ciphertext bytes and cannot be submitted.

This result preserves the complete allocation and existing ciphertext limit in [Technical Spec §6–§7](../04-technical-spec.md#6-shutter-integration). It applies to the exact v1 field set, fixed-width hexadecimal identifiers and canonical JSON encoding implemented by [the payload parser](../../packages/shared/src/validate.ts) and [canonicalJSON](../../packages/shared/src/canonical.ts). Changing those fields or the encryption version requires recalculating the limit.

## Why every valid allocation fits at 49

All payload characters are ASCII. The nonempty canonical payload has byte length

```text
P = 237 + 72N + sum(decimalDigits(amount[i]))
  = 237 + 73N + extraDigits
```

Here `N` is the target count, zero has one digit, every target appears once, amounts are nonnegative integers, and their sum is at most 1,000. The all-zero 49-target representation is therefore 3,814 bytes. To add a decimal digit to an amount, the cheapest successive thresholds cost 10 crumbs (`0 → 10`), 90 more (`10 → 100`), then 900 more (`100 → 1000`). Choosing the cheapest thresholds first satisfies their prerequisites and minimizes the crumbs required for any given number of extra digits.

At 49 targets, 54 extra digits cost at least `49×10 + 5×90 = 940` crumbs. A 55th would cost at least `49×10 + 6×90 = 1030`, beyond the allowed handful. Thus `P ≤ 3814 + 54 = 3868`. The bound is attained by amounts `[160, 100, 100, 100, 100, ...44 entries of 10]`, totaling 1,000. Any smaller target set can be padded with zero entries to 49 for this bound; any smaller handful has no more available digit thresholds. This proves the limit for every valid allocation, including zeros, rather than testing only an evenly distributed sample.

With 50 targets, `[150, 100, 100, 100, 100, ...45 entries of 10]` is valid and totals 1,000. Its 55 extra digits produce `237 + 73×50 + 55 = 3942` bytes. In people feasts, the required self-zero lowers the exact maxima to 3,867 bytes at 49 and 3,941 at 50; the Shutter ciphertext lengths remain the same after padding. The option bound therefore safely covers both feast kinds.

## Encryption overhead

The SDK's pinned source pads plaintext to 32-byte blocks, **always adding at least one byte**, including a full block when already aligned. Its encoded envelope adds one version byte, a 96-byte `c1` and a 32-byte `c2`. Therefore:

```text
Shutter(P) = 129 + 32 × (floor(P / 32) + 1)
```

For a 4,096-byte cap, the largest admitted plaintext is 3,935 bytes: it encrypts to 4,065 bytes. The next byte produces 4,097. The source at npm's pinned `gitHead` was fetched again and checked against the installed distribution; no SDK files were changed. [Pinned encryption and encoding source](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/src/crypto/crypto.ts#L51-L94), [padding source](https://github.com/shutter-network/shutter-sdk/blob/9a01a6e2b25dd310f736673ed7e4407199386dcc/src/crypto/crypto.ts#L227-L237), [package provenance](shutter-sdk-v1.md).

The mock prepends a 12-byte IV to Web Crypto AES-GCM output. With no `tagLength` supplied, Web Crypto uses a 128-bit tag, so `Mock(P) = P + 28`. The tighter Shutter limit governs the shared feast capacity. [Mock implementation](../../packages/core/src/timelock/mock.ts), [Web Crypto AES-GCM encryption](https://w3c.github.io/webcrypto/#aes-gcm-operations).

## Offline execution results

The public Chiado and mainnet adapters used the actual installed CommonJS SDK and the recorded 32-byte time identity/eon key in [shutter-encryption.json](../../packages/core/test/fixtures/shutter-encryption.json). Both produced equal ciphertexts with fixed fixture randomness. The mock used a fixed test key and successfully decrypted every measured payload. These are encryption tests with fixtures; there were no registrations, live API calls or chain transactions.

| Targets | Crumbs | Kind | Maximum plaintext bytes | Shutter bytes | Mock bytes |
|---:|---:|---|---:|---:|---:|
| 10 | 1,000 | Options | 987 | 1,121 | 1,015 |
| 49 | 10 | Options | 3,815 | 3,969 | 3,843 |
| 49 | 100 | Options | 3,824 | 3,969 | 3,852 |
| 49 | 1,000 | Options | 3,868 | 4,001 | 3,896 |
| 50 | 1,000 | Options | 3,942 | 4,097 | 3,970 |
| 49 | 1,000 | People | 3,867 | 4,001 | 3,895 |
| 50 | 1,000 | People | 3,941 | 4,097 | 3,969 |

An independent dynamic program computed the maximum decimal-digit sum for every total from 10 through 1,000 at each target count from 1 through 49: 48,559 combinations. Its recurrence considers every allowed amount for the next target, so it covers all complete allocations for each pair. Every computed maximum fit the Shutter formula; the largest plaintext was 3,868 bytes. The experiment blocked fetch, HTTP, HTTPS and socket connection entry points; the network-attempt counter was zero.

## Reproduce

After `bun run build`, run this from the repository root with Node 22.22.1. The SDK's CommonJS entry is intentional; its native Node ESM limitation is recorded in [the prior crypto execution research](shutter-sdk-crypto.md).

```sh
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { canonicalJSON } from '@critter-crumbs/shared';
import { createChiadoTimelock, createMainnetTimelock, createMockTimelock } from '@critter-crumbs/core';
const require = createRequire(import.meta.url);
let attempts = 0;
const deny = () => { attempts++; throw new Error('Network forbidden'); };
globalThis.fetch = deny;
for (const name of ['node:http', 'node:https']) {
  require(name).request = deny; require(name).get = deny;
}
require('node:net').Socket.prototype.connect = deny;
const sdk = require('@shutter-network/shutter-sdk');
const fixture = JSON.parse(readFileSync('packages/core/test/fixtures/shutter-encryption.json', 'utf8'));
const params = { identity: fixture.fixture.identity, eon: fixture.fixture.eon, eonKey: fixture.fixture.eon_key };
const random = length => new Uint8Array(length).fill(0x22);
const real = [createChiadoTimelock, createMainnetTimelock].map(create => create({ sdk: async () => sdk, random }));
const mock = createMockTimelock({ clock: () => 0, random });
const key = new Uint8Array(32).fill(0x33);
for (const n of [49, 50]) {
  const amounts = [n === 49 ? 160 : 150, 100, 100, 100, 100, ...Array(n - 5).fill(10)];
  const payload = { v: 1, feast: '12345678-1234-1234-1234-123456789012',
    scatterer: `0x${'12'.repeat(20)}`, participants: `0x${'ab'.repeat(32)}`, nonce: '1234567890123456',
    allocation: amounts.map((value, i) => [`0x${i.toString(16).padStart(64, '0')}`, value]) };
  const plaintext = new TextEncoder().encode(canonicalJSON(payload));
  const shutter = await real[0].encrypt(plaintext, params);
  assert.deepEqual(await real[1].encrypt(plaintext, params), shutter);
  const encrypted = await mock.encrypt(plaintext, { ...params, eon: 0, eonKey: `0x${Buffer.from(key).toString('hex')}` });
  assert.deepEqual(await mock.decrypt(encrypted, key), plaintext);
  assert.equal(shutter.length, 129 + 32 * (Math.floor(plaintext.length / 32) + 1));
  assert.equal(encrypted.length, plaintext.length + 28);
  console.log({ targets: n, plaintext: plaintext.length, shutter: shutter.length, mock: encrypted.length });
}
let previous = new Int16Array(1001).fill(-10000), checked = 0, maximum = 0;
previous[0] = 0;
for (let n = 1; n <= 49; n++) {
  const current = new Int16Array(1001).fill(-10000);
  for (let total = 0; total <= 1000; total++) {
    for (let amount = 0; amount <= total; amount++) {
      current[total] = Math.max(current[total], previous[total - amount] + String(amount).length);
    }
    if (total >= 10) {
      const bytes = 237 + 72 * n + current[total];
      assert.ok(129 + 32 * (Math.floor(bytes / 32) + 1) <= 4096);
      maximum = Math.max(maximum, bytes); checked++;
    }
  }
  previous = current;
}
assert.equal(maximum, 3868);
assert.equal(attempts, 0);
console.log({ checked, maximum, networkAttempts: attempts });
NODE
```

Expected measurements are `{ targets: 49, plaintext: 3868, shutter: 4001, mock: 3896 }`, `{ targets: 50, plaintext: 3942, shutter: 4097, mock: 3970 }` and `{ checked: 48559, maximum: 3868, networkAttempts: 0 }`. The SDK also prints initialization messages. The fetched pinned `crypto.ts` has SHA-256 `0e3159347daca14a7c158bc26f5299689d2fd5f8850b89ddc0beca00a2e76c12`.

The capacity decision should limit **targets**, not restrict which valid distribution a person may choose. Enforce the option count before feast creation and the people count before a feast can gather/open or gain another eligible member. This allows the store to remain unaware of allocation plaintext.
