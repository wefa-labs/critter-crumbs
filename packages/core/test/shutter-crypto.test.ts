import { createChiadoTimelock, createMainnetTimelock, type ShutterSDK } from '@critter-crumbs/core';
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
