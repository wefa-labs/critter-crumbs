import { expect, test } from 'vitest';
import { createChiadoTimelock, createMockTimelock, type ShutterSDK, type Timelock } from '@critter-crumbs/core';
import type { Feast, Registration } from '@critter-crumbs/shared';
import { createLocalShutterTimelock, nodeShutterSDK } from '../../../scripts/local-shutter.js';
import { chooseTimelock } from '../src/crypto/timelock.js';

const id = '6f3d1b9e-2f64-4c7a-9a55-0d1f6f0c2a11', closes = 2000, words = new TextEncoder().encode('{"v":1}');
const feastWith = (registration: Registration) => ({ id, status: 'open', gatheringEndsAt: 1000, scatteringEndsAt: closes, registration }) as unknown as Feast;
const rehearsal = () => createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 }).register(id, closes);
const keypers = () => createLocalShutterTimelock({ secret: 'local-shutter-secret-for-tests-only-32', clock: () => closes });
/** Shutter's client code as the page builds it, loaded the way Node can. */
const shutter = (sdk: () => Promise<ShutterSDK> = nodeShutterSDK) => (): Timelock => createChiadoTimelock({ sdk });
const read = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

test('a production build never encrypts for the rehearsal store: its registration is refused, not obeyed', async () => {
  const lock = chooseTimelock({ development: false, feast: feastWith(await rehearsal()), now: () => 1500, shutter: shutter() });
  const registration = await rehearsal();
  await expect((async () => lock.timelock.encrypt(words, registration))()).rejects.toThrow();
}, 120000);

test('a development build runs the rehearsal on the mock, and still opens a finished feast with the store down', async () => {
  const registration = await rehearsal();
  let now = 1500;
  const lock = chooseTimelock({ development: true, feast: feastWith(registration), now: () => now, shutter: () => { throw new Error('Shutter must not be asked'); } });
  await lock.ready();
  const scatter = await lock.timelock.encrypt(words, registration);
  expect(await lock.timelock.getKey(registration.identity)).toBeNull();
  now = closes;
  expect(read(await lock.timelock.decrypt(scatter, (await lock.timelock.getKey(registration.identity))!))).toBe('{"v":1}');
});

test('either build uses Shutter for a real registration, and a scatter made that way opens with the released key', async () => {
  const chain = keypers(), registration = await chain.register(id, closes);
  for (const development of [false, true]) {
    const lock = chooseTimelock({ development, feast: feastWith(registration), now: () => closes, shutter: shutter() });
    await lock.ready();
    const scatter = await lock.timelock.encrypt(words, registration);
    expect(scatter[0]).toBe(3);
    expect(read(await lock.timelock.decrypt(scatter, (await chain.getKey(registration.identity))!))).toBe('{"v":1}');
  }
}, 120000);

test('Shutter must open a known scatter on this device before anything is trusted to it, and a failed check is tried again', async () => {
  const registration = await keypers().register(id, closes), feast = feastWith(registration);
  const real = await nodeShutterSDK();
  let broken = true;
  const flaky = async (): Promise<ShutterSDK> => ({ encryptData: real.encryptData, decrypt: async (ciphertext, key) => broken ? '0xff' : real.decrypt(ciphertext, key) });
  const lock = chooseTimelock({ development: false, feast, now: () => closes, shutter: shutter(flaky) });
  await expect(lock.ready()).rejects.toThrow('self-check');
  broken = false;
  await expect(lock.ready()).resolves.toBeUndefined();

  const missing = async (): Promise<ShutterSDK> => { throw new Error('Failed to load BLST'); };
  await expect(chooseTimelock({ development: false, feast, now: () => closes, shutter: shutter(missing) }).ready()).rejects.toThrow('BLST');
  // Last on purpose: the adapter runs one SDK call at a time, so a call that never answers holds every later one.
  const silent = async (): Promise<ShutterSDK> => ({ encryptData: real.encryptData, decrypt: () => new Promise(() => {}) });
  await expect(chooseTimelock({ development: false, feast, now: () => closes, shutter: shutter(silent), patienceMs: 30 }).ready()).rejects.toThrow('did not answer');
}, 120000);
