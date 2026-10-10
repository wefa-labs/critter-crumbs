import { expect, test } from 'vitest';
import { createLocalShutterTimelock } from '../../scripts/local-shutter.js';

const secret = 'local-shutter-secret-for-tests-only-32', text = '{"v":1,"allocation":[["0x01",60],["0x02",40]]}';
const feast = '6f3d1b9e-2f64-4c7a-9a55-0d1f6f0c2a11', another = '0b9c0a36-7f1e-4a5b-8f0e-3c9d5f6a7b22';
const read = (bytes: Uint8Array) => new TextDecoder('utf-8', { fatal: true }).decode(bytes);

test('a scatter encrypted by the Shutter SDK opens with the key made locally for its identity, and only once its time has come', async () => {
  let now = 1000;
  const timelock = createLocalShutterTimelock({ secret, clock: () => now });
  const registration = await timelock.register(feast, 2000);
  expect((registration.eonKey.length - 2) / 2).toBe(96);
  const ciphertext = await timelock.encrypt(new TextEncoder().encode(text), registration);

  expect(await timelock.getKey(registration.identity)).toBeNull();
  now = 2000;
  const key = await timelock.getKey(registration.identity);
  expect(key).toHaveLength(48);
  expect(read(await timelock.decrypt(ciphertext, key!))).toBe(text);
}, 120000);

test('the key for another identity does not open it, and a second server with the same secret makes the same keys', async () => {
  const timelock = createLocalShutterTimelock({ secret, clock: () => 5000 });
  const registration = await timelock.register(feast, 2000), other = await timelock.register(another, 2000);
  const ciphertext = await timelock.encrypt(new TextEncoder().encode(text), registration);
  const opened = await timelock.decrypt(ciphertext, (await timelock.getKey(other.identity))!).then(read, () => null);
  expect(opened).not.toBe(text);

  // A restarted server knows the identity only through its lookup, as the store's does.
  const restarted = createLocalShutterTimelock({ secret, clock: () => 5000, lookup: async identity => identity === registration.identity ? { feastId: feast, decryptionTimestamp: 2000 } : null });
  expect(read(await timelock.decrypt(ciphertext, (await restarted.getKey(registration.identity))!))).toBe(text);
  expect(await restarted.getKey(other.identity)).toBeNull();
}, 120000);

test('releasing an identity early gives its key before its time, as the rehearsal controls do', async () => {
  const timelock = createLocalShutterTimelock({ secret, clock: () => 1000 });
  const registration = await timelock.register(feast, 2000);
  expect(await timelock.getKey(registration.identity)).toBeNull();
  timelock.release(registration.identity);
  expect(await timelock.getKey(registration.identity)).toHaveLength(48);
}, 120000);
