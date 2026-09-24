import { createChiadoTimelock, createMainnetTimelock, createMockTimelock, type ShutterSDK } from '@critter-crumbs/core';
import { canonicalJSON, MAX_FEAST_TARGETS, MAX_CIPHERTEXT_BYTES, type Hex } from '@critter-crumbs/shared';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { bytesToHex, hexToBytes } from 'viem';
import { expect, test } from 'vitest';
const require = createRequire(import.meta.url);
const encryption = JSON.parse(readFileSync(new URL('./fixtures/shutter-encryption.json', import.meta.url), 'utf8'));
const decryption = JSON.parse(readFileSync(new URL('./fixtures/shutter-sdk.json', import.meta.url), 'utf8'));
const sdk = async () => require('@shutter-network/shutter-sdk') as ShutterSDK;

test('timelock SDK encryption matches a pinned 32-byte time identity and survives concurrent cold starts', async () => {
  const config = { sdk, random: () => hexToBytes(encryption.sigma) };
  const adapters = [createChiadoTimelock(config), createMainnetTimelock(config)];
  const results = await Promise.all(adapters.map(adapter => adapter.encrypt(hexToBytes(encryption.message), { identity: encryption.fixture.identity, eon: encryption.fixture.eon, eonKey: encryption.fixture.eon_key })));
  expect(results.map(value => bytesToHex(value))).toEqual([encryption.ciphertext, encryption.ciphertext]);
});
test('timelock decrypt matches the independent upstream SDK ciphertext and key vector', async () => {
  const adapter = createChiadoTimelock({ sdk });
  expect(bytesToHex(await adapter.decrypt(hexToBytes(decryption.ciphertext), hexToBytes(decryption.decryptionKey)))).toBe(decryption.message);
});

test('timelock capacity fits every supported target at the largest valid payload and exposes the next-target overflow', async () => {
  // Independent maximum-size allocations and byte counts: research/scatter-capacity.md.
  const params = { identity: encryption.fixture.identity, eon: encryption.fixture.eon, eonKey: encryption.fixture.eon_key };
  for (const [count, plaintextBytes, shutterBytes, mockBytes] of [[MAX_FEAST_TARGETS, 3868, 4001, 3896], [MAX_FEAST_TARGETS + 1, 3942, 4097, 3970]] as const) {
    const amounts = [count === MAX_FEAST_TARGETS ? 160 : 150, 100, 100, 100, 100, ...Array<number>(count - 5).fill(10)];
    const plaintext = new TextEncoder().encode(canonicalJSON({ v: 1, feast: '00000000-0000-4000-8000-000000000001', scatterer: `0x${'11'.repeat(20)}`, participants: `0x${'22'.repeat(32)}`, nonce: '0123456789abcdef',
      allocation: amounts.map((amount, i) => [`0x${i.toString(16).padStart(64, '0')}`, amount]) }));
    expect(amounts.reduce((sum, value) => sum + value, 0)).toBe(1000);
    expect(plaintext).toHaveLength(plaintextBytes);
    for (const adapter of [createChiadoTimelock({ sdk }), createMainnetTimelock({ sdk })]) {
      const ciphertext = await adapter.encrypt(plaintext, params);
      expect(ciphertext).toHaveLength(shutterBytes);
      expect(ciphertext.length <= MAX_CIPHERTEXT_BYTES).toBe(count === MAX_FEAST_TARGETS);
    }
    const mock = createMockTimelock({ clock: () => 0 });
    const key = `0x${'33'.repeat(32)}` as Hex;
    const ciphertext = await mock.encrypt(plaintext, { ...params, eonKey: key });
    expect(ciphertext).toHaveLength(mockBytes);
    expect(await mock.decrypt(ciphertext, hexToBytes(key))).toEqual(plaintext);
  }
});
